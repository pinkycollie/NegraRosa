import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode, BankTransferType } from 'plaid';
import { getConfig, getPlaidEnvironment } from './IntegrationConfig';

/**
 * Service for interacting with the Plaid API
 * Handles bank account verification, account linking, and transaction history
 */
export class PlaidService {
  private client: PlaidApi;
  
  constructor() {
    // Get configuration
    const config = getConfig('plaid');
    const environment = getPlaidEnvironment();
    
    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[environment],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.clientId,
          'PLAID-SECRET': config.clientSecret,
          'Plaid-Version': config.apiVersion || '2020-09-14',
        },
      },
    });
    
    this.client = new PlaidApi(configuration);
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
          legal_name: fullName,
          email_address: email
        },
        client_name: 'NegraRosa Inclusive Security',
        products: ['auth', 'transactions', 'identity', 'assets'] as Products[],
        country_codes: ['US'] as CountryCode[],
        language: 'en',
        webhook: `${process.env.API_BASE_URL}/api/webhooks/plaid`,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw new Error(`Failed to create Plaid link token: ${error.message}`);
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
        public_token: publicToken
      });
      
      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id
      };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error(`Failed to exchange Plaid public token: ${error.message}`);
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
        access_token: accessToken
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Plaid accounts:', error);
      throw new Error(`Failed to fetch Plaid accounts: ${error.message}`);
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
      // Initialize fetch
      const response = await this.client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 100,
          offset: 0,
        }
      });
      
      let transactions = response.data.transactions;
      const total = response.data.total_transactions;
      
      // Fetch all transactions if there are more
      while (transactions.length < total) {
        const paginatedResponse = await this.client.transactionsGet({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          options: {
            count: 100,
            offset: transactions.length,
          }
        });
        
        transactions = transactions.concat(paginatedResponse.data.transactions);
      }
      
      return {
        accounts: response.data.accounts,
        transactions
      };
    } catch (error) {
      console.error('Error fetching Plaid transactions:', error);
      throw new Error(`Failed to fetch Plaid transactions: ${error.message}`);
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
        access_token: accessToken
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Plaid identity:', error);
      throw new Error(`Failed to fetch Plaid identity: ${error.message}`);
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
        access_token: accessToken
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Plaid balance:', error);
      throw new Error(`Failed to fetch Plaid balance: ${error.message}`);
    }
  }
  
  /**
   * Get account owner information for verification
   * @param accessToken The access token for the user's Plaid item
   * @returns Data for verification purposes
   */
  async verifyBankAccountOwner(accessToken: string) {
    try {
      // Get identity information
      const identityResponse = await this.client.identityGet({
        access_token: accessToken
      });
      
      // Get account information
      const accountsResponse = await this.client.accountsGet({
        access_token: accessToken
      });
      
      // Extract the account owner information
      const owners = identityResponse.data.accounts
        .flatMap(account => account.owners)
        .filter((owner, index, self) => 
          index === self.findIndex(o => o.names[0] === owner.names[0])
        );
      
      return {
        accounts: accountsResponse.data.accounts,
        owners,
        verification: {
          isVerified: owners.length > 0,
          ownersCount: owners.length,
          accountsCount: accountsResponse.data.accounts.length
        }
      };
    } catch (error) {
      console.error('Error verifying bank account owner:', error);
      throw new Error(`Failed to verify bank account owner: ${error.message}`);
    }
  }
  
  /**
   * Calculate risk score based on account data
   * @param accessToken The access token for the user's Plaid item
   * @returns Risk assessment data
   */
  async calculateFinancialRiskScore(accessToken: string) {
    try {
      // Get multiple data points for risk assessment
      const [
        balance,
        transactions,
        identity
      ] = await Promise.all([
        this.getBalance(accessToken),
        this.getTransactions(accessToken, 
          // Last 90 days
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          new Date().toISOString().split('T')[0]
        ),
        this.getIdentity(accessToken)
      ]);
      
      // Calculate risk factors
      const totalBalance = balance.accounts.reduce((sum, account) => sum + account.balances.available, 0);
      const accountAge = this.estimateAccountAge(transactions.transactions);
      const transactionFrequency = transactions.transactions.length / 90; // Transactions per day
      const hasRecurringDeposits = this.detectRecurringDeposits(transactions.transactions);
      const identityVerified = identity.accounts.length > 0 && identity.accounts[0].owners.length > 0;
      
      // Calculate a simple risk score (0-100, lower is less risky)
      let riskScore = 0;
      
      // Factor 1: Account balance
      if (totalBalance < 100) {
        riskScore += 20;
      } else if (totalBalance < 1000) {
        riskScore += 10;
      } else if (totalBalance > 10000) {
        riskScore -= 10;
      }
      
      // Factor 2: Account age
      if (accountAge < 30) {
        riskScore += 20;
      } else if (accountAge < 90) {
        riskScore += 10;
      } else if (accountAge > 365) {
        riskScore -= 10;
      }
      
      // Factor 3: Transaction frequency
      if (transactionFrequency < 0.1) { // Less than one transaction per 10 days
        riskScore += 15;
      } else if (transactionFrequency > 5) { // More than 5 transactions per day
        riskScore += 5;
      } else if (transactionFrequency > 1 && transactionFrequency < 3) {
        riskScore -= 5; // Healthy transaction rate
      }
      
      // Factor 4: Recurring deposits
      if (hasRecurringDeposits) {
        riskScore -= 15;
      } else {
        riskScore += 15;
      }
      
      // Factor 5: Identity verification
      if (!identityVerified) {
        riskScore += 20;
      } else {
        riskScore -= 10;
      }
      
      // Normalize and constrain
      riskScore = Math.max(0, Math.min(100, riskScore + 50));
      
      return {
        riskScore,
        factors: {
          totalBalance,
          accountAge,
          transactionFrequency,
          hasRecurringDeposits,
          identityVerified
        },
        riskLevel: this.getRiskLevelFromScore(riskScore),
        recommendations: this.getRecommendationsFromScore(riskScore)
      };
    } catch (error) {
      console.error('Error calculating financial risk score:', error);
      throw new Error(`Failed to calculate financial risk score: ${error.message}`);
    }
  }
  
  /**
   * Detect recurring deposits in transaction history
   * @param transactions List of transactions
   * @returns Whether recurring deposits are detected
   */
  private detectRecurringDeposits(transactions: any[]): boolean {
    // Filter for deposits (positive amounts)
    const deposits = transactions.filter(t => t.amount > 0);
    
    // Group by similar amounts (within 10%)
    const amountGroups = new Map<number, any[]>();
    
    deposits.forEach(deposit => {
      let foundGroup = false;
      
      for (const [amount, group] of amountGroups.entries()) {
        // Check if amount is within 10% of group key
        const difference = Math.abs(deposit.amount - amount) / amount;
        if (difference <= 0.1) {
          group.push(deposit);
          foundGroup = true;
          break;
        }
      }
      
      if (!foundGroup) {
        amountGroups.set(deposit.amount, [deposit]);
      }
    });
    
    // Check if any group has at least 2 transactions and occurs at regular intervals
    for (const group of amountGroups.values()) {
      if (group.length >= 2) {
        const dates = group.map(t => new Date(t.date).getTime())
          .sort((a, b) => a - b);
        
        // Calculate intervals between dates
        const intervals = [];
        for (let i = 1; i < dates.length; i++) {
          intervals.push(dates[i] - dates[i - 1]);
        }
        
        // Check if intervals are regular (within 3 days)
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const intervalConsistency = intervals.every(interval => 
          Math.abs(interval - avgInterval) <= 3 * 24 * 60 * 60 * 1000
        );
        
        if (intervalConsistency) {
          return true;
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
    
    // Find oldest transaction date
    const dates = transactions.map(t => new Date(t.date).getTime());
    const oldestDate = new Date(Math.min(...dates));
    
    // Calculate days between oldest transaction and now
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000));
    
    return ageInDays;
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
      recommendations.push('Consider additional identity verification');
    }
    
    if (score > 70) {
      recommendations.push('Verify phone number and address');
      recommendations.push('Request government ID verification');
    }
    
    if (score > 80) {
      recommendations.push('Limit transaction amounts until further history is established');
      recommendations.push('Implement a probationary period for new accounts');
    }
    
    return recommendations;
  }
}