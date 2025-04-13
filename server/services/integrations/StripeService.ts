import Stripe from 'stripe';
import { getConfig } from './IntegrationConfig';

/**
 * Service for interacting with the Stripe API
 * Handles payment method verification, card verification, and bank account verification
 */
export class StripeService {
  private client: Stripe;
  private publishableKey: string;
  
  constructor() {
    // Get configuration
    const config = getConfig('stripe');
    
    // Initialize Stripe client
    this.client = new Stripe(config.clientSecret, {
      apiVersion: '2023-10-16',
    });
    
    this.publishableKey = config.additionalConfig?.publishableKey || '';
  }
  
  /**
   * Get the Stripe publishable key (safe for frontend)
   * @returns The publishable key
   */
  getPublishableKey(): string {
    return this.publishableKey;
  }
  
  /**
   * Create a new customer in Stripe
   * @param userId The user's ID in our system
   * @param email The user's email
   * @param name The user's full name
   * @param metadata Any additional metadata
   * @returns The created customer
   */
  async createCustomer(userId: number, email: string, name: string, metadata: Record<string, string> = {}) {
    try {
      const customer = await this.client.customers.create({
        email,
        name,
        metadata: {
          userId: userId.toString(),
          ...metadata
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }
  
  /**
   * Create a setup intent for adding a payment method
   * @param customerId The Stripe customer ID
   * @param metadata Any additional metadata
   * @returns The setup intent
   */
  async createSetupIntent(customerId: string, metadata: Record<string, string> = {}) {
    try {
      const setupIntent = await this.client.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        metadata
      });
      
      return setupIntent;
    } catch (error) {
      console.error('Error creating Stripe setup intent:', error);
      throw new Error(`Failed to create Stripe setup intent: ${error.message}`);
    }
  }
  
  /**
   * Retrieve a setup intent
   * @param setupIntentId The setup intent ID
   * @returns The setup intent
   */
  async getSetupIntent(setupIntentId: string) {
    try {
      const setupIntent = await this.client.setupIntents.retrieve(setupIntentId);
      return setupIntent;
    } catch (error) {
      console.error('Error retrieving Stripe setup intent:', error);
      throw new Error(`Failed to retrieve Stripe setup intent: ${error.message}`);
    }
  }
  
  /**
   * Retrieve a customer's payment methods
   * @param customerId The Stripe customer ID
   * @param type The payment method type (card, bank_account, etc.)
   * @returns List of payment methods
   */
  async getPaymentMethods(customerId: string, type: string = 'card') {
    try {
      const paymentMethods = await this.client.paymentMethods.list({
        customer: customerId,
        type
      });
      
      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving Stripe payment methods:', error);
      throw new Error(`Failed to retrieve Stripe payment methods: ${error.message}`);
    }
  }
  
  /**
   * Create a payment intent for payment method verification
   * @param customerId The Stripe customer ID
   * @param amount The amount to charge (usually a small amount)
   * @param currency The currency code
   * @param paymentMethodId The payment method ID
   * @param metadata Any additional metadata
   * @returns The payment intent
   */
  async createVerificationPaymentIntent(
    customerId: string, 
    amount: number, 
    currency: string = 'usd',
    paymentMethodId?: string,
    metadata: Record<string, string> = {}
  ) {
    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency,
        customer: customerId,
        confirm: !!paymentMethodId,
        metadata: {
          purpose: 'verification',
          ...metadata
        },
        capture_method: 'manual' // Don't actually capture the payment
      };
      
      if (paymentMethodId) {
        paymentIntentParams.payment_method = paymentMethodId;
      }
      
      const paymentIntent = await this.client.paymentIntents.create(paymentIntentParams);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating Stripe verification payment intent:', error);
      throw new Error(`Failed to create Stripe verification payment intent: ${error.message}`);
    }
  }
  
  /**
   * Cancel a payment intent (e.g., after verification)
   * @param paymentIntentId The payment intent ID
   * @returns The canceled payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.client.paymentIntents.cancel(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error canceling Stripe payment intent:', error);
      throw new Error(`Failed to cancel Stripe payment intent: ${error.message}`);
    }
  }
  
  /**
   * Verify a card through a small authorization
   * @param customerId The Stripe customer ID
   * @param paymentMethodId The payment method ID
   * @returns The verification result
   */
  async verifyCardWithSmallAuth(customerId: string, paymentMethodId: string) {
    try {
      // Attach payment method to customer if not already attached
      await this.client.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Create a small authorization payment intent
      const paymentIntent = await this.createVerificationPaymentIntent(
        customerId,
        50, // $0.50
        'usd',
        paymentMethodId,
        { verification_type: 'small_auth' }
      );
      
      // Check if authorization succeeded
      const isVerified = ['succeeded', 'requires_capture'].includes(paymentIntent.status);
      
      // Cancel the payment intent regardless of outcome
      if (isVerified) {
        await this.client.paymentIntents.cancel(paymentIntent.id);
      }
      
      return {
        isVerified,
        paymentMethodId,
        customerId,
        details: {
          cardType: paymentIntent.payment_method_details?.card?.brand,
          last4: paymentIntent.payment_method_details?.card?.last4,
          expiryMonth: paymentIntent.payment_method_details?.card?.exp_month,
          expiryYear: paymentIntent.payment_method_details?.card?.exp_year
        },
        message: isVerified ? 'Card verified successfully' : 'Card verification failed'
      };
    } catch (error) {
      console.error('Error verifying card:', error);
      return {
        isVerified: false,
        paymentMethodId,
        customerId,
        details: null,
        message: `Card verification failed: ${error.message}`
      };
    }
  }
  
  /**
   * Calculate a payment method risk score
   * @param customerId The Stripe customer ID
   * @param paymentMethodId The payment method ID
   * @returns The risk assessment result
   */
  async calculatePaymentMethodRiskScore(customerId: string, paymentMethodId: string) {
    try {
      // Get customer details
      const customer = await this.client.customers.retrieve(customerId);
      
      // Get payment method details
      const paymentMethod = await this.client.paymentMethods.retrieve(paymentMethodId);
      
      // Get payment method history (if any)
      const paymentIntents = await this.client.paymentIntents.list({
        customer: customerId,
        limit: 100
      });
      
      // Calculate various risk factors
      let riskScore = 50; // Start at neutral
      
      // Factor 1: Customer history
      if (customer.created) {
        const accountAgeDays = (Date.now() - customer.created * 1000) / (24 * 60 * 60 * 1000);
        if (accountAgeDays < 1) {
          riskScore += 20; // Very new account
        } else if (accountAgeDays < 7) {
          riskScore += 10; // New account
        } else if (accountAgeDays > 90) {
          riskScore -= 10; // Established account
        }
      }
      
      // Factor 2: Payment method type
      if (paymentMethod.type === 'card') {
        const card = paymentMethod.card;
        if (card) {
          // Higher risk for certain card types
          if (['prepaid', 'unknown'].includes(card.funding)) {
            riskScore += 15;
          }
          
          // Lower risk for higher security cards
          if (card.checks?.cvc_check === 'pass' && card.checks?.address_line1_check === 'pass') {
            riskScore -= 10;
          }
        }
      }
      
      // Factor 3: Payment history
      const successfulPayments = paymentIntents.data.filter(pi => pi.status === 'succeeded').length;
      if (successfulPayments > 10) {
        riskScore -= 15; // Many successful payments
      } else if (successfulPayments > 5) {
        riskScore -= 10; // Several successful payments
      } else if (successfulPayments > 0) {
        riskScore -= 5; // At least one successful payment
      }
      
      const failedPayments = paymentIntents.data.filter(pi => ['failed', 'canceled'].includes(pi.status)).length;
      if (failedPayments > 3) {
        riskScore += 20; // Multiple failed payments
      } else if (failedPayments > 0) {
        riskScore += 5; // Some failed payments
      }
      
      // Normalize to 0-100 range
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      return {
        riskScore,
        riskLevel: this.getRiskLevelFromScore(riskScore),
        factors: {
          paymentMethodType: paymentMethod.type,
          customerAge: customer.created ? new Date(customer.created * 1000).toISOString() : null,
          successfulPayments,
          failedPayments
        },
        recommendations: this.getRecommendationsFromScore(riskScore)
      };
    } catch (error) {
      console.error('Error calculating payment method risk score:', error);
      throw new Error(`Failed to calculate payment method risk score: ${error.message}`);
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
  
  /**
   * Get recommendations based on risk score
   * @param score The risk score (0-100)
   * @returns List of recommendations
   */
  private getRecommendationsFromScore(score: number): string[] {
    const recommendations: string[] = [];
    
    if (score > 60) {
      recommendations.push('Consider additional verification steps');
    }
    
    if (score > 70) {
      recommendations.push('Limit initial transaction amounts');
      recommendations.push('Verify billing address matches shipping address');
    }
    
    if (score > 80) {
      recommendations.push('Require full identity verification before proceeding');
      recommendations.push('Monitor account closely for unusual activity');
    }
    
    return recommendations;
  }
}