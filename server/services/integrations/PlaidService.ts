import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';
import { getConfig } from './IntegrationConfig';

/**
 * Service for interacting with the Plaid API
 * Handles bank account verification, account linking, and transaction history
 */
export class PlaidService {
  private client: PlaidApi;

  constructor() {
    // Get configuration from environment variables
    const config = getConfig('plaid');
    
    if (!config.clientId || !config.clientSecret) {
      throw new Error('Plaid service not properly configured');
    }
    
    // Set up Plaid client with appropriate environment
    const environment = config.additionalConfig?.env || 'sandbox';
    const plaidConfig = new Configuration({
      basePath: PlaidEnvironments[environment],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.clientId,
          'PLAID-SECRET': config.clientSecret,
        },
      },
    });
    
    this.client = new PlaidApi(plaidConfig);
  }
  
  /**
   * Create a link token for initializing Plaid Link
   * @param userId The user's ID in our system
   * @param fullName The user's full name
   * @param email The user's email
   * @returns The link token response
   */
  async createLinkToken(userId: number, fullName: string, email: string) {
    try {
      const response = await this.client.linkTokenCreate({
        user: {
          client_user_id: userId.toString(),
          full_name: fullName,
          email: email,
        },
        client_name: 'NegraRosa Security Framework',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw new Error(`Failed to create link token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Exchange a public token for access token and item ID
   * @param publicToken The public token received from Plaid Link
   * @returns The access token exchange response
   */
  async exchangePublicToken(publicToken: string) {
    try {
      const response = await this.client.itemPublicTokenExchange({
        public_token: publicToken,
      });
      
      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
      };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error(`Failed to exchange public token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get account information for a user
   * @param accessToken The access token for the user's Plaid item
   * @returns The account information
   */
  async getAccounts(accessToken: string) {
    try {
      const response = await this.client.accountsGet({
        access_token: accessToken,
      });
      
      return response.data.accounts;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw new Error(`Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get transaction history for a user
   * @param accessToken The access token for the user's Plaid item
   * @param startDate The start date for transactions (YYYY-MM-DD)
   * @param endDate The end date for transactions (YYYY-MM-DD)
   * @returns The transaction data
   */
  async getTransactions(accessToken: string, startDate: string, endDate: string) {
    try {
      // Use the new Transactions API
      const response = await this.client.transactionsSync({
        access_token: accessToken,
        options: {
          include_personal_finance_category: true,
        },
      });
      
      const transactions = response.data.added.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error(`Failed to get transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get identity verification data for a user
   * @param accessToken The access token for the user's Plaid item
   * @returns The identity data
   */
  async getIdentity(accessToken: string) {
    try {
      const response = await this.client.identityGet({
        access_token: accessToken,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting identity:', error);
      throw new Error(`Failed to get identity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get bank account balance
   * @param accessToken The access token for the user's Plaid item
   * @returns The balance data
   */
  async getBalance(accessToken: string) {
    try {
      const response = await this.client.accountsBalanceGet({
        access_token: accessToken,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get account owner information for verification
   * @param accessToken The access token for the user's Plaid item
   * @returns Data for verification purposes
   */
  async verifyBankAccountOwner(accessToken: string) {
    try {
      // Get account data
      const accountData = await this.getAccounts(accessToken);
      
      // Get identity data
      let identityData;
      try {
        identityData = await this.getIdentity(accessToken);
      } catch (error) {
        console.warn('Identity data not available, continuing with limited verification', error);
        identityData = { accounts: [] };
      }
      
      // Verify account exists and has required info
      const hasValidAccounts = accountData && accountData.length > 0;
      const hasIdentityInfo = identityData && identityData.accounts && identityData.accounts.length > 0;
      
      // Get transaction history for additional verification
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      const startDate = threeMonthsAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      let transactions = [];
      try {
        transactions = await this.getTransactions(accessToken, startDate, endDate);
      } catch (error) {
        console.warn('Transaction data not available, continuing with limited verification', error);
      }
      
      const hasTransactionHistory = transactions.length > 0;
      
      // Calculate account age estimate
      const accountAge = this.estimateAccountAge(transactions);
      
      // Detect recurring deposits for income verification
      const hasRecurringDeposits = this.detectRecurringDeposits(transactions);
      
      return {
        verification: {
          isVerified: hasValidAccounts,
          accountsVerified: hasValidAccounts ? accountData.length : 0,
          hasIdentityInfo,
          hasTransactionHistory,
          hasRecurringDeposits,
          estimatedAccountAgeInDays: accountAge,
        },
        accounts: accountData.map(account => ({
          id: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
        })),
        identityInfo: hasIdentityInfo ? {
          names: Array.from(new Set(identityData.accounts.map(acct => acct.owners).flat().map(owner => owner.names).flat())),
          emails: Array.from(new Set(identityData.accounts.map(acct => acct.owners).flat().map(owner => owner.emails).flat().map(email => email.data))),
          phones: Array.from(new Set(identityData.accounts.map(acct => acct.owners).flat().map(owner => owner.phone_numbers).flat().map(phone => phone.data))),
          addresses: Array.from(new Set(identityData.accounts.map(acct => acct.owners).flat().map(owner => owner.addresses).flat().map(addr => `${addr.data.street}, ${addr.data.city}, ${addr.data.region} ${addr.data.postal_code}`))),
        } : null,
      };
    } catch (error) {
      console.error('Error verifying bank account owner:', error);
      throw new Error(`Failed to verify bank account owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Calculate risk score based on account data
   * @param accessToken The access token for the user's Plaid item
   * @returns Risk assessment data
   */
  async calculateFinancialRiskScore(accessToken: string) {
    try {
      // Get account balances
      const balanceData = await this.getBalance(accessToken);
      
      // Get transaction history
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      const startDate = sixMonthsAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      const transactions = await this.getTransactions(accessToken, startDate, endDate);
      
      // Get account verification data
      const verificationData = await this.verifyBankAccountOwner(accessToken);
      
      // Calculate a risk score based on various factors
      let riskScore = 50; // Start with a neutral risk score
      const riskFactors = [];
      const strengths = [];
      
      // Factor 1: Account balances
      const totalBalance = balanceData.accounts.reduce((sum, account) => sum + account.balances.current, 0);
      if (totalBalance < 100) {
        riskScore += 15;
        riskFactors.push('Low account balance');
      } else if (totalBalance > 1000) {
        riskScore -= 10;
        strengths.push('Healthy account balance');
      }
      
      // Factor 2: Account age
      const accountAge = verificationData.verification.estimatedAccountAgeInDays;
      if (accountAge < 30) {
        riskScore += 20;
        riskFactors.push('New account (less than 30 days old)');
      } else if (accountAge > 180) {
        riskScore -= 15;
        strengths.push('Established account history');
      }
      
      // Factor 3: Transaction volume
      if (transactions.length < 5) {
        riskScore += 10;
        riskFactors.push('Limited transaction history');
      } else if (transactions.length > 20) {
        riskScore -= 5;
        strengths.push('Active account usage');
      }
      
      // Factor 4: Recurring deposits (income)
      if (verificationData.verification.hasRecurringDeposits) {
        riskScore -= 20;
        strengths.push('Regular income detected');
      } else {
        riskScore += 10;
        riskFactors.push('No regular income detected');
      }
      
      // Factor 5: Identity verification
      if (!verificationData.verification.hasIdentityInfo) {
        riskScore += 15;
        riskFactors.push('Limited identity information');
      } else {
        riskScore -= 10;
        strengths.push('Identity information available');
      }
      
      // Ensure score is between 0 and 100
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      // Get risk level based on score
      const riskLevel = this.getRiskLevelFromScore(riskScore);
      
      // Generate recommendations based on risk score
      const recommendations = this.getRecommendationsFromScore(riskScore);
      
      return {
        riskScore,
        riskLevel,
        factors: {
          accountBalance: totalBalance,
          accountAgeInDays: accountAge,
          transactionCount: transactions.length,
          hasRecurringDeposits: verificationData.verification.hasRecurringDeposits,
          hasIdentityInfo: verificationData.verification.hasIdentityInfo,
        },
        riskFactors,
        strengths,
        recommendations,
      };
    } catch (error) {
      console.error('Error calculating financial risk score:', error);
      throw new Error(`Failed to calculate financial risk score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Detect recurring deposits in transaction history
   * @param transactions List of transactions
   * @returns Whether recurring deposits are detected
   */
  private detectRecurringDeposits(transactions: any[]): boolean {
    // Filter for deposit transactions
    const deposits = transactions.filter(t => t.amount < 0); // In Plaid, negative amounts are deposits
    
    if (deposits.length < 2) {
      return false;
    }
    
    // Group by similar amounts (within $1 tolerance)
    const amountGroups: { [key: string]: any[] } = {};
    deposits.forEach(deposit => {
      const amount = Math.abs(deposit.amount);
      let foundGroup = false;
      
      // Check if this amount fits in any existing group
      Object.keys(amountGroups).forEach(groupKey => {
        const groupAmount = parseFloat(groupKey);
        if (Math.abs(amount - groupAmount) < 1) {
          amountGroups[groupKey].push(deposit);
          foundGroup = true;
        }
      });
      
      // If no group found, create a new one
      if (!foundGroup) {
        amountGroups[amount.toString()] = [deposit];
      }
    });
    
    // Check if any group has recurring transactions
    for (const group of Object.values(amountGroups)) {
      if (group.length >= 2) {
        // Sort by date
        group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Check if deposits occur with regular frequency
        const intervals = [];
        for (let i = 1; i < group.length; i++) {
          const daysDiff = Math.floor(
            (new Date(group[i].date).getTime() - new Date(group[i-1].date).getTime()) / (1000 * 60 * 60 * 24)
          );
          intervals.push(daysDiff);
        }
        
        // Check if intervals are consistent (within 3 days tolerance)
        if (intervals.length > 0) {
          const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
          const consistentIntervals = intervals.filter(interval => Math.abs(interval - avgInterval) <= 3);
          
          // If most intervals are consistent and around 14, 15, 28, 30, or 31 days (biweekly or monthly)
          if (consistentIntervals.length >= intervals.length * 0.7 && 
              (Math.abs(avgInterval - 14) <= 2 || Math.abs(avgInterval - 15) <= 2 || 
               Math.abs(avgInterval - 28) <= 3 || Math.abs(avgInterval - 30) <= 3 || 
               Math.abs(avgInterval - 31) <= 3)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Estimate the age of an account based on transaction history
   * @param transactions List of transactions
   * @returns Estimated account age in days
   */
  private estimateAccountAge(transactions: any[]): number {
    if (transactions.length === 0) {
      return 0;
    }
    
    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate days between first transaction and now
    const oldestTransactionDate = new Date(transactions[0].date);
    const now = new Date();
    
    return Math.floor((now.getTime() - oldestTransactionDate.getTime()) / (1000 * 60 * 60 * 24));
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
    const recommendations = [];
    
    if (score > 80) {
      recommendations.push('Consider additional verification methods');
      recommendations.push('Implement strict transaction limits');
      recommendations.push('Require enhanced due diligence');
    } else if (score > 60) {
      recommendations.push('Implement moderate transaction limits');
      recommendations.push('Monitor account activity closely');
      recommendations.push('Request additional documentation if transaction patterns change');
    } else if (score > 40) {
      recommendations.push('Standard transaction limits recommended');
      recommendations.push('Periodic review of account activity');
    } else if (score > 20) {
      recommendations.push('Relaxed transaction limits may be appropriate');
      recommendations.push('Standard monitoring sufficient');
    } else {
      recommendations.push('Minimal risk identified');
      recommendations.push('Consider for premium services');
      recommendations.push('Eligible for higher limits');
    }
    
    return recommendations;
  }
}