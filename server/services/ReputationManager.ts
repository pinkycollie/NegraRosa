import { storage } from "../storage";
import { ReputationScore, AccessTier } from "@shared/schema";
import { InclusiveAuthManager } from "./InclusiveAuthManager";

export class ReputationManager {
  private authManager: InclusiveAuthManager;
  
  constructor() {
    this.authManager = new InclusiveAuthManager();
  }
  
  /**
   * Get a user's reputation score with details
   */
  async getUserReputationScore(userId: number): Promise<ReputationScore> {
    // Get base reputation
    const baseReputation = await storage.getReputation(userId);
    if (!baseReputation) {
      throw new Error(`No reputation found for user ${userId}`);
    }
    
    // Get user to calculate account age
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Calculate account age in days
    const accountAgeInDays = Math.floor(
      (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Update account age if it changed
    if (accountAgeInDays !== baseReputation.accountAge) {
      await storage.updateReputation(userId, { 
        accountAge: accountAgeInDays 
      });
    }
    
    // Get access tier
    const tier = await this.authManager.getUserAccessTier(userId);
    
    return {
      value: baseReputation.score,
      positiveTransactions: baseReputation.positiveTransactions,
      totalTransactions: baseReputation.totalTransactions,
      verificationCount: baseReputation.verificationCount,
      accountAge: accountAgeInDays,
      tier
    };
  }
  
  /**
   * Get improvement recommendations for a user
   */
  async getImprovementRecommendations(userId: number): Promise<string[]> {
    const reputation = await this.getUserReputationScore(userId);
    const recommendations: string[] = [];
    
    // Get verification status
    const verificationStatus = await this.authManager.getUserVerificationStatus(userId);
    const verifiedMethodCount = verificationStatus.verifiedMethods.length;
    
    // Add verification recommendations
    if (verifiedMethodCount < 2) {
      if (verifiedMethodCount === 0) {
        recommendations.push("Complete your first verification method to improve your score by 25%");
      } else {
        recommendations.push("Add a second verification method to increase your score by 25%");
      }
    }
    
    // Add transaction recommendations
    if (reputation.totalTransactions < 5) {
      recommendations.push(`Complete ${5 - reputation.totalTransactions} more successful transactions to build transaction history`);
    } else if (reputation.positiveTransactions / reputation.totalTransactions < 0.9) {
      recommendations.push("Improve your positive transaction rate to enhance your score");
    }
    
    // Add account age recommendations
    if (reputation.accountAge < 30) {
      recommendations.push(`Maintain account in good standing for ${30 - reputation.accountAge} more days for age bonus`);
    }
    
    // If all is good, give a maintenance recommendation
    if (recommendations.length === 0) {
      recommendations.push("Your reputation is excellent. Continue maintaining good transaction history.");
    }
    
    return recommendations;
  }
  
  /**
   * Register a positive transaction outcome
   */
  async registerPositiveTransaction(userId: number, transactionId: number): Promise<ReputationScore> {
    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      throw new Error(`No reputation found for user ${userId}`);
    }
    
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    if (transaction.userId !== userId) {
      throw new Error(`Transaction ${transactionId} does not belong to user ${userId}`);
    }
    
    // Update transaction status
    await storage.updateTransaction(transactionId, "COMPLETED");
    
    // Return updated reputation
    return this.getUserReputationScore(userId);
  }
  
  /**
   * Register a negative transaction outcome
   */
  async registerNegativeTransaction(userId: number, transactionId: number): Promise<ReputationScore> {
    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      throw new Error(`No reputation found for user ${userId}`);
    }
    
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    if (transaction.userId !== userId) {
      throw new Error(`Transaction ${transactionId} does not belong to user ${userId}`);
    }
    
    // Update transaction status
    await storage.updateTransaction(transactionId, "FAILED");
    
    // Return updated reputation
    return this.getUserReputationScore(userId);
  }
  
  /**
   * Get transaction limits based on reputation
   */
  async getTransactionLimits(userId: number): Promise<{
    singleTransactionLimit: number;
    dailyLimit: number;
    monthlyLimit: number;
  }> {
    const reputation = await this.getUserReputationScore(userId);
    
    // Base limits
    let singleLimit = 100;
    let dailyLimit = 200;
    let monthlyLimit = 500;
    
    // Apply tier multipliers
    switch (reputation.tier) {
      case AccessTier.FULL:
        singleLimit = 2000;
        dailyLimit = 4000;
        monthlyLimit = 20000;
        break;
      case AccessTier.STANDARD:
        singleLimit = 500;
        dailyLimit = 1000;
        monthlyLimit = 5000;
        break;
      case AccessTier.BASIC:
      default:
        // Keep base limits
        break;
    }
    
    // Apply reputation score bonus (up to 2x for perfect reputation)
    const reputationMultiplier = 1 + (reputation.value / 100);
    
    return {
      singleTransactionLimit: Math.min(singleLimit * reputationMultiplier, singleLimit * 2),
      dailyLimit: Math.min(dailyLimit * reputationMultiplier, dailyLimit * 2),
      monthlyLimit: Math.min(monthlyLimit * reputationMultiplier, monthlyLimit * 2)
    };
  }
}
