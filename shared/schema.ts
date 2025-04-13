import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
});

// Verification methods
export const verificationTypes = z.enum([
  "PREPAID_CARD",
  "GOVERNMENT_ID",
  "UTILITY_BILL",
  "PHONE_NUMBER",
  "BUSINESS_EXPLANATION",
  "FINANCIAL_CONTEXT",
  "PERSONAL_REFERENCE"
]);

export type VerificationType = z.infer<typeof verificationTypes>;

// Verification table to track verifications
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  status: text("status").notNull(), // PENDING, VERIFIED, REJECTED
  data: jsonb("data"), // Additional data specific to the verification method
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

export const insertVerificationSchema = createInsertSchema(verifications).pick({
  userId: true,
  type: true,
  status: true,
  data: true,
});

// User reputation schema
export const reputations = pgTable("reputations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  score: real("score").notNull().default(0),
  positiveTransactions: integer("positive_transactions").default(0),
  totalTransactions: integer("total_transactions").default(0),
  verificationCount: integer("verification_count").default(0),
  accountAge: integer("account_age").default(0), // In days
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReputationSchema = createInsertSchema(reputations).pick({
  userId: true,
  score: true,
  positiveTransactions: true,
  totalTransactions: true,
  verificationCount: true,
  accountAge: true,
});

// Transactions to track user activity
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  recipientId: text("recipient_id"),
  status: text("status").notNull(), // PENDING, COMPLETED, FAILED, FLAGGED
  riskScore: real("risk_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  recipientId: true,
  status: true,
  riskScore: true,
});

// Risk assessment results
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  allowed: boolean("allowed").notNull(),
  riskScore: real("risk_score").notNull(),
  restrictions: jsonb("restrictions"), // JSON containing any restrictions applied
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).pick({
  transactionId: true,
  allowed: true,
  riskScore: true,
  restrictions: true,
  reason: true,
});

// E&O claims schema
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionId: integer("transaction_id").references(() => transactions.id),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull(), // PENDING, APPROVED, REJECTED
  settlementAmount: real("settlement_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertClaimSchema = createInsertSchema(claims).pick({
  userId: true,
  transactionId: true,
  description: true,
  amount: true,
  status: true,
});

// Define types based on schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;

export type InsertReputation = z.infer<typeof insertReputationSchema>;
export type Reputation = typeof reputations.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

// Enums and other types for API responses
export enum AccessTier {
  BASIC = "BASIC",
  STANDARD = "STANDARD",
  FULL = "FULL",
}

export interface VerificationResult {
  success: boolean;
  message: string;
  verificationId?: number;
}

export interface ReputationScore {
  value: number;
  positiveTransactions: number;
  totalTransactions: number;
  verificationCount: number;
  accountAge: number;
  tier: AccessTier;
}

export interface RiskDecision {
  allowed: boolean;
  riskScore: number;
  restrictions?: {
    maxAmount?: number;
    requiresAdditionalVerification?: boolean;
    delayedSettlement?: boolean;
    limitedRecipients?: boolean;
  };
  reason?: string;
  assistanceRecommendations?: string[];  // New field for providing constructive assistance
  contextualFactors?: {
    addressChanges?: string;
    employmentGaps?: string;
    financialHardship?: string;
    identityDocuments?: string;
    otherFactors?: string;
  };
}

export interface CoverageDecision {
  covered: boolean;
  coverageLimit?: number;
  premium?: number;
  reason?: string;
}

export interface ClaimResult {
  approved: boolean;
  settlementAmount?: number;
  settlement?: {
    id: string;
    amount: number;
    date: Date;
    notes: string;
  };
  reason?: string;
}

// Entrepreneur profiles
export const entrepreneurProfiles = pgTable("entrepreneur_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name"),
  businessDescription: text("business_description"),
  yearsInBusiness: integer("years_in_business"),
  industry: text("industry"),
  websiteUrl: text("website_url"), // URL to entrepreneur's business/project website
  githubUrl: text("github_url"), // Optional GitHub repository URL
  websiteVerified: boolean("website_verified").default(false), // Indicates if website has been verified
  previousFunding: real("previous_funding"),
  financialContext: text("financial_context"),
  businessModel: text("business_model"),
  cashEarningContext: text("cash_earning_context"),
  personalStatement: text("personal_statement"),
  metricsData: jsonb("metrics_data"), // JSON data with business metrics and verification results
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEntrepreneurProfileSchema = createInsertSchema(entrepreneurProfiles).pick({
  userId: true,
  businessName: true,
  businessDescription: true,
  yearsInBusiness: true,
  industry: true,
  websiteUrl: true,
  githubUrl: true,
  websiteVerified: true,
  previousFunding: true,
  financialContext: true,
  businessModel: true,
  cashEarningContext: true,
  personalStatement: true,
  metricsData: true,
});

export type InsertEntrepreneurProfile = z.infer<typeof insertEntrepreneurProfileSchema>;
export type EntrepreneurProfile = typeof entrepreneurProfiles.$inferSelect;

// JSON data upload records
export const jsonDataUploads = pgTable("json_data_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  profileId: integer("profile_id").references(() => entrepreneurProfiles.id),
  dataType: text("data_type").notNull(), // BUSINESS_METRICS, CUSTOMER_DATA, FINANCIAL_PROJECTIONS, etc.
  data: jsonb("data").notNull(),
  explanation: text("explanation"), // User's explanation of the data context
  aiInsights: text("ai_insights"), // ML-generated insights from the data
  status: text("status").notNull(), // UPLOADED, PROCESSED, APPROVED, REJECTED
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJsonDataUploadSchema = createInsertSchema(jsonDataUploads).pick({
  userId: true,
  profileId: true,
  dataType: true,
  data: true,
  explanation: true,
  status: true,
});

export type InsertJsonDataUpload = z.infer<typeof insertJsonDataUploadSchema>;
export type JsonDataUpload = typeof jsonDataUploads.$inferSelect;

// Job profiles and background verification
export const jobProfiles = pgTable("job_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"), // Current or desired job title
  skills: text("skills").array(), // Array of skills
  experience: jsonb("experience"), // JSON array of work experiences
  education: jsonb("education"), // JSON array of education history
  certifications: jsonb("certifications"), // JSON array of certifications
  probationaryStatus: boolean("probationary_status").default(false),
  rehabilitationContext: text("rehabilitation_context"), // Context about rehabilitation if applicable
  accessibilityNeeds: jsonb("accessibility_needs"), // Any accessibility requirements
  preferredWorkEnvironment: text("preferred_work_environment"), // Remote, hybrid, on-site, etc.
  activityScore: real("activity_score").default(0), // Score based on job-seeking activity
  personalStatement: text("personal_statement"), // Personal explanation or context
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobProfileSchema = createInsertSchema(jobProfiles).pick({
  userId: true,
  title: true,
  skills: true,
  experience: true,
  education: true,
  certifications: true,
  probationaryStatus: true,
  rehabilitationContext: true,
  accessibilityNeeds: true,
  preferredWorkEnvironment: true,
  personalStatement: true,
});

export type InsertJobProfile = z.infer<typeof insertJobProfileSchema>;
export type JobProfile = typeof jobProfiles.$inferSelect;

export const backgroundVerifications = pgTable("background_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  profileId: integer("profile_id").references(() => jobProfiles.id),
  verificationType: text("verification_type").notNull(), // CRIMINAL, EDUCATION, EMPLOYMENT, etc.
  reportedIssue: text("reported_issue"), // Description of any reported issues
  userExplanation: text("user_explanation"), // User's explanation of any issues
  verificationStatus: text("verification_status").notNull(), // PENDING, VERIFIED, FLAGGED
  documentReferences: jsonb("document_references"), // References to supporting documents
  aiAnalysis: text("ai_analysis"), // AI assessment of explanation vs. report
  recommendedAction: text("recommended_action"), // AI/human recommended action for employers
  probationaryPeriod: integer("probationary_period"), // Recommended probation period in days
  alternativePositions: jsonb("alternative_positions"), // Suggested alternative positions
  transparencyNotes: text("transparency_notes"), // Notes for transparency to job seeker
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBackgroundVerificationSchema = createInsertSchema(backgroundVerifications).pick({
  userId: true,
  profileId: true,
  verificationType: true,
  reportedIssue: true,
  userExplanation: true,
  verificationStatus: true,
  documentReferences: true,
  transparencyNotes: true,
});

export type InsertBackgroundVerification = z.infer<typeof insertBackgroundVerificationSchema>;
export type BackgroundVerification = typeof backgroundVerifications.$inferSelect;

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  profileId: integer("profile_id").references(() => jobProfiles.id),
  companyName: text("company_name").notNull(),
  positionTitle: text("position_title").notNull(),
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  status: text("status").notNull(), // APPLIED, INTERVIEWING, REJECTED, ACCEPTED
  rejectionReason: text("rejection_reason"),
  userResponse: text("user_response"), // User's response to rejection/feedback
  transparencyReport: jsonb("transparency_report"), // Detailed report on decision factors
  aiRecommendedImprovements: text("ai_recommended_improvements"),
  activitiesCompleted: jsonb("activities_completed"), // Job search activities completed
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).pick({
  userId: true,
  profileId: true,
  companyName: true,
  positionTitle: true,
  applicationDate: true,
  status: true,
  rejectionReason: true,
  userResponse: true,
  activitiesCompleted: true,
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
