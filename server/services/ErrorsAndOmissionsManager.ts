import { storage } from "../storage";
import { CoverageDecision, ClaimResult, Transaction } from "@shared/schema";
import { ReputationManager } from "./ReputationManager";

interface UserProfile {
  id: number;
  reputationScore: number;
  verificationCount: number;
  accountAge: number;
}

interface Claim {
  id: number;
  transactionId: number;
  description: string;
  amount: number;
  userId: number;
}

export class ErrorsAndOmissionsManager {
  private reputationManager: ReputationManager;
  
  constructor() {
    this.reputationManager = new ReputationManager();
  }
  
  /**
   * Evaluate if a transaction should be covered by E&O protection
   */
  async evaluateForCoverage(
    transaction: Transaction
  ): Promise<CoverageDecision> {
    try {
      // Get user profile info
      const userProfile = await this.getUserProfile(transaction.userId);
      
      // Calculate coverage eligibility
      const eligibility = await this.calculateEligibility(transaction, userProfile);
      
      // If eligible, calculate coverage limits
      if (eligibility.eligible) {
        return {
          covered: true,
          coverageLimit: this.calculateCoverageLimit(transaction, userProfile),
          premium: this.calculatePremium(transaction, userProfile)
        };
      }
      
      return { covered: false, reason: eligibility.reason };
    } catch (error) {
      console.error('E&O evaluation error:', error);
      return { 
        covered: false, 
        reason: `Unable to evaluate coverage: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Process a claim against E&O coverage
   */
  async processClaim(
    claim: Claim
  ): Promise<ClaimResult> {
    try {
      // Get the transaction associated with the claim
      const transaction = await storage.getTransaction(claim.transactionId);
      if (!transaction) {
        return { approved: false, reason: "Transaction not found" };
      }
      
      // Verify transaction belongs to the user
      if (transaction.userId !== claim.userId) {
        return { approved: false, reason: "Transaction does not belong to this user" };
      }
      
      // Get user profile info
      const userProfile = await this.getUserProfile(claim.userId);
      
      // Validate claim is valid
      const validationResult = await this.validateClaim(claim, transaction);
      
      if (!validationResult.valid) {
        return { approved: false, reason: validationResult.reason };
      }
      
      // Calculate appropriate settlement
      const settlementAmount = this.calculateSettlement(claim, transaction, userProfile);
      
      // Store the claim
      const storedClaim = await storage.createClaim({
        userId: claim.userId,
        transactionId: claim.transactionId,
        description: claim.description,
        amount: claim.amount,
        status: "PENDING"
      });
      
      // Process the settlement
      await this.processSettlement(storedClaim.id, settlementAmount);
      
      // Update claim status
      await storage.updateClaim(
        storedClaim.id, 
        "APPROVED", 
        settlementAmount, 
        new Date()
      );
      
      return {
        approved: true,
        settlementAmount,
        settlement: {
          id: storedClaim.id.toString(),
          amount: settlementAmount,
          date: new Date(),
          notes: `Claim settled for ${claim.description}`
        }
      };
    } catch (error) {
      console.error('Claim processing error:', error);
      return { 
        approved: false, 
        reason: `Unable to process claim: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Get user profile with reputation details
   */
  private async getUserProfile(userId: number): Promise<UserProfile> {
    const reputation = await this.reputationManager.getUserReputationScore(userId);
    
    return {
      id: userId,
      reputationScore: reputation.value,
      verificationCount: reputation.verificationCount,
      accountAge: reputation.accountAge
    };
  }
  
  /**
   * Check if transaction is eligible for coverage
   */
  private async calculateEligibility(
    transaction: Transaction, 
    userProfile: UserProfile
  ): Promise<{ eligible: boolean; reason?: string }> {
    // Minimum requirements
    if (userProfile.reputationScore < 10) {
      return { eligible: false, reason: "Reputation score too low for coverage" };
    }
    
    if (userProfile.accountAge < 7) {
      return { eligible: false, reason: "Account too new for coverage (minimum 7 days)" };
    }
    
    if (userProfile.verificationCount === 0) {
      return { eligible: false, reason: "At least one verification required for coverage" };
    }
    
    // All checks passed
    return { eligible: true };
  }
  
  /**
   * Calculate coverage limit based on user profile and transaction
   */
  private calculateCoverageLimit(transaction: Transaction, userProfile: UserProfile): number {
    let baseLimit = 50; // Start with a modest coverage limit
    
    // Adjust based on reputation
    baseLimit += userProfile.reputationScore * 2;
    
    // Adjust based on account age
    if (userProfile.accountAge > 90) {
      baseLimit *= 2;
    } else if (userProfile.accountAge > 30) {
      baseLimit *= 1.5;
    }
    
    // Adjust based on verification count
    baseLimit *= (1 + (userProfile.verificationCount * 0.25));
    
    // Limit to maximum of $5000 or 5x transaction amount, whichever is lower
    return Math.min(5000, baseLimit, transaction.amount * 5);
  }
  
  /**
   * Calculate premium for coverage (would typically be a small percentage of the transaction)
   */
  private calculatePremium(transaction: Transaction, userProfile: UserProfile): number {
    // Base premium rate as percentage of transaction
    let premiumRate = 0.02; // 2% of transaction amount
    
    // Adjust based on reputation - better reputation = lower premium
    premiumRate -= Math.min(0.015, (userProfile.reputationScore / 100) * 0.015);
    
    // Calculate premium with minimum of $0.50
    return Math.max(0.5, transaction.amount * premiumRate);
  }
  
  /**
   * Validate if claim is valid
   */
  private async validateClaim(
    claim: Claim, 
    transaction: Transaction
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check if transaction exists and is completed
    if (transaction.status !== 'COMPLETED') {
      return { valid: false, reason: "Transaction must be completed to file a claim" };
    }
    
    // Check if claim amount is reasonable compared to transaction
    if (claim.amount > transaction.amount * 2) {
      return { valid: false, reason: "Claim amount exceeds maximum allowed (2x transaction amount)" };
    }
    
    // Check if transaction is recent enough (within 30 days)
    const transactionDate = new Date(transaction.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (transactionDate < thirtyDaysAgo) {
      return { valid: false, reason: "Transaction is too old for a claim (max 30 days)" };
    }
    
    // Check if there are any existing claims for this transaction
    const userClaims = await storage.getClaimsByUserId(claim.userId);
    const existingClaim = userClaims.find(c => c.transactionId === claim.transactionId);
    
    if (existingClaim) {
      return { valid: false, reason: "A claim already exists for this transaction" };
    }
    
    // All checks passed
    return { valid: true };
  }
  
  /**
   * Calculate settlement amount based on claim and user profile
   */
  private calculateSettlement(
    claim: Claim, 
    transaction: Transaction, 
    userProfile: UserProfile
  ): number {
    // Base settlement is the claim amount
    let settlementAmount = claim.amount;
    
    // Calculate coverage limit
    const coverageLimit = this.calculateCoverageLimit(transaction, userProfile);
    
    // Cap settlement at coverage limit
    settlementAmount = Math.min(settlementAmount, coverageLimit);
    
    // Adjust based on reputation - better reputation means less reduction
    const reputationFactor = Math.min(1, 0.5 + (userProfile.reputationScore / 100) * 0.5);
    settlementAmount *= reputationFactor;
    
    return Math.round(settlementAmount * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Process the settlement of a claim
   */
  private async processSettlement(claimId: number, amount: number): Promise<void> {
    // In a real system, this would initiate a payment process
    console.log(`Processing settlement for claim ${claimId}: $${amount}`);
    
    // For this demo, we'll just return successfully
    return Promise.resolve();
  }
}
