import { Transaction } from "@shared/schema";

// Configuration for fraud detection
interface FraudDetectionConfig {
  highRiskThreshold: number;
  mediumRiskThreshold: number;
  newUserThreshold: number;
  newUserDiscountFactor: number;
  improvementDiscountFactor: number;
}

// Context modifiers for fraud detection
interface ContextualModifiers {
  isNewUser: boolean;
  showingImprovement: boolean;
  userRegion: string;
  deviceTrustScore: number;
}

// User history for fraud detection
interface UserHistory {
  transactionCount: number;
  successfulTransactionRatio: number;
  accountAgeInDays: number;
  hasSuccessfulVerifications: boolean;
  recentActivity: Transaction[];
  improvementTrend: boolean;
}

/**
 * Python-inspired fraud detection engine, implemented in TypeScript
 * In a real system, this could be replaced with calls to a Python microservice
 */
export class FraudDetectionEngine {
  private config: FraudDetectionConfig;
  
  constructor(config?: Partial<FraudDetectionConfig>) {
    // Default configuration
    this.config = {
      highRiskThreshold: 0.8,
      mediumRiskThreshold: 0.5,
      newUserThreshold: 50, // Dollar amount
      newUserDiscountFactor: 0.7, // Reduce risk score by 30% for small transactions by new users
      improvementDiscountFactor: 0.8, // Reduce risk score by 20% for users showing improvement
      ...config
    };
  }
  
  /**
   * Analyze a transaction for fraud risk
   */
  async analyzeTransaction(transactionData: Transaction, userHistory: UserHistory): Promise<{
    action: string;
    riskScore: number;
    reason?: string;
    limits?: any;
  }> {
    // Get raw model prediction - in a real system this would call a ML model
    const fraudProbability = this.predictFraudProbability(transactionData, userHistory);
    
    // Get contextual factors that might adjust the raw score
    const contextualModifiers = this.getContextualModifiers(userHistory);
    
    // Apply human-centered adjustments to favor inclusion
    const adjustedProbability = this.applyInclusionAdjustments(
      fraudProbability, 
      contextualModifiers,
      transactionData
    );
    
    // Determine appropriate action based on adjusted probability
    return this.determineAction(adjustedProbability, userHistory);
  }
  
  /**
   * Predict fraud probability based on transaction and user history
   * This is a simplified version - a real system would use a trained model
   */
  private predictFraudProbability(transaction: Transaction, userHistory: UserHistory): number {
    // Base probability factors - in a real system this would be ML-based
    let baseProbability = 0.1; // Start with low probability
    
    // Factor 1: Transaction amount relative to user history
    const avgAmount = userHistory.recentActivity.length > 0
      ? userHistory.recentActivity.reduce((sum, t) => sum + t.amount, 0) / userHistory.recentActivity.length
      : 0;
    
    if (avgAmount > 0 && transaction.amount > avgAmount * 3) {
      baseProbability += 0.3; // Large increase for unusually large amounts
    }
    
    // Factor 2: New account risk
    if (userHistory.accountAgeInDays < 7) {
      baseProbability += 0.2;
    } else if (userHistory.accountAgeInDays < 30) {
      baseProbability += 0.1;
    }
    
    // Factor 3: Transaction history
    if (userHistory.transactionCount === 0) {
      baseProbability += 0.2; // First transaction is higher risk
    } else if (userHistory.transactionCount < 5) {
      baseProbability += 0.1; // Few transactions is somewhat higher risk
    }
    
    // Factor 4: Transaction success history
    if (userHistory.successfulTransactionRatio < 0.7 && userHistory.transactionCount > 3) {
      baseProbability += 0.25; // Poor transaction history
    }
    
    // Cap at 0.95 to avoid absolute determinations
    return Math.min(baseProbability, 0.95);
  }
  
  /**
   * Get contextual modifiers based on user history
   */
  private getContextualModifiers(userHistory: UserHistory): ContextualModifiers {
    return {
      isNewUser: userHistory.accountAgeInDays < 30,
      showingImprovement: userHistory.improvementTrend,
      userRegion: "US", // Placeholder - would be determined from user data
      deviceTrustScore: 0.8 // Placeholder - would be calculated from device fingerprinting
    };
  }
  
  /**
   * Apply adjustments that favor inclusion while managing risk
   */
  private applyInclusionAdjustments(
    probability: number, 
    modifiers: ContextualModifiers,
    transaction: Transaction
  ): number {
    let adjustedProbability = probability;
    
    // Reduce false positives for users with limited history
    if (modifiers.isNewUser && transaction.amount < this.config.newUserThreshold) {
      adjustedProbability *= this.config.newUserDiscountFactor;
    }
    
    // Be more lenient with users showing improvement
    if (modifiers.showingImprovement) {
      adjustedProbability *= this.config.improvementDiscountFactor;
    }
    
    return adjustedProbability;
  }
  
  /**
   * Determine action based on the adjusted probability
   */
  private determineAction(probability: number, userHistory: UserHistory): {
    action: string;
    riskScore: number;
    reason?: string;
    limits?: any;
  } {
    if (probability > this.config.highRiskThreshold) {
      // Even for high risk, consider monitoring rather than blocking
      if (userHistory.hasSuccessfulVerifications) {
        return {
          action: "additional_verification",
          riskScore: probability,
          reason: this.determineRiskFactors(probability)
        };
      } else {
        return {
          action: "block",
          riskScore: probability,
          reason: this.determineRiskFactors(probability)
        };
      }
    } else if (probability > this.config.mediumRiskThreshold) {
      // For medium risk, apply restrictions rather than blocking
      return {
        action: "apply_limits",
        riskScore: probability,
        limits: this.calculateAppropriateLimits(probability, userHistory),
        reason: this.determineRiskFactors(probability)
      };
    } else {
      return {
        action: "allow",
        riskScore: probability
      };
    }
  }
  
  /**
   * Determine the risk factors to explain the decision
   */
  private determineRiskFactors(probability: number): string {
    // In a real system, this would extract features from the model to explain the decision
    if (probability > 0.8) {
      return "High risk transaction pattern detected";
    } else if (probability > 0.5) {
      return "Medium risk factors identified";
    } else {
      return "Low risk transaction";
    }
  }
  
  /**
   * Calculate appropriate limits based on risk level and user history
   */
  private calculateAppropriateLimits(probability: number, userHistory: UserHistory): {
    maxAmount: number;
    delaySettlement: boolean;
    requireAdditionalVerification: boolean;
  } {
    // Calculate base max amount based on user history
    let baseMaxAmount = 100; // Default for new users
    
    if (userHistory.transactionCount > 10) {
      baseMaxAmount = 500;
    } else if (userHistory.transactionCount > 5) {
      baseMaxAmount = 250;
    }
    
    // Adjust based on account age
    if (userHistory.accountAgeInDays > 90) {
      baseMaxAmount *= 3;
    } else if (userHistory.accountAgeInDays > 30) {
      baseMaxAmount *= 2;
    }
    
    // Apply risk-based reduction
    const riskReduction = 1 - ((probability - 0.5) * 2); // Maps 0.5-1.0 to 1.0-0.0
    const maxAmount = baseMaxAmount * Math.max(0.1, riskReduction);
    
    return {
      maxAmount: Math.round(maxAmount),
      delaySettlement: probability > 0.65,
      requireAdditionalVerification: probability > 0.75
    };
  }
}
