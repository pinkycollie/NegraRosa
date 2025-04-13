import { PlaidService } from './PlaidService';
import { StripeService } from './StripeService';
import { validateServiceConfig } from './IntegrationConfig';

/**
 * Interface for financial verification results
 */
export interface FinancialVerificationResult {
  success: boolean;
  score: number;
  riskLevel: string;
  verifiedAt: Date;
  details?: any;
  recommendations?: string[];
  errors?: string[];
}

/**
 * Main service for financial verification
 * Orchestrates verification across multiple financial service providers
 */
export class FinancialVerificationService {
  private plaidService: PlaidService;
  private stripeService: StripeService;
  private availableServices: string[] = [];
  
  constructor() {
    // Check which services are available based on config
    const plaidConfig = validateServiceConfig('plaid');
    const stripeConfig = validateServiceConfig('stripe');
    
    if (plaidConfig.isValid) {
      this.plaidService = new PlaidService();
      this.availableServices.push('plaid');
    } else {
      console.warn(`Plaid service not configured. Missing: ${plaidConfig.missingVars.join(', ')}`);
    }
    
    if (stripeConfig.isValid) {
      this.stripeService = new StripeService();
      this.availableServices.push('stripe');
    } else {
      console.warn(`Stripe service not configured. Missing: ${stripeConfig.missingVars.join(', ')}`);
    }
  }
  
  /**
   * Get available financial service providers
   * @returns List of available service names
   */
  getAvailableServices(): string[] {
    return this.availableServices;
  }
  
  /**
   * Create a link token for Plaid
   * @param userId The user's ID
   * @param fullName The user's full name
   * @param email The user's email
   * @returns The link token response
   */
  async createPlaidLinkToken(userId: number, fullName: string, email: string) {
    this.checkServiceAvailability('plaid');
    return this.plaidService.createLinkToken(userId, fullName, email);
  }
  
  /**
   * Exchange a Plaid public token for an access token
   * @param publicToken The public token received from Plaid Link
   * @returns The access token and item ID
   */
  async exchangePlaidPublicToken(publicToken: string) {
    this.checkServiceAvailability('plaid');
    return this.plaidService.exchangePublicToken(publicToken);
  }
  
  /**
   * Create a Stripe customer
   * @param userId The user's ID
   * @param email The user's email
   * @param name The user's full name
   * @returns The created customer
   */
  async createStripeCustomer(userId: number, email: string, name: string) {
    this.checkServiceAvailability('stripe');
    return this.stripeService.createCustomer(userId, email, name);
  }
  
  /**
   * Get Stripe publishable key
   * @returns The publishable key
   */
  getStripePublishableKey(): string {
    this.checkServiceAvailability('stripe');
    return this.stripeService.getPublishableKey();
  }
  
  /**
   * Create a setup intent for Stripe payment methods
   * @param customerId The Stripe customer ID
   * @returns The setup intent
   */
  async createStripeSetupIntent(customerId: string) {
    this.checkServiceAvailability('stripe');
    return this.stripeService.createSetupIntent(customerId);
  }
  
  /**
   * Verify a bank account through Plaid
   * @param accessToken The Plaid access token
   * @returns Verification result
   */
  async verifyBankAccount(accessToken: string): Promise<FinancialVerificationResult> {
    this.checkServiceAvailability('plaid');
    
    try {
      const verificationData = await this.plaidService.verifyBankAccountOwner(accessToken);
      const riskAssessment = await this.plaidService.calculateFinancialRiskScore(accessToken);
      
      return {
        success: verificationData.verification.isVerified,
        score: 100 - riskAssessment.riskScore, // Convert risk score to verification score
        riskLevel: riskAssessment.riskLevel,
        verifiedAt: new Date(),
        details: {
          accountsCount: verificationData.verification.accountsCount,
          ownersCount: verificationData.verification.ownersCount,
          accounts: verificationData.accounts.map(a => ({
            id: a.account_id,
            name: a.name,
            type: a.type,
            subtype: a.subtype,
            mask: a.mask,
          })),
          owners: verificationData.owners.map(o => ({
            names: o.names,
            addresses: o.addresses,
            emails: o.emails,
            phoneNumbers: o.phone_numbers,
          })),
          riskFactors: riskAssessment.factors
        },
        recommendations: riskAssessment.recommendations
      };
    } catch (error) {
      console.error('Bank account verification failed:', error);
      return {
        success: false,
        score: 0,
        riskLevel: 'Unknown',
        verifiedAt: new Date(),
        errors: [error.message]
      };
    }
  }
  
  /**
   * Verify a payment method through Stripe
   * @param customerId The Stripe customer ID
   * @param paymentMethodId The payment method ID
   * @returns Verification result
   */
  async verifyPaymentMethod(customerId: string, paymentMethodId: string): Promise<FinancialVerificationResult> {
    this.checkServiceAvailability('stripe');
    
    try {
      const verificationResult = await this.stripeService.verifyCardWithSmallAuth(customerId, paymentMethodId);
      const riskAssessment = await this.stripeService.calculatePaymentMethodRiskScore(customerId, paymentMethodId);
      
      return {
        success: verificationResult.isVerified,
        score: 100 - riskAssessment.riskScore, // Convert risk score to verification score
        riskLevel: riskAssessment.riskLevel,
        verifiedAt: new Date(),
        details: {
          ...verificationResult.details,
          ...riskAssessment.factors
        },
        recommendations: riskAssessment.recommendations
      };
    } catch (error) {
      console.error('Payment method verification failed:', error);
      return {
        success: false,
        score: 0,
        riskLevel: 'Unknown',
        verifiedAt: new Date(),
        errors: [error.message]
      };
    }
  }
  
  /**
   * Perform a comprehensive financial verification using multiple providers
   * @param userId The user's ID
   * @param plaidAccessToken The Plaid access token (optional)
   * @param stripeCustomerId The Stripe customer ID (optional)
   * @param stripePaymentMethodId The Stripe payment method ID (optional)
   * @returns Comprehensive verification result
   */
  async performComprehensiveVerification(
    userId: number,
    plaidAccessToken?: string,
    stripeCustomerId?: string,
    stripePaymentMethodId?: string
  ): Promise<{
    success: boolean;
    score: number;
    riskLevel: string;
    verifiedAt: Date;
    verificationMethods: string[];
    details: any;
    recommendations: string[];
    errors?: string[];
  }> {
    const verificationResults: Record<string, FinancialVerificationResult> = {};
    const errors: string[] = [];
    const verificationMethods: string[] = [];
    
    // Perform bank account verification if possible
    if (this.availableServices.includes('plaid') && plaidAccessToken) {
      try {
        verificationResults.bankAccount = await this.verifyBankAccount(plaidAccessToken);
        if (verificationResults.bankAccount.success) {
          verificationMethods.push('plaid_bank_account');
        }
      } catch (error) {
        errors.push(`Bank account verification failed: ${error.message}`);
      }
    }
    
    // Perform payment method verification if possible
    if (this.availableServices.includes('stripe') && stripeCustomerId && stripePaymentMethodId) {
      try {
        verificationResults.paymentMethod = await this.verifyPaymentMethod(
          stripeCustomerId,
          stripePaymentMethodId
        );
        if (verificationResults.paymentMethod.success) {
          verificationMethods.push('stripe_payment_method');
        }
      } catch (error) {
        errors.push(`Payment method verification failed: ${error.message}`);
      }
    }
    
    // Calculate combined score and risk level
    let totalScore = 0;
    let successCount = 0;
    const allRecommendations = new Set<string>();
    
    for (const result of Object.values(verificationResults)) {
      if (result.success) {
        totalScore += result.score;
        successCount++;
        result.recommendations?.forEach(rec => allRecommendations.add(rec));
      }
    }
    
    const averageScore = successCount > 0 ? totalScore / successCount : 0;
    const success = successCount > 0; // Success if at least one verification method succeeded
    
    return {
      success,
      score: averageScore,
      riskLevel: this.getRiskLevelFromScore(averageScore),
      verifiedAt: new Date(),
      verificationMethods,
      details: verificationResults,
      recommendations: Array.from(allRecommendations),
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Throw error if service is not available
   * @param serviceName The service name
   */
  private checkServiceAvailability(serviceName: string) {
    if (!this.availableServices.includes(serviceName)) {
      throw new Error(`Financial service ${serviceName} is not available. Check your configuration.`);
    }
  }
  
  /**
   * Map verification score to a risk level
   * @param score The verification score (0-100)
   * @returns Risk level description
   */
  private getRiskLevelFromScore(score: number): string {
    if (score < 20) return 'Very High';
    if (score < 40) return 'High';
    if (score < 60) return 'Medium';
    if (score < 80) return 'Low';
    return 'Very Low';
  }
}