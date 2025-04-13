import { storage } from '../storage';
import { RiskDecision, JobProfile, BackgroundVerification } from '@shared/schema';

interface ContextualRiskFactors {
  unemploymentClaimsCount?: number;
  vocationalRehabMonths?: number;
  addressChangesCount?: number;
  hasDriversLicense?: boolean;
  financialStabilityScore?: number;
  contextualExplanations?: {
    addressChanges?: string;
    employmentGaps?: string;
    financialHardship?: string;
    identityDocuments?: string;
    otherFactors?: string;
  }
}

export class RiskAssessmentService {
  // Main assessment method that takes contextual factors into account
  async assessRiskWithContext(userId: number, factors: ContextualRiskFactors): Promise<RiskDecision> {
    // Get user profile and verification history
    const profile = await storage.getJobProfileByUserId(userId);
    const verifications = await storage.getBackgroundVerificationsByUserId(userId);
    const applications = await storage.getJobApplicationsByUserId(userId);
    const reputation = await storage.getReputation(userId);
    
    // Base risk score starts at 50 (neutral)
    let riskScore = 50;
    const reasons: string[] = [];
    
    // Factor 1: Unemployment claims patterns
    if (factors.unemploymentClaimsCount !== undefined) {
      if (factors.unemploymentClaimsCount > 5) {
        riskScore += 15; // Significant risk increase
        reasons.push('High number of unemployment claims');
      } else if (factors.unemploymentClaimsCount > 2) {
        riskScore += 5; // Moderate risk increase
        reasons.push('Multiple unemployment claims');
      }
      
      // If explanation provided, consider reducing the risk
      if (factors.contextualExplanations?.employmentGaps) {
        riskScore -= 5; // Reduce risk when explanation is provided
        reasons.push('User provided context for employment history');
      }
    }
    
    // Factor 2: Vocational rehabilitation usage
    if (factors.vocationalRehabMonths !== undefined) {
      if (factors.vocationalRehabMonths > 6) {
        riskScore += 10; // Moderate risk as per your specification
        reasons.push('Extended vocational rehabilitation period');
      }
      
      // If engaged in self-improvement, reduce risk
      if (profile?.skills?.length && profile.skills.length > 3) {
        riskScore -= 5;
        reasons.push('Actively developing skills during rehabilitation');
      }
    }
    
    // Factor 3: Multiple addresses with context
    if (factors.addressChangesCount !== undefined) {
      if (factors.addressChangesCount > 3) {
        riskScore += 10;
        reasons.push('Multiple address changes indicating potential instability');
        
        // If explanation provided, significantly reduce this risk factor
        if (factors.contextualExplanations?.addressChanges) {
          riskScore -= 8;
          reasons.push('User provided context for address changes');
        }
      }
    }
    
    // Factor 4: ID without driver's license
    if (factors.hasDriversLicense === false) {
      riskScore += 5;
      reasons.push('No driver\'s license');
      
      if (factors.contextualExplanations?.identityDocuments) {
        riskScore -= 5;
        reasons.push('User explained license situation');
      }
    }
    
    // Factor 5: Financial stability
    if (factors.financialStabilityScore !== undefined) {
      if (factors.financialStabilityScore < 30) {
        riskScore += 15;
        reasons.push('Financial stability concerns');
        
        if (factors.contextualExplanations?.financialHardship) {
          riskScore -= 10;
          reasons.push('User provided context for financial situation');
        }
      }
    }
    
    // Consider verification history
    if (verifications.length > 0) {
      const successfulVerifications = verifications.filter(v => v.verificationStatus === 'VERIFIED');
      if (successfulVerifications.length > 0) {
        riskScore -= 15;
        reasons.push('Has successful verification history');
      }
    }
    
    // Consider application engagement
    if (applications.length > 0) {
      riskScore -= 5;
      reasons.push('Actively engaging with job applications');
    }
    
    // Consider reputation if available
    if (reputation) {
      if (reputation.score > 50) {
        riskScore -= 10;
        reasons.push('Positive reputation score');
      }
    }
    
    // Normalize risk score (0-100)
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Determine if this risk level is allowed and what restrictions apply
    const allowed = riskScore < 75; // Only very high risk is denied
    
    // Set appropriate restrictions based on risk level
    const restrictions: any = {};
    
    if (riskScore > 60) {
      restrictions.requiresAdditionalVerification = true;
    }
    
    if (riskScore > 40) {
      restrictions.delayedSettlement = true;
    }
    
    // Generate assistance recommendations based on risk factors
    const assistanceRecommendations = this.generateAssistanceRecommendations(factors);
    
    return {
      allowed,
      riskScore,
      restrictions,
      reason: reasons.join('; '),
      assistanceRecommendations // Additional field for providing constructive assistance
    } as RiskDecision;
  }
  
  // Helper method to generate personalized assistance recommendations
  private generateAssistanceRecommendations(factors: ContextualRiskFactors): string[] {
    const recommendations: string[] = [];
    
    if (factors.hasDriversLicense === false) {
      recommendations.push(
        'Driver\'s License Reinstatement Program: We offer assistance to help you reinstate your driver\'s license.'
      );
    }
    
    if (factors.addressChangesCount && factors.addressChangesCount > 2) {
      recommendations.push(
        'Housing Stability Resources: Connect with local housing assistance programs to find stable housing options.'
      );
    }
    
    if (factors.unemploymentClaimsCount && factors.unemploymentClaimsCount > 2) {
      recommendations.push(
        'Career Transition Support: Access our career counseling services to find stable employment opportunities.'
      );
    }
    
    if (factors.financialStabilityScore && factors.financialStabilityScore < 30) {
      recommendations.push(
        'Financial Wellness Programs: Our partners offer financial literacy courses and emergency assistance for those experiencing hardship.'
      );
    }
    
    return recommendations;
  }
  
  // Method to analyze job application patterns
  async analyzeJobApplicationPatterns(userId: number): Promise<{
    patternRisk: number;
    recommendations: string[];
  }> {
    const applications = await storage.getJobApplicationsByUserId(userId);
    const profile = await storage.getJobProfileByUserId(userId);
    
    let patternRisk = 0;
    const recommendations: string[] = [];
    
    // Check for job-hopping patterns
    if (applications.length > 5) {
      const rejectedApplications = applications.filter(a => a.status === 'REJECTED');
      const rejectionRate = rejectedApplications.length / applications.length;
      
      if (rejectionRate > 0.7) {
        patternRisk += 20;
        recommendations.push('Your application success rate is low. Consider reviewing our resources on interview preparation.');
      }
      
      // Look for applications where user responded to rejection (showing engagement)
      const responsiveRejections = rejectedApplications.filter(a => a.userResponse);
      if (responsiveRejections.length > 0) {
        patternRisk -= 15; // Reduce risk when user engages with feedback
        recommendations.push('Your engagement with application feedback shows commitment to improvement.');
      }
    }
    
    // Skills match analysis
    if (profile?.skills) {
      // This would actually compare skills to job requirements in real implementation
      const hasRelevantSkills = profile.skills.length > 3;
      if (!hasRelevantSkills) {
        patternRisk += 10;
        recommendations.push('Consider developing more skills relevant to your target positions.');
      }
    }
    
    return {
      patternRisk: Math.max(0, Math.min(100, patternRisk)),
      recommendations
    };
  }
}

export const riskAssessmentService = new RiskAssessmentService();