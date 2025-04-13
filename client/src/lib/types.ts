// Core types for NegraRosa Security Framework frontend
import { AccessTier, VerificationType } from "@shared/schema";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  createdAt: string;
}

export interface VerificationMethod {
  type: VerificationType;
  title: string;
  description: string;
  icon: string;
}

export interface AccessTierInfo {
  tier: AccessTier;
  title: string;
  description: string;
  requirementText: string;
  isCurrent: boolean;
}

export interface ReputationMetric {
  name: string;
  value: string | number;
  percentage: number;
}

export interface ImprovementRecommendation {
  text: string;
}

export interface ReputationSummary {
  score: number;
  metrics: ReputationMetric[];
  recommendations: ImprovementRecommendation[];
}

export interface TransactionLimit {
  name: string;
  current: number;
  max: number;
  percentUsed: number;
}

export interface RiskFactor {
  name: string;
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  recipientId?: string;
  status: string;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRiskAssessment {
  riskFactors: RiskFactor[];
  overallRisk: number;
  decision: {
    allowed: boolean;
    riskScore: number;
    restrictions?: {
      maxAmount?: number;
      requiresAdditionalVerification?: boolean;
      delayedSettlement?: boolean;
      limitedRecipients?: boolean;
    };
    reason?: string;
  };
}

export enum AuthTab {
  AUTHENTICATION = "authentication",
  REPUTATION = "reputation",
  RISK = "risk",
  FRAUD = "fraud",
  ENO = "eno"
}

export interface TabItem {
  id: AuthTab;
  label: string;
}
