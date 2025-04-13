import { 
  Configuration, 
  PlaidApi, 
  PlaidEnvironments,
  CountryCode,
  Products,
  AccountBase,
  AccountsGetResponse
} from 'plaid';
import { getConfig } from './IntegrationConfig';

/**
 * Service for interacting with the Plaid API
 * Handles bank account verification, account linking, and transaction history
 */
export class PlaidService {
  private client: PlaidApi;
  
  constructor() {
    // Get configuration
    const config = getConfig('plaid');
    
    // Determine environment URL
    const environment = (config.additionalConfig?.environment || 'sandbox').toLowerCase();
    const envUrl = environment === 'production' 
      ? PlaidEnvironments.production 
      : environment === 'development' 
        ? PlaidEnvironments.development 
        : PlaidEnvironments.sandbox;
    
    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: envUrl,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.clientId || '',
          'PLAID-SECRET': config.clientSecret,
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
        client_name: 'NegraRosa Inclusive Security Framework',
        products: [Products.Auth, Products.Transactions, Products.Identity],
        country_codes: [CountryCode.Us],
        language: 'en',
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
        public_token: publicToken,
      });
      
      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
      };
    } catch (error) {
      console.error('Error exchanging Plaid public token:', error);
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
        access_token: accessToken,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting Plaid accounts:', error);
      throw new Error(`Failed to get Plaid accounts: ${error.message}`);
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
      // Initialize transactions with first batch
      const response = await this.client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 100,
          offset: 0,
        },
      });
      
      let transactions = response.data.transactions;
      const totalTransactions = response.data.total_transactions;
      
      // Fetch all transactions if there are more
      while (transactions.length < totalTransactions) {
        const paginatedResponse = await this.client.transactionsGet({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          options: {
            count: 100,
            offset: transactions.length,
          },
        });
        
        transactions = transactions.concat(paginatedResponse.data.transactions);
      }
      
      return {
        accounts: response.data.accounts,
        transactions,
        totalTransactions,
        item: response.data.item,
      };
    } catch (error) {
      console.error('Error getting Plaid transactions:', error);
      throw new Error(`Failed to get Plaid transactions: ${error.message}`);
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
      console.error('Error getting Plaid identity data:', error);
      throw new Error(`Failed to get Plaid identity data: ${error.message}`);
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
      console.error('Error getting Plaid balance data:', error);
      throw new Error(`Failed to get Plaid balance data: ${error.message}`);
    }
  }
  
  /**
   * Get account owner information for verification
   * @param accessToken The access token for the user's Plaid item
   * @returns Data for verification purposes
   */
  async verifyBankAccountOwner(accessToken: string) {
    try {
      // Get accounts
      const accountsResponse = await this.getAccounts(accessToken);
      
      // Get identity information
      const identityResponse = await this.getIdentity(accessToken);
      
      // Determine if verification is successful based on account and identity data
      const accountsCount = accountsResponse.accounts.length;
      const ownersCount = identityResponse.accounts.reduce((total, account) => total + account.owners.length, 0);
      
      // Check if each account has at least the available balance
      const accountsWithBalance = accountsResponse.accounts.filter(account => 
        account.balances.available !== null && account.balances.available > 0
      );
      
      // Simple verification criteria: has accounts with balance and identity information
      const isVerified = accountsCount > 0 && ownersCount > 0 && accountsWithBalance.length > 0;
      
      return {
        verification: {
          isVerified,
          accountsCount,
          ownersCount,
          accountsWithBalanceCount: accountsWithBalance.length,
          timestamp: new Date().toISOString(),
        },
        accounts: accountsResponse.accounts,
        owners: identityResponse.accounts.flatMap(account => account.owners),
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
      // Get transaction history for the last 90 days
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const endDate = now.toISOString().split('T')[0];
      const startDate = ninetyDaysAgo.toISOString().split('T')[0];
      
      const txData = await this.getTransactions(accessToken, startDate, endDate);
      const balanceData = await this.getBalance(accessToken);
      
      // Risk factors to consider
      let riskScore = 50; // Start at neutral
      
      // Factor 1: Account age (estimated from transaction history)
      const accountAgeDays = this.estimateAccountAge(txData.transactions);
      if (accountAgeDays < 30) {
        riskScore += 20; // Very new account
      } else if (accountAgeDays < 90) {
        riskScore += 10; // Relatively new account
      } else if (accountAgeDays > 365) {
        riskScore -= 15; // Well-established account
      }
      
      // Factor 2: Transaction volume and frequency
      const txCount = txData.transactions.length;
      if (txCount < 5) {
        riskScore += 15; // Very low activity
      } else if (txCount > 50) {
        riskScore -= 10; // High activity
      }
      
      // Factor 3: Balance-to-spending ratio
      const totalBalance = balanceData.accounts.reduce((sum, account) => {
        return sum + (account.balances.current || 0);
      }, 0);
      
      const totalSpent = txData.transactions
        .filter(tx => tx.amount > 0) // Only consider outflows
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      if (totalBalance === 0) {
        riskScore += 15; // Zero balance
      } else if (totalSpent > 0) {
        const balanceToSpendingRatio = totalBalance / totalSpent;
        if (balanceToSpendingRatio < 0.2) {
          riskScore += 20; // Very low balance compared to spending
        } else if (balanceToSpendingRatio < 0.5) {
          riskScore += 10; // Low balance compared to spending
        } else if (balanceToSpendingRatio > 3) {
          riskScore -= 15; // High balance compared to spending
        }
      }
      
      // Factor 4: Recurring income
      const hasRecurringDeposits = this.detectRecurringDeposits(txData.transactions);
      if (hasRecurringDeposits) {
        riskScore -= 15; // Stable income
      } else {
        riskScore += 10; // No stable income detected
      }
      
      // Group transactions by month to see if there's a pattern
      const txByMonth = new Map();
      txData.transactions.forEach(tx => {
        const month = tx.date.substring(0, 7); // YYYY-MM
        if (!txByMonth.has(month)) {
          txByMonth.set(month, []);
        }
        txByMonth.get(month).push(tx);
      });
      
      // Check if there are transactions in at least 2 months
      const hasContinuousActivity = txByMonth.size >= 2;
      if (!hasContinuousActivity) {
        riskScore += 10; // Limited activity history
      }
      
      // Normalize to 0-100 range
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      return {
        riskScore,
        riskLevel: this.getRiskLevelFromScore(riskScore),
        factors: {
          estimatedAccountAgeDays: accountAgeDays,
          transactionCount: txCount,
          totalBalance,
          totalSpent,
          hasRecurringDeposits,
          monthsWithActivity: txByMonth.size,
          accountCount: balanceData.accounts.length
        },
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
    // Extract deposit transactions (negative amounts in Plaid are deposits)
    const deposits = transactions
      .filter(tx => tx.amount < 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (deposits.length < 2) {
      return false; // Not enough deposits to detect patterns
    }
    
    // Group by similar amounts
    const amountGroups = new Map();
    deposits.forEach(tx => {
      // Round to handle slight variations in payment amounts
      const roundedAmount = Math.round(tx.amount * 100) / 100;
      if (!amountGroups.has(roundedAmount)) {
        amountGroups.set(roundedAmount, []);
      }
      amountGroups.get(roundedAmount).push(tx);
    });
    
    // Check if any amount has recurred at least twice
    for (const txs of amountGroups.values()) {
      if (txs.length >= 2) {
        // Check if deposits are roughly the same time apart
        if (txs.length >= 3) {
          const intervals = [];
          for (let i = 1; i < txs.length; i++) {
            const days = (new Date(txs[i].date).getTime() - new Date(txs[i-1].date).getTime()) / (1000 * 60 * 60 * 24);
            intervals.push(Math.round(days));
          }
          
          // Check if intervals are consistent (allowing for slight variations)
          const avgInterval = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;
          const isConsistent = intervals.every(days => Math.abs(days - avgInterval) <= 3);
          
          if (isConsistent && (avgInterval >= 14 && avgInterval <= 33)) {
            return true; // Biweekly or monthly pattern detected
          }
        }
        
        // Even if we don't have enough data for interval analysis,
        // multiple deposits of exactly the same amount suggest recurring income
        if (txs.length >= 2) {
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
    
    // Sort transactions by date
    const sortedTx = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const oldestDate = new Date(sortedTx[0].date);
    const now = new Date();
    
    return Math.round((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
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
      recommendations.push('Request identity verification documents');
      recommendations.push('Verify phone number and email');
    }
    
    if (score > 80) {
      recommendations.push('Require additional WHY response');
      recommendations.push('Establish transaction limits initially');
    }
    
    return recommendations;
  }
}