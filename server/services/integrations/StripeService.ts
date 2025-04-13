import Stripe from 'stripe';
import { getConfig } from './IntegrationConfig';

/**
 * Service for interacting with the Stripe API
 * Handles payment method verification, transaction processing, and identity verification
 */
export class StripeService {
  private client: Stripe;
  
  constructor() {
    // Get configuration
    const config = getConfig('stripe');
    
    // Initialize Stripe client
    this.client = new Stripe(config.clientSecret, {
      apiVersion: '2023-10-16',
    });
  }
  
  /**
   * Create a payment intent
   * @param amount The amount to charge in cents
   * @param currency The currency code (default: 'usd')
   * @param customerId The Stripe customer ID (optional)
   * @returns The payment intent
   */
  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string) {
    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      };
      
      if (customerId) {
        paymentIntentParams.customer = customerId;
      }
      
      const paymentIntent = await this.client.paymentIntents.create(paymentIntentParams);
      
      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }
  
  /**
   * Create a customer
   * @param email Customer email
   * @param name Customer name
   * @param metadata Additional metadata (optional)
   * @returns The customer object
   */
  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    try {
      const customer = await this.client.customers.create({
        email,
        name,
        metadata
      });
      
      return {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }
  
  /**
   * Attach a payment method to a customer
   * @param customerId The customer ID
   * @param paymentMethodId The payment method ID
   * @returns Success status
   */
  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      await this.client.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }
  
  /**
   * List payment methods for a customer
   * @param customerId The customer ID
   * @returns List of payment methods
   */
  async listPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await this.client.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      
      return paymentMethods.data;
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw new Error(`Failed to list payment methods: ${error.message}`);
    }
  }
  
  /**
   * Create a setup intent for safely collecting payment details
   * @param customerId The Stripe customer ID
   * @returns The setup intent
   */
  async createSetupIntent(customerId: string) {
    try {
      const setupIntent = await this.client.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });
      
      return {
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret,
        status: setupIntent.status
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error(`Failed to create setup intent: ${error.message}`);
    }
  }
  
  /**
   * Create a subscription
   * @param customerId The customer ID
   * @param priceId The price ID
   * @returns The subscription
   */
  async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await this.client.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }
  
  /**
   * Analyze payment method risk
   * @param paymentMethodId The payment method ID
   * @returns Risk assessment data
   */
  async analyzePaymentMethodRisk(paymentMethodId: string) {
    try {
      const paymentMethod = await this.client.paymentMethods.retrieve(paymentMethodId);
      
      // Get card details for risk analysis
      const cardDetails = paymentMethod.card;
      if (!cardDetails) {
        throw new Error('No card details available for risk analysis');
      }
      
      // Create a simple risk assessment based on card attributes
      // In production, this would integrate with more sophisticated fraud detection
      const riskFactors = [];
      let riskScore = 50; // Neutral starting point
      
      // Card type risk adjustment
      if (cardDetails.funding === 'credit') {
        riskScore -= 5; // Credit cards slightly lower risk
      } else if (cardDetails.funding === 'prepaid') {
        riskScore += 10; // Prepaid cards slightly higher risk
      }
      
      // Card brand risk adjustment
      const premiumBrands = ['amex', 'visa', 'mastercard'];
      if (premiumBrands.includes(cardDetails.brand)) {
        riskScore -= 5;
      } else {
        riskScore += 5;
        riskFactors.push('Non-premium card brand');
      }
      
      // Check for CVC and postal code
      if (cardDetails.checks?.cvc_check !== 'pass') {
        riskScore += 15;
        riskFactors.push('CVC verification failed or not provided');
      }
      
      if (cardDetails.checks?.address_line1_check !== 'pass') {
        riskScore += 10;
        riskFactors.push('Address verification failed or not provided');
      }
      
      if (cardDetails.checks?.address_postal_code_check !== 'pass') {
        riskScore += 10;
        riskFactors.push('Postal code verification failed or not provided');
      }
      
      // Country risk assessment
      const highRiskCountries = ['AA', 'ZZ']; // Placeholder for actual high-risk countries
      if (highRiskCountries.includes(cardDetails.country || '')) {
        riskScore += 20;
        riskFactors.push('Card issued in high-risk country');
      }
      
      // Normalize risk score to 0-100 range
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      return {
        paymentMethodId,
        riskScore,
        riskLevel: this.getRiskLevelFromScore(riskScore),
        cardType: cardDetails.funding,
        cardBrand: cardDetails.brand,
        expiryMonth: cardDetails.exp_month,
        expiryYear: cardDetails.exp_year,
        last4: cardDetails.last4,
        country: cardDetails.country,
        riskFactors,
      };
    } catch (error) {
      console.error('Error analyzing payment method risk:', error);
      throw new Error(`Failed to analyze payment method risk: ${error.message}`);
    }
  }
  
  /**
   * Check customer transaction history
   * @param customerId The customer ID
   * @returns Transaction history analysis
   */
  async analyzeCustomerHistory(customerId: string) {
    try {
      // Fetch customer data
      const customer = await this.client.customers.retrieve(customerId);
      
      // Get payment intents for this customer
      const paymentIntents = await this.client.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });
      
      // Calculate successful vs. failed transactions
      const totalTransactions = paymentIntents.data.length;
      const successfulTransactions = paymentIntents.data.filter(
        pi => pi.status === 'succeeded'
      ).length;
      
      // Calculate success rate
      const successRate = totalTransactions > 0 
        ? successfulTransactions / totalTransactions
        : 0;
      
      // Determine customer age in days
      const customerCreatedDate = new Date(customer.created * 1000);
      const now = new Date();
      const customerAgeInDays = Math.floor(
        (now.getTime() - customerCreatedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Analyze transaction amounts
      const transactionAmounts = paymentIntents.data
        .filter(pi => pi.status === 'succeeded')
        .map(pi => pi.amount);
      
      const averageTransactionAmount = transactionAmounts.length > 0
        ? transactionAmounts.reduce((sum, amount) => sum + amount, 0) / transactionAmounts.length
        : 0;
      
      const maxTransactionAmount = transactionAmounts.length > 0
        ? Math.max(...transactionAmounts)
        : 0;
      
      return {
        customerId,
        customerCreated: customer.created,
        customerAgeInDays,
        totalTransactions,
        successfulTransactions,
        successRate,
        averageTransactionAmount,
        maxTransactionAmount,
        hasBillingAddress: !!customer.address,
        recentActivity: paymentIntents.data.slice(0, 5).map(pi => ({
          id: pi.id,
          amount: pi.amount,
          status: pi.status,
          created: pi.created,
          paymentMethod: pi.payment_method,
        })),
      };
    } catch (error) {
      console.error('Error analyzing customer history:', error);
      throw new Error(`Failed to analyze customer history: ${error.message}`);
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