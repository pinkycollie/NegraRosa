import { storage } from "../storage";
import { 
  VerificationType, 
  VerificationResult, 
  AccessTier, 
  User, 
  Reputation,
  Verification
} from "@shared/schema";

export class InclusiveAuthManager {
  /**
   * Verify a user using the specified verification method
   */
  async verifyUser(
    userId: number, 
    verificationType: VerificationType, 
    verificationData: any
  ): Promise<VerificationResult> {
    try {
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }
      
      // Create verification record with PENDING status
      const verification = await storage.createVerification({
        userId,
        type: verificationType,
        status: "PENDING",
        data: verificationData
      });
      
      // Process verification based on method
      let verificationResult: VerificationResult;
      
      switch(verificationType) {
        case "PREPAID_CARD":
          verificationResult = await this.verifyWithPrepaidCard(user, verification.id, verificationData);
          break;
        case "GOVERNMENT_ID":
          verificationResult = await this.verifyWithGovernmentId(user, verification.id, verificationData);
          break;
        case "UTILITY_BILL":
          verificationResult = await this.verifyWithUtilityBill(user, verification.id, verificationData);
          break;
        case "PHONE_NUMBER":
          verificationResult = await this.verifyWithPhone(user, verification.id, verificationData);
          break;
        default:
          verificationResult = {
            success: false,
            message: "Invalid verification method",
            verificationId: verification.id
          };
      }
      
      // Update verification record with result
      await storage.updateVerification(
        verification.id, 
        verificationResult.success ? "VERIFIED" : "REJECTED",
        verificationResult.success ? new Date() : undefined
      );
      
      return verificationResult;
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
  
  /**
   * Get current access tier for a user based on verifications and reputation
   */
  async getUserAccessTier(userId: number): Promise<AccessTier> {
    const user = await storage.getUser(userId);
    if (!user) {
      return AccessTier.BASIC; // Default to basic for non-existent users
    }
    
    const verifications = await storage.getVerificationsByUserId(userId);
    const verifiedCount = verifications.filter(v => v.status === "VERIFIED").length;
    
    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      return AccessTier.BASIC;
    }
    
    // Calculate account age in days
    const accountAgeInDays = Math.floor(
      (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Update account age in reputation
    if (accountAgeInDays !== reputation.accountAge) {
      await storage.updateReputation(userId, { 
        accountAge: accountAgeInDays,
        score: this.calculateReputationScore(reputation, accountAgeInDays)
      });
    }
    
    // Determine tier based on verification count, reputation, and account age
    if (verifiedCount >= 2 && reputation.score >= 50 && accountAgeInDays >= 30) {
      return AccessTier.FULL;
    } else if (verifiedCount >= 1 && reputation.score >= 25 && accountAgeInDays >= 15) {
      return AccessTier.STANDARD;
    } else {
      return AccessTier.BASIC;
    }
  }
  
  /**
   * Calculate reputation score, used when updating account age
   */
  private calculateReputationScore(reputation: Reputation, newAccountAge: number): number {
    const transactionScore = reputation.totalTransactions > 0 
      ? (reputation.positiveTransactions / reputation.totalTransactions) * 50 
      : 0;
    const verificationScore = Math.min(reputation.verificationCount * 12.5, 25);
    const ageScore = Math.min(newAccountAge / 30 * 25, 25);
    
    return transactionScore + verificationScore + ageScore;
  }
  
  /**
   * Get user verification status
   */
  async getUserVerificationStatus(userId: number): Promise<{
    verifiedMethods: VerificationType[],
    pendingMethods: VerificationType[],
    rejectedMethods: VerificationType[]
  }> {
    const verifications = await storage.getVerificationsByUserId(userId);
    
    return {
      verifiedMethods: verifications
        .filter(v => v.status === "VERIFIED")
        .map(v => v.type as VerificationType),
      pendingMethods: verifications
        .filter(v => v.status === "PENDING")
        .map(v => v.type as VerificationType),
      rejectedMethods: verifications
        .filter(v => v.status === "REJECTED")
        .map(v => v.type as VerificationType)
    };
  }
  
  /**
   * Verify with prepaid card
   */
  private async verifyWithPrepaidCard(user: User, verificationId: number, cardData: any): Promise<VerificationResult> {
    // In a real implementation, this would interact with payment processors
    // For this demo, we'll do basic validation
    
    if (!cardData || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
      return {
        success: false,
        message: "Missing required card information",
        verificationId
      };
    }
    
    // Basic format validation
    const cardNumberValid = /^\d{13,19}$/.test(cardData.cardNumber.replace(/\s/g, ''));
    const expiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiryDate);
    const cvvValid = /^\d{3,4}$/.test(cardData.cvv);
    
    if (!cardNumberValid || !expiryValid || !cvvValid) {
      return {
        success: false,
        message: "Invalid card details format",
        verificationId
      };
    }
    
    // Mock card verification success - in a real system we would verify with processor
    // This would only place a minimal authorization hold (e.g., $1) to verify card is valid
    
    return {
      success: true,
      message: "Card verification successful",
      verificationId
    };
  }
  
  /**
   * Verify with government ID
   */
  private async verifyWithGovernmentId(user: User, verificationId: number, idData: any): Promise<VerificationResult> {
    // In a real implementation, this would use document verification services
    
    if (!idData || !idData.documentType || !idData.documentNumber || !idData.expiryDate) {
      return {
        success: false,
        message: "Missing required ID information",
        verificationId
      };
    }
    
    // Basic validation
    const validDocTypes = ["passport", "driver_license", "national_id", "residence_permit"];
    if (!validDocTypes.includes(idData.documentType)) {
      return {
        success: false,
        message: "Invalid document type",
        verificationId
      };
    }
    
    // Mock ID verification success - in a real system this would verify with ID verification APIs
    return {
      success: true,
      message: "ID verification successful",
      verificationId
    };
  }
  
  /**
   * Verify with utility bill
   */
  private async verifyWithUtilityBill(user: User, verificationId: number, billData: any): Promise<VerificationResult> {
    // In a real implementation, this would use document verification services
    
    if (!billData || !billData.billType || !billData.issueDate || !billData.address) {
      return {
        success: false,
        message: "Missing required utility bill information",
        verificationId
      };
    }
    
    // Basic validation
    const validBillTypes = ["electricity", "water", "gas", "internet", "phone"];
    if (!validBillTypes.includes(billData.billType)) {
      return {
        success: false,
        message: "Invalid utility bill type",
        verificationId
      };
    }
    
    // Check if bill is recent (last 3 months)
    const issueDate = new Date(billData.issueDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (issueDate < threeMonthsAgo) {
      return {
        success: false,
        message: "Utility bill is too old, must be from the last 3 months",
        verificationId
      };
    }
    
    // Mock utility bill verification success
    return {
      success: true,
      message: "Utility bill verification successful",
      verificationId
    };
  }
  
  /**
   * Verify with phone number
   */
  private async verifyWithPhone(user: User, verificationId: number, phoneData: any): Promise<VerificationResult> {
    // In a real implementation, this would use SMS verification services
    
    if (!phoneData || !phoneData.phoneNumber || !phoneData.verificationCode) {
      return {
        success: false,
        message: "Missing phone information or verification code",
        verificationId
      };
    }
    
    // Basic phone number format validation (very simplified)
    const phoneNumberValid = /^\+?[1-9]\d{1,14}$/.test(phoneData.phoneNumber);
    if (!phoneNumberValid) {
      return {
        success: false,
        message: "Invalid phone number format",
        verificationId
      };
    }
    
    // In a real system, we would validate the verification code sent via SMS
    // For demo, assume code "123456" is valid
    if (phoneData.verificationCode !== "123456") {
      return {
        success: false,
        message: "Invalid verification code",
        verificationId
      };
    }
    
    return {
      success: true,
      message: "Phone verification successful",
      verificationId
    };
  }
}
