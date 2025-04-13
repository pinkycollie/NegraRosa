import axios from 'axios';
import { storage } from '../storage';
import { 
  VerificationType, 
  VerificationResult, 
  AccessTier 
} from '@shared/schema';

interface VerificationRequest {
  userId: number;
  verificationType: VerificationType;
  value: string;
  metadata?: {
    phoneType?: string;
    isDeafPlan?: boolean;
    hasFccMarker?: boolean;
    explanation?: string;
    verificationMethod?: string;
    language?: string;
  };
}

export class InclusiveVerificationService {
  private n8nWebhookUrl: string | undefined;
  
  constructor(n8nWebhookUrl?: string) {
    // If running in production, use the provided webhook URL
    this.n8nWebhookUrl = n8nWebhookUrl || process.env.N8N_VERIFICATION_WEBHOOK;
  }
  
  /**
   * Processes a phone verification request with special handling for deaf users and alternative plans
   */
  async verifyPhone(userId: number, phoneNumber: string, metadata?: VerificationRequest['metadata']): Promise<VerificationResult> {
    try {
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }
      
      // Create verification record
      const verification = await storage.createVerification({
        userId,
        type: "PHONE",
        value: phoneNumber,
        status: "PENDING",
        metadataJson: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
      });
      
      // For deaf users with FCC markers, apply special verification logic
      if (metadata?.isDeafPlan && metadata?.hasFccMarker) {
        // Register the FCC marker in our system
        await this.registerFccMarker(phoneNumber);
        
        // Update verification status to reflect the need for deaf-specific verification
        await storage.updateVerification(
          verification.id, 
          metadata.verificationMethod === "video" ? "REQUIRES_VIDEO" : "REQUIRES_ALTERNATIVE"
        );
        
        return { 
          success: true, 
          message: "FCC marker registered. Please complete the verification through your selected method.", 
          verificationId: verification.id 
        };
      }
      
      // For other alternative phone types (prepaid, international)
      if (metadata?.phoneType && ["prepaid", "international"].includes(metadata.phoneType)) {
        // If the user provided an explanation, it can help validate the verification
        if (metadata.explanation) {
          // In a real implementation, we would send this explanation to an AI/ML service 
          // for analysis to determine legitimacy and risk
          const riskReduction = await this.analyzeExplanation(metadata.explanation);
          
          // Store this context with the verification
          await storage.updateVerification(
            verification.id,
            "PENDING",
            undefined,
            { contextualRiskReduction: riskReduction }
          );
        }
        
        // Process through n8n workflow if available
        if (this.n8nWebhookUrl) {
          await this.triggerN8nVerificationWorkflow({
            userId,
            verificationType: "PHONE",
            value: phoneNumber,
            metadata
          });
        }
        
        return { 
          success: true, 
          message: "Alternative verification in progress. Additional verification steps may be required.", 
          verificationId: verification.id 
        };
      }
      
      // Regular phone verification process
      // In a real implementation, this would send SMS code, etc.
      return { 
        success: true, 
        message: "Verification initiated. Please complete the process.", 
        verificationId: verification.id 
      };
    } catch (error) {
      console.error("Phone verification error:", error);
      return { success: false, message: "Verification process failed" };
    }
  }
  
  /**
   * Registers a phone number with the FCC marker for deaf users
   */
  private async registerFccMarker(phoneNumber: string): Promise<void> {
    // In a real implementation, this would interact with telecom systems
    // to register the phone number with an FCC marker indicating a deaf user
    console.log(`Registering FCC marker for deaf user: ${phoneNumber}`);
    
    // This would potentially connect to an API that manages TRS (Telecommunications Relay Service)
    // registrations to ensure the phone number is properly identified in telecom systems
  }
  
  /**
   * Analyzes a user's explanation to determine legitimacy and reduce risk score
   */
  private async analyzeExplanation(explanation: string): Promise<number> {
    // In a real implementation, this would send the explanation to an AI/ML service
    // Returns a number between 0-100 representing how much the risk score should be reduced
    
    // Simple length-based calculation for demonstration
    const baseReduction = Math.min(explanation.length / 10, 30);
    
    // Potentially call Claude API here for analysis if ANTHROPIC_API_KEY is set
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // This would be a real analysis in production
        return baseReduction;
      } catch (error) {
        console.error("Error analyzing explanation with AI:", error);
        return baseReduction;
      }
    }
    
    return baseReduction;
  }
  
  /**
   * Completes a verification process after user has provided necessary proof
   */
  async completeVerification(verificationId: number, status: string): Promise<VerificationResult> {
    try {
      const verification = await storage.updateVerification(
        verificationId,
        status === "success" ? "VERIFIED" : "REJECTED",
        status === "success" ? new Date() : undefined
      );
      
      if (!verification) {
        return { success: false, message: "Verification not found" };
      }
      
      // If verification was successful, update user's reputation score
      if (status === "success") {
        const reputation = await storage.getReputation(verification.userId);
        
        if (reputation) {
          // Increase verification count and recalculate reputation
          await storage.updateReputation(verification.userId, {
            verificationCount: reputation.verificationCount + 1
          });
        } else {
          // Create reputation if it doesn't exist
          await storage.createReputation({
            userId: verification.userId,
            value: 10, // Initial value
            positiveTransactions: 0,
            totalTransactions: 0,
            verificationCount: 1,
            accountAge: 0,
            tierEnum: AccessTier.BASIC,
          });
        }
      }
      
      return {
        success: status === "success",
        message: status === "success" 
          ? "Verification completed successfully" 
          : "Verification was rejected",
        verificationId
      };
    } catch (error) {
      console.error("Complete verification error:", error);
      return { success: false, message: "Failed to complete verification process" };
    }
  }
  
  /**
   * Triggers an n8n workflow for complex verification scenarios
   */
  private async triggerN8nVerificationWorkflow(request: VerificationRequest): Promise<void> {
    if (!this.n8nWebhookUrl) {
      console.log("No n8n webhook URL configured, skipping workflow trigger");
      return;
    }
    
    try {
      await axios.post(this.n8nWebhookUrl, request);
    } catch (error) {
      console.error("Error triggering n8n workflow:", error);
      throw new Error("Failed to trigger verification workflow");
    }
  }
  
  /**
   * Handles video verification for deaf users
   */
  async processVideoVerification(verificationId: number, videoData?: any): Promise<VerificationResult> {
    try {
      // In a real implementation, this would process a video verification session
      // where a deaf user communicates via sign language
      
      // Update verification status
      const verification = await storage.updateVerification(
        verificationId,
        "VERIFIED",
        new Date()
      );
      
      if (!verification) {
        return { success: false, message: "Verification not found" };
      }
      
      // Significantly boost the user's reputation score for completing video verification
      const reputation = await storage.getReputation(verification.userId);
      if (reputation) {
        await storage.updateReputation(verification.userId, {
          verificationCount: reputation.verificationCount + 2, // Higher weight for video verification
          value: Math.min(reputation.value + 20, 100) // Boost reputation more for inclusive verification
        });
      }
      
      return {
        success: true,
        message: "Video verification completed successfully",
        verificationId
      };
    } catch (error) {
      console.error("Video verification error:", error);
      return { success: false, message: "Failed to process video verification" };
    }
  }
}