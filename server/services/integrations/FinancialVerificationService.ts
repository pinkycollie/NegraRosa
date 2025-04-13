import { PlaidService } from './PlaidService';
import { StripeService } from './StripeService';
import { validateServiceConfig } from './IntegrationConfig';

/**
 * Integrated service for verifying financial information
 * Combines Plaid (banking) and Stripe (payments) verification
 */
export class FinancialVerificationService {
  private plaidService: PlaidService;
  private stripeService: StripeService;
  private plaidConfigured: boolean = false;
  private stripeConfigured: boolean = false;
  
  constructor() {
    // Check if services are properly configured
    const plaidConfig = validateServiceConfig('plaid');
    const stripeConfig = validateServiceConfig('stripe');
    
    this.plaidConfigured = plaidConfig.isValid;
    this.stripeConfigured = stripeConfig.isValid;
    
    // Log configuration status
    if (!this.plaidConfigured) {
      console.log(`Plaid service not configured. Missing: ${plaidConfig.missingVars.join(', ')}`);
    }
    
    if (!this.stripeConfigured) {
      console.log(`Stripe service not configured. Missing: ${stripeConfig.missingVars.join(', ')}`);
    }
    
    // Initialize services if configured
    if (this.plaidConfigured) {
      this.plaidService = new PlaidService();
    }
    
    if (this.stripeConfigured) {
      this.stripeService = new StripeService();
    }
  }
  
  /**
   * Check if needed services are configured
   * @returns Object indicating which services are available
   */
  checkConfiguration() {
    return {
      plaidConfigured: this.plaidConfigured,
      stripeConfigured: this.stripeConfigured,
      allConfigured: this.plaidConfigured && this.stripeConfigured
    };
  }
  
  /**
   * Create a link token to start the Plaid Link flow
   * @param userId The user's ID in our system
   * @param fullName The user's full name
   * @param email The user's email
   * @returns The link token or error
   */
  async createPlaidLinkToken(userId: number, fullName: string, email: string) {
    if (!this.plaidConfigured) {
      return { error: "Plaid service not configured" };
    }
    
    try {
      const linkToken = await this.plaidService.createLinkToken(userId, fullName, email);
      return { linkToken };
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      return { error: `Failed to create Plaid link token: ${error.message}` };
    }
  }
  
  /**
   * Exchange a public token for access token
   * @param publicToken The public token received from Plaid Link
   * @returns The access token and item ID or error
   */
  async exchangePlaidPublicToken(publicToken: string) {
    if (!this.plaidConfigured) {
      return { error: "Plaid service not configured" };
    }
    
    try {
      const result = await this.plaidService.exchangePublicToken(publicToken);
      return result;
    } catch (error) {
      console.error('Error exchanging Plaid public token:', error);
      return { error: `Failed to exchange Plaid public token: ${error.message}` };
    }
  }
  
  /**
   * Get bank account information for a user
   * @param accessToken The Plaid access token
   * @returns Account information or error
   */
  async getBankAccounts(accessToken: string) {
    if (!this.plaidConfigured) {
      return { error: "Plaid service not configured" };
    }
    
    try {
      const accounts = await this.plaidService.getAccounts(accessToken);
      return { accounts };
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      return { error: `Failed to get bank accounts: ${error.message}` };
    }
  }
  
  /**
   * Create a Stripe payment intent
   * @param amount The amount to charge in cents
   * @param currency The currency code (default: 'usd')
   * @param customerId The Stripe customer ID (optional)
   * @returns The payment intent or error
   */
  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string) {
    if (!this.stripeConfigured) {
      return { error: "Stripe service not configured" };
    }
    
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency, customerId);
      return { paymentIntent };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { error: `Failed to create payment intent: ${error.message}` };
    }
  }
  
  /**
   * Create a Stripe customer
   * @param email Customer email
   * @param name Customer name
   * @param metadata Additional metadata (optional)
   * @returns The customer or error
   */
  async createStripeCustomer(email: string, name: string, metadata?: Record<string, string>) {
    if (!this.stripeConfigured) {
      return { error: "Stripe service not configured" };
    }
    
    try {
      const customer = await this.stripeService.createCustomer(email, name, metadata);
      return { customer };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { error: `Failed to create Stripe customer: ${error.message}` };
    }
  }
  
  /**
   * Verify a bank account owner
   * @param accessToken The Plaid access token
   * @returns Verification result or error
   */
  async verifyBankAccountOwner(accessToken: string) {
    if (!this.plaidConfigured) {
      return { error: "Plaid service not configured" };
    }
    
    try {
      const verificationResult = await this.plaidService.verifyBankAccountOwner(accessToken);
      return { verificationResult };
    } catch (error) {
      console.error('Error verifying bank account owner:', error);
      return { error: `Failed to verify bank account owner: ${error.message}` };
    }
  }
  
  /**
   * Analyze payment method risk
   * @param paymentMethodId The Stripe payment method ID
   * @returns Risk assessment data or error
   */
  async analyzePaymentMethodRisk(paymentMethodId: string) {
    if (!this.stripeConfigured) {
      return { error: "Stripe service not configured" };
    }
    
    try {
      const riskAssessment = await this.stripeService.analyzePaymentMethodRisk(paymentMethodId);
      return { riskAssessment };
    } catch (error) {
      console.error('Error analyzing payment method risk:', error);
      return { error: `Failed to analyze payment method risk: ${error.message}` };
    }
  }
  
  /**
   * Perform a comprehensive financial risk assessment using multiple data sources
   * @param userId The user's ID in our system
   * @param plaidAccessToken The Plaid access token (optional)
   * @param stripeCustomerId The Stripe customer ID (optional)
   * @param paymentMethodId The Stripe payment method ID (optional)
   * @returns Comprehensive risk assessment or error
   */
  async performFinancialRiskAssessment(
    userId: number,
    plaidAccessToken?: string,
    stripeCustomerId?: string,
    paymentMethodId?: string
  ) {
    // Initialize results object
    const results: any = {
      userId,
      overallRiskScore: 50, // Start with neutral risk score
      bankAccountVerified: false,
      paymentMethodVerified: false,
      hasRecurringIncome: false,
      bankAccountAnalysis: null,
      paymentMethodAnalysis: null,
      customerHistoryAnalysis: null,
      recommendations: []
    };
    
    // Track individual risk scores to calculate an average
    const riskScores: number[] = [];
    
    try {
      // Analyze bank account if available
      if (this.plaidConfigured && plaidAccessToken) {
        try {
          // Verify bank account owner
          const { verificationResult } = await this.verifyBankAccountOwner(plaidAccessToken);
          if (verificationResult) {
            results.bankAccountVerified = verificationResult.verification?.isVerified || false;
            
            // Calculate risk score based on bank account data
            const bankRiskAnalysis = await this.plaidService.calculateFinancialRiskScore(plaidAccessToken);
            results.bankAccountAnalysis = bankRiskAnalysis;
            results.hasRecurringIncome = bankRiskAnalysis.factors.hasRecurringDeposits;
            
            // Add bank risk score to our collection
            riskScores.push(bankRiskAnalysis.riskScore);
            
            // Add any recommendations
            results.recommendations = [
              ...results.recommendations,
              ...bankRiskAnalysis.recommendations
            ];
          }
        } catch (error) {
          console.error('Error analyzing bank account:', error);
          results.bankAccountAnalysisError = error.message;
        }
      }
      
      // Analyze payment method if available
      if (this.stripeConfigured && paymentMethodId) {
        try {
          // Analyze payment method risk
          const { riskAssessment } = await this.analyzePaymentMethodRisk(paymentMethodId);
          if (riskAssessment) {
            results.paymentMethodVerified = true;
            results.paymentMethodAnalysis = riskAssessment;
            
            // Add payment method risk score to our collection
            riskScores.push(riskAssessment.riskScore);
          }
        } catch (error) {
          console.error('Error analyzing payment method:', error);
          results.paymentMethodAnalysisError = error.message;
        }
      }
      
      // Analyze customer history if available
      if (this.stripeConfigured && stripeCustomerId) {
        try {
          // Analyze customer transaction history
          const customerHistory = await this.stripeService.analyzeCustomerHistory(stripeCustomerId);
          results.customerHistoryAnalysis = customerHistory;
          
          // Calculate a risk score based on customer history
          let historyRiskScore = 50; // Start with neutral score
          
          if (customerHistory.customerAgeInDays < 30) {
            historyRiskScore += 10; // New customer
          } else if (customerHistory.customerAgeInDays > 365) {
            historyRiskScore -= 10; // Long-term customer
          }
          
          if (customerHistory.successRate > 0.9) {
            historyRiskScore -= 15; // High success rate
          } else if (customerHistory.successRate < 0.5) {
            historyRiskScore += 15; // Low success rate
          }
          
          // Add customer history risk score to our collection
          riskScores.push(historyRiskScore);
        } catch (error) {
          console.error('Error analyzing customer history:', error);
          results.customerHistoryAnalysisError = error.message;
        }
      }
      
      // Calculate overall risk score based on all available data
      if (riskScores.length > 0) {
        const totalRiskScore = riskScores.reduce((sum, score) => sum + score, 0);
        results.overallRiskScore = Math.round(totalRiskScore / riskScores.length);
      }
      
      // Add an overall risk level based on the score
      results.overallRiskLevel = this.getRiskLevelFromScore(results.overallRiskScore);
      
      // Add general recommendations based on overall risk score
      if (results.overallRiskScore > 70) {
        results.recommendations.push('Consider additional verification methods');
        results.recommendations.push('Apply transaction limits initially');
      } else if (results.overallRiskScore < 30) {
        results.recommendations.push('User has strong financial verification');
        results.recommendations.push('Eligible for premium services');
      }
      
      // Remove duplicate recommendations
      results.recommendations = [...new Set(results.recommendations)];
      
      return results;
    } catch (error) {
      console.error('Error performing financial risk assessment:', error);
      return { error: `Failed to perform financial risk assessment: ${error.message}` };
    }
  }
  
  /**
   * Map risk score to a risk level
   * @param score The risk score (0-100)
   * @returns Risk level description
   */
  private getRiskLevelFromScore(score: number): string {
    if (score < 20) return 'Very Low';
    if (score < 40) return 'Low';
    if (score < 60) return 'Medium';
    if (score < 80) return 'High';
    return 'Very High';
  }
}