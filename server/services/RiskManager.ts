import { storage } from "../storage";
import { RiskDecision, Transaction } from "@shared/schema";
import { ReputationManager } from "./ReputationManager";

interface RiskFactor {
  name: string;
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class RiskManager {
  private reputationManager: ReputationManager;
  
  constructor() {
    this.reputationManager = new ReputationManager();
  }
  
  /**
   * Evaluate the risk of a transaction
   */
  async evaluateTransactionRisk(
    transaction: Transaction
  ): Promise<RiskDecision> {
    try {
      // Get user reputation
      const userReputation = await this.reputationManager.getUserReputationScore(transaction.userId);
      
      // Calculate risk factors
      const riskFactors = await this.calculateRiskFactors(transaction);
      
      // Calculate overall risk score (0-100)
      const overallRiskScore = this.calculateOverallRisk(riskFactors, userReputation.value);
      
      // Get transaction limits based on user reputation
      const transactionLimits = await this.reputationManager.getTransactionLimits(transaction.userId);
      
      // Apply second-chance architecture - instead of denying, apply restrictions
      let allowed = true;
      let restrictions: {
        maxAmount?: number;
        requiresAdditionalVerification?: boolean;
        delayedSettlement?: boolean;
        limitedRecipients?: boolean;
      } = {};
      let reason = "";
      
      // Apply risk-based restrictions
      if (overallRiskScore > 80) {
        // High risk
        allowed = true; // Still allow but with heavy restrictions
        restrictions = {
          maxAmount: Math.min(transaction.amount, transactionLimits.singleTransactionLimit * 0.25),
          requiresAdditionalVerification: true,
          delayedSettlement: true,
          limitedRecipients: true
        };
        reason = "High risk transaction - restrictions applied for security";
      } else if (overallRiskScore > 50) {
        // Medium risk
        allowed = true;
        restrictions = {
          maxAmount: Math.min(transaction.amount, transactionLimits.singleTransactionLimit * 0.5),
          requiresAdditionalVerification: overallRiskScore > 70,
          delayedSettlement: overallRiskScore > 60
        };
        reason = "Medium risk transaction - some precautions applied";
      } else {
        // Low risk
        allowed = true;
        // If transaction amount exceeds limit, cap it
        if (transaction.amount > transactionLimits.singleTransactionLimit) {
          restrictions = {
            maxAmount: transactionLimits.singleTransactionLimit
          };
          reason = "Transaction amount exceeds your current limit";
        }
      }
      
      // Record risk assessment
      await storage.createRiskAssessment({
        transactionId: transaction.id,
        allowed,
        riskScore: overallRiskScore,
        restrictions,
        reason
      });
      
      // Update transaction with risk score
      await storage.updateTransaction(transaction.id, transaction.status, overallRiskScore);
      
      return {
        allowed,
        riskScore: overallRiskScore,
        restrictions,
        reason
      };
    } catch (error) {
      console.error("Risk evaluation error:", error);
      throw error;
    }
  }
  
  /**
   * Calculate individual risk factors for a transaction
   */
  private async calculateRiskFactors(transaction: Transaction): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];
    
    // Amount factor - higher amounts = higher risk
    const userLimits = await this.reputationManager.getTransactionLimits(transaction.userId);
    const amountRiskPercentage = (transaction.amount / userLimits.singleTransactionLimit) * 100;
    factors.push({
      name: "Transaction Amount",
      score: Math.min(amountRiskPercentage, 100),
      level: amountRiskPercentage > 70 ? 'HIGH' : amountRiskPercentage > 40 ? 'MEDIUM' : 'LOW'
    });
    
    // User history factor
    const userTransactions = await storage.getTransactionsByUserId(transaction.userId);
    const transactionCount = userTransactions.length;
    const historyRisk = transactionCount === 0 ? 70 : 
                         transactionCount < 5 ? 40 : 
                         transactionCount < 10 ? 20 : 10;
    factors.push({
      name: "User History",
      score: historyRisk,
      level: historyRisk > 50 ? 'HIGH' : historyRisk > 30 ? 'MEDIUM' : 'LOW'
    });
    
    // Recipient history
    let recipientRisk = 50; // Default medium risk for new recipients
    
    if (transaction.recipientId) {
      // Check if user has transacted with this recipient before
      const previousTransactionsWithRecipient = userTransactions.filter(
        t => t.recipientId === transaction.recipientId && t.status === 'COMPLETED'
      );
      
      if (previousTransactionsWithRecipient.length > 0) {
        recipientRisk = 15; // Low risk for known recipients
      }
    }
    
    factors.push({
      name: "Recipient History",
      score: recipientRisk,
      level: recipientRisk > 50 ? 'HIGH' : recipientRisk > 30 ? 'MEDIUM' : 'LOW'
    });
    
    // Transaction pattern factor - compare to user's typical behavior
    let patternRisk = 30; // Default to medium-low
    
    if (userTransactions.length > 5) {
      // Calculate average transaction amount
      const avgAmount = userTransactions
        .slice(0, 5) // Most recent 5 transactions
        .reduce((sum, t) => sum + t.amount, 0) / 5;
      
      // If current transaction is significantly higher than average
      if (transaction.amount > avgAmount * 3) {
        patternRisk = 70; // High risk for unusual amounts
      } else if (transaction.amount > avgAmount * 1.5) {
        patternRisk = 50; // Medium risk for somewhat unusual amounts
      } else {
        patternRisk = 15; // Low risk for normal patterns
      }
    }
    
    factors.push({
      name: "Transaction Pattern",
      score: patternRisk,
      level: patternRisk > 50 ? 'HIGH' : patternRisk > 30 ? 'MEDIUM' : 'LOW'
    });
    
    // Time of day factor - assume normal business hours are lower risk
    const transactionHour = new Date(transaction.createdAt).getHours();
    const businessHours = transactionHour >= 9 && transactionHour <= 17;
    const timeRisk = businessHours ? 15 : 25;
    
    factors.push({
      name: "Time of Day",
      score: timeRisk,
      level: 'LOW'
    });
    
    return factors;
  }
  
  /**
   * Calculate overall risk score based on individual factors and reputation
   */
  private calculateOverallRisk(riskFactors: RiskFactor[], reputationScore: number): number {
    // Weight factors - must sum to 1
    const weights = {
      "Transaction Amount": 0.35,
      "User History": 0.15,
      "Recipient History": 0.25,
      "Transaction Pattern": 0.20,
      "Time of Day": 0.05
    };
    
    // Calculate weighted average of risk factors
    let weightedRiskScore = 0;
    
    riskFactors.forEach(factor => {
      const weight = weights[factor.name as keyof typeof weights] || 0;
      weightedRiskScore += factor.score * weight;
    });
    
    // Apply reputation discount (better reputation = lower risk)
    // Reputation can reduce risk by up to 50%
    const reputationDiscount = (reputationScore / 100) * 0.5;
    
    // Final risk score, capped between 5 and 95
    return Math.max(5, Math.min(95, weightedRiskScore * (1 - reputationDiscount)));
  }
  
  /**
   * Get risk breakdown for explanation
   */
  async getRiskBreakdown(transactionId: number): Promise<{
    riskFactors: RiskFactor[];
    overallRisk: number;
    decision: RiskDecision;
  }> {
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    const assessment = await storage.getRiskAssessmentByTransactionId(transactionId);
    if (!assessment) {
      throw new Error(`Risk assessment for transaction ${transactionId} not found`);
    }
    
    const riskFactors = await this.calculateRiskFactors(transaction);
    
    return {
      riskFactors,
      overallRisk: assessment.riskScore,
      decision: {
        allowed: assessment.allowed,
        riskScore: assessment.riskScore,
        restrictions: assessment.restrictions,
        reason: assessment.reason
      }
    };
  }
}
