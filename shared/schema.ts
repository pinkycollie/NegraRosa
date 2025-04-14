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
  "PERSONAL_REFERENCE",
  // New financial service verification types
  "BANK_ACCOUNT",
  "PAYMENT_METHOD",
  "TRANSACTION_HISTORY",
  "IDENTITY_VERIFICATION",
  "FINANCIAL_RISK_ASSESSMENT"
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

// WHY System - Quick Submission Methods
export const whySubmissions = pgTable("why_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  triggerType: text("trigger_type").notNull(), // VERIFICATION_FAILED, RISK_ASSESSMENT, MANUAL_REQUEST
  submissionMethod: text("submission_method").notNull(), // SMS, TEXT, SCAN, PHOTO
  content: text("content"), // Text content for TEXT and SMS submissions
  mediaUrl: text("media_url"), // URL to uploaded media (SCAN, PHOTO)
  status: text("status").notNull().default("PENDING"), // PENDING, REVIEWING, RESOLVED, REJECTED
  reviewerId: integer("reviewer_id").references(() => users.id),
  resolution: text("resolution"), // Resolution notes
  facilitated: boolean("facilitated").default(false), // Whether facilitation was involved
  facilitatorInfo: jsonb("facilitator_info"), // Information about the facilitator
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertWhySubmissionSchema = createInsertSchema(whySubmissions).pick({
  userId: true,
  triggerType: true,
  submissionMethod: true,
  content: true,
  mediaUrl: true,
  status: true,
  reviewerId: true,
  resolution: true,
  facilitated: true,
  facilitatorInfo: true,
});

export type InsertWhySubmission = z.infer<typeof insertWhySubmissionSchema>;
export type WhySubmission = typeof whySubmissions.$inferSelect;

// WHY System - Notifications
export const whyNotifications = pgTable("why_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  submissionId: integer("submission_id").references(() => whySubmissions.id),
  notificationType: text("notification_type").notNull(), // SMS, EMAIL, IN_APP
  content: text("content").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, SENT, FAILED, READ
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWhyNotificationSchema = createInsertSchema(whyNotifications).pick({
  userId: true,
  submissionId: true,
  notificationType: true,
  content: true,
  status: true,
});

export type InsertWhyNotification = z.infer<typeof insertWhyNotificationSchema>;
export type WhyNotification = typeof whyNotifications.$inferSelect;

// Webhook system
export const webhooks = pgTable("webhooks", {
  id: text("id").primaryKey(), // UUID
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  event: text("event").notNull(), // verification.created, transaction.processed, why.submitted, etc.
  active: boolean("active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  payload: jsonb("payload"), // Last payload sent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  id: true,
  userId: true,
  name: true,
  url: true,
  event: true,
  active: true,
});

export const webhookPayloads = pgTable("webhook_payloads", {
  id: text("id").primaryKey(), // UUID
  webhookId: text("webhook_id").notNull().references(() => webhooks.id),
  event: text("event").notNull(),
  data: jsonb("data").notNull(),
  deliveryStatus: text("delivery_status").notNull().default("PENDING"), // PENDING, DELIVERED, FAILED
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  notionEntryId: text("notion_entry_id"), // ID of the corresponding Notion database entry
  retryCount: integer("retry_count").default(0), // Count of delivery retry attempts
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertWebhookPayloadSchema = createInsertSchema(webhookPayloads).pick({
  id: true,
  webhookId: true,
  event: true,
  data: true,
  deliveryStatus: true,
  responseCode: true,
  responseBody: true,
  notionEntryId: true,
  retryCount: true,
});

// Vanuatu Compliance - Integrated with Credentials System
export const complianceCredentials = pgTable("compliance_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jurisdictionCode: text("jurisdiction_code").notNull(), // VANUATU, CAYMAN, BVI, etc.
  credentialType: text("credential_type").notNull(), // ENTITY, LICENSE, COMPLIANCE_OFFICER
  status: text("status").notNull(), // PENDING, ACTIVE, REVOKED, EXPIRED
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"), // Jurisdiction-specific metadata
  verificationHash: text("verification_hash"), // For blockchain verification
  verifiableCredentialId: text("verifiable_credential_id"), // For W3C Verifiable Credentials
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertComplianceCredentialSchema = createInsertSchema(complianceCredentials).pick({
  userId: true,
  jurisdictionCode: true,
  credentialType: true,
  status: true,
  issuedAt: true,
  expiresAt: true,
  metadata: true,
  verificationHash: true,
  verifiableCredentialId: true,
});

// Vanuatu-specific compliance schema
export const vanuatuEntities = pgTable("vanuatu_entities", {
  id: serial("id").primaryKey(),
  credentialId: integer("credential_id").notNull().references(() => complianceCredentials.id),
  entityType: text("entity_type").notNull(), // IBC, LIMITED, FOUNDATION
  registrationNumber: text("registration_number").notNull(),
  registeredName: text("registered_name").notNull(),
  registrationDate: timestamp("registration_date"),
  registeredAddress: text("registered_address"),
  registeredAgentName: text("registered_agent_name"),
  directorsData: jsonb("directors_data"), // JSON array of directors
  shareholdersData: jsonb("shareholders_data"), // JSON array of shareholders
  businessActivities: text("business_activities").array(),
  annualFilingDueDate: timestamp("annual_filing_due_date"),
  goodStandingStatus: boolean("good_standing_status").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVanuatuEntitySchema = createInsertSchema(vanuatuEntities).pick({
  credentialId: true,
  entityType: true,
  registrationNumber: true,
  registeredName: true,
  registrationDate: true,
  registeredAddress: true,
  registeredAgentName: true,
  directorsData: true,
  shareholdersData: true,
  businessActivities: true,
  annualFilingDueDate: true,
  goodStandingStatus: true,
});

// Vanuatu Financial Licenses
export const vanuatuLicenses = pgTable("vanuatu_licenses", {
  id: serial("id").primaryKey(),
  credentialId: integer("credential_id").notNull().references(() => complianceCredentials.id),
  entityId: integer("entity_id").references(() => vanuatuEntities.id),
  licenseType: text("license_type").notNull(), // DEALER, BANKING, SECURITIES, INSURANCE
  licenseNumber: text("license_number").notNull(),
  issuanceDate: timestamp("issuance_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  activityScope: text("activity_scope").array(),
  restrictionNotes: text("restriction_notes"),
  regulatoryContactEmail: text("regulatory_contact_email"),
  complianceOfficerId: integer("compliance_officer_id").references(() => users.id),
  annualFeeAmount: real("annual_fee_amount"),
  lastFeePaymentDate: timestamp("last_fee_payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVanuatuLicenseSchema = createInsertSchema(vanuatuLicenses).pick({
  credentialId: true,
  entityId: true,
  licenseType: true,
  licenseNumber: true,
  issuanceDate: true,
  expiryDate: true,
  activityScope: true,
  restrictionNotes: true,
  regulatoryContactEmail: true,
  complianceOfficerId: true,
  annualFeeAmount: true,
  lastFeePaymentDate: true,
});

// Vanuatu Compliance Reports
export const complianceReports = pgTable("compliance_reports", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").references(() => vanuatuEntities.id),
  licenseId: integer("license_id").references(() => vanuatuLicenses.id),
  reportType: text("report_type").notNull(), // ANNUAL_RETURN, KYC_AUDIT, AML_REPORT
  reportPeriodStart: timestamp("report_period_start"),
  reportPeriodEnd: timestamp("report_period_end"),
  filingDate: timestamp("filing_date"),
  status: text("status").notNull(), // DRAFT, SUBMITTED, ACCEPTED, REJECTED
  submissionReference: text("submission_reference"),
  reportContent: jsonb("report_content"),
  attachments: jsonb("attachments"), // URLs to supporting documents
  submittedBy: integer("submitted_by").references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  webhookNotificationSent: boolean("webhook_notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertComplianceReportSchema = createInsertSchema(complianceReports).pick({
  entityId: true,
  licenseId: true,
  reportType: true,
  reportPeriodStart: true,
  reportPeriodEnd: true,
  filingDate: true,
  status: true,
  submissionReference: true,
  reportContent: true,
  attachments: true,
  submittedBy: true,
  reviewedBy: true,
  reviewNotes: true,
  webhookNotificationSent: true,
});

// New compliance verification events for webhooks
export const verificationEvents = [
  ...verificationTypes.options,
  "VANUATU_ENTITY_VERIFICATION",
  "VANUATU_LICENSE_VERIFICATION",
  "VANUATU_ANNUAL_COMPLIANCE",
  "VANUATU_AML_VERIFICATION",
  "VANUATU_KYC_AUDIT",
] as const;

export const extendedVerificationTypes = z.enum(verificationEvents);
export type ExtendedVerificationType = z.infer<typeof extendedVerificationTypes>;

// Export types
export type InsertComplianceCredential = z.infer<typeof insertComplianceCredentialSchema>;
export type ComplianceCredential = typeof complianceCredentials.$inferSelect;

export type InsertVanuatuEntity = z.infer<typeof insertVanuatuEntitySchema>;
export type VanuatuEntity = typeof vanuatuEntities.$inferSelect;

export type InsertVanuatuLicense = z.infer<typeof insertVanuatuLicenseSchema>;
export type VanuatuLicense = typeof vanuatuLicenses.$inferSelect;

export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;
export type ComplianceReport = typeof complianceReports.$inferSelect;

// Finance/Tax/Insurance Module schemas
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionType: text("transaction_type").notNull(), // e.g., "PAYMENT", "REFUND", "TRANSFER", "TAX_FILING"
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  merkleRoot: text("merkle_root"), // For audit trail anchoring
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  taxReportable: boolean("tax_reportable").default(false),
  riskScore: integer("risk_score"),
  anomalyDetected: boolean("anomaly_detected").default(false),
  anomalyDetails: jsonb("anomaly_details"),
});

export const apiFirewallLogs = pgTable("api_firewall_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  requestPath: text("request_path").notNull(),
  requestMethod: text("request_method").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: integer("user_id").references(() => users.id),
  blocked: boolean("blocked").default(false),
  ruleTriggered: text("rule_triggered"),
  riskScore: integer("risk_score"),
  requestPayload: jsonb("request_payload"),
  responseCode: integer("response_code"),
  processingTimeMs: integer("processing_time_ms"),
});

export const insurancePolicies = pgTable("insurance_policies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  policyType: text("policy_type").notNull(), // e.g., "LIABILITY", "E&O", "CYBER"
  policyNumber: text("policy_number").notNull(),
  provider: text("provider").notNull(),
  coverageAmount: real("coverage_amount").notNull(),
  premium: real("premium").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull(),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  claimHistory: jsonb("claim_history"),
  specialConditions: text("special_conditions"),
});

// Real Estate Module schemas
export const propertyDocuments = pgTable("property_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  propertyId: text("property_id").notNull(),
  documentType: text("document_type").notNull(), // e.g., "DEED", "MORTGAGE", "DISCLOSURE"
  documentTitle: text("document_title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileHash: text("file_hash").notNull(), // SHA-256 hash for integrity verification
  issuedBy: text("issued_by"),
  issuedDate: timestamp("issued_date"),
  expirationDate: timestamp("expiration_date"),
  status: text("status").notNull(),
  verificationStatus: text("verification_status").notNull(),
  metadataJson: jsonb("metadata_json"),
  accessLog: jsonb("access_log"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

export const propertyTags = pgTable("property_tags", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  tagType: text("tag_type").notNull(), // "QR" or "NFC"
  tagUid: text("tag_uid").notNull().unique(),
  tagData: jsonb("tag_data").notNull(),
  physicalLocation: text("physical_location"),
  installDate: timestamp("install_date"),
  lastScannedAt: timestamp("last_scanned_at"),
  scannedCount: integer("scanned_count").default(0),
  status: text("status").notNull().default("ACTIVE"),
  securityLevel: text("security_level").notNull().default("STANDARD"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const propertyVerifications = pgTable("property_verifications", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  verificationType: text("verification_type").notNull(), // e.g., "OWNERSHIP", "OCCUPANCY", "CONDITION"
  verifierUserId: integer("verifier_user_id").references(() => users.id),
  verificationDate: timestamp("verification_date").notNull(),
  status: text("status").notNull(),
  findings: jsonb("findings"),
  evidenceUrls: jsonb("evidence_urls"),
  comments: text("comments"),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Business Credit Module schemas
export const businessCreditProfiles = pgTable("business_credit_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  ein: text("ein"), // Employer Identification Number
  duns: text("duns"), // Dun & Bradstreet number
  address: text("address"),
  industry: text("industry"),
  foundingDate: timestamp("founding_date"),
  creditScore: integer("credit_score"),
  scoreDate: timestamp("score_date"),
  scoreProvider: text("score_provider"), // e.g., "EXPERIAN", "EQUIFAX", "INTERNAL"
  financialHealth: text("financial_health"), // e.g., "EXCELLENT", "GOOD", "FAIR", "POOR"
  creditUtilization: real("credit_utilization"), // Percentage
  paymentHistory: jsonb("payment_history"),
  publicRecords: jsonb("public_records"),
  tradelines: jsonb("tradelines"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  dataSourcesByEnrichment: jsonb("data_sources"),
  zkpVerified: boolean("zkp_verified").default(false)
});

export const creditEnrichmentLogs = pgTable("credit_enrichment_logs", {
  id: serial("id").primaryKey(),
  businessCreditProfileId: integer("business_credit_profile_id").notNull().references(() => businessCreditProfiles.id),
  dataSource: text("data_source").notNull(), // e.g., "EXPERIAN", "EQUIFAX", "DNB"
  enrichmentType: text("enrichment_type").notNull(), // e.g., "CREDIT_SCORE", "TRADE_LINES", "PUBLIC_RECORDS"
  requestTimestamp: timestamp("request_timestamp").notNull().defaultNow(),
  responseTimestamp: timestamp("response_timestamp"),
  successful: boolean("successful").default(false),
  errorMessage: text("error_message"),
  dataRetrieved: jsonb("data_retrieved"),
  creditScoreChange: integer("credit_score_change"),
  costAmount: real("cost_amount"), // Cost of the API call if applicable
  apiRequestId: text("api_request_id"), // External API reference ID
  userId: integer("user_id").references(() => users.id),
});

export const zkpCreditProofs = pgTable("zkp_credit_proofs", {
  id: serial("id").primaryKey(),
  businessCreditProfileId: integer("business_credit_profile_id").notNull().references(() => businessCreditProfiles.id),
  proofType: text("proof_type").notNull(), // e.g., "CREDIT_SCORE_RANGE", "PAYMENT_HISTORY", "AGE_OF_BUSINESS"
  proofData: jsonb("proof_data").notNull(),
  isValid: boolean("is_valid").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  verificationCount: integer("verification_count").default(0),
  lastVerifiedAt: timestamp("last_verified_at"),
  publicIdentifier: text("public_identifier"), // Public reference for third parties
  createdBy: integer("created_by").references(() => users.id),
});

// Insert schema definitions
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).pick({
  userId: true,
  transactionType: true,
  amount: true,
  currency: true,
  status: true,
  description: true,
  metadata: true,
  merkleRoot: true,
  ipAddress: true,
  userAgent: true,
  taxReportable: true,
  riskScore: true,
  anomalyDetected: true,
  anomalyDetails: true
});

export const insertApiFirewallLogSchema = createInsertSchema(apiFirewallLogs).pick({
  requestPath: true,
  requestMethod: true,
  ipAddress: true,
  userAgent: true,
  userId: true,
  blocked: true,
  ruleTriggered: true,
  riskScore: true,
  requestPayload: true,
  responseCode: true,
  processingTimeMs: true
});

export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).pick({
  userId: true,
  policyType: true,
  policyNumber: true,
  provider: true,
  coverageAmount: true,
  premium: true,
  startDate: true,
  endDate: true,
  status: true,
  documentUrl: true,
  claimHistory: true,
  specialConditions: true
});

export const insertPropertyDocumentSchema = createInsertSchema(propertyDocuments).pick({
  userId: true,
  propertyId: true,
  documentType: true,
  documentTitle: true,
  fileUrl: true,
  fileHash: true,
  issuedBy: true,
  issuedDate: true,
  expirationDate: true,
  status: true,
  verificationStatus: true,
  metadataJson: true,
  accessLog: true
});

export const insertPropertyTagSchema = createInsertSchema(propertyTags).pick({
  propertyId: true,
  tagType: true,
  tagUid: true,
  tagData: true,
  physicalLocation: true,
  installDate: true,
  securityLevel: true,
  createdBy: true
});

export const insertPropertyVerificationSchema = createInsertSchema(propertyVerifications).pick({
  propertyId: true,
  verificationType: true,
  verifierUserId: true,
  verificationDate: true,
  status: true,
  findings: true,
  evidenceUrls: true,
  comments: true,
  expirationDate: true
});

export const insertBusinessCreditProfileSchema = createInsertSchema(businessCreditProfiles).pick({
  userId: true,
  businessName: true,
  ein: true,
  duns: true,
  address: true,
  industry: true,
  foundingDate: true,
  creditScore: true,
  scoreDate: true,
  scoreProvider: true,
  financialHealth: true,
  creditUtilization: true,
  paymentHistory: true,
  publicRecords: true,
  tradelines: true,
  dataSourcesByEnrichment: true,
  zkpVerified: true
});

export const insertCreditEnrichmentLogSchema = createInsertSchema(creditEnrichmentLogs).pick({
  businessCreditProfileId: true,
  dataSource: true,
  enrichmentType: true,
  responseTimestamp: true,
  successful: true,
  errorMessage: true,
  dataRetrieved: true,
  creditScoreChange: true,
  costAmount: true,
  apiRequestId: true,
  userId: true
});

export const insertZkpCreditProofSchema = createInsertSchema(zkpCreditProofs).pick({
  businessCreditProfileId: true,
  proofType: true,
  proofData: true,
  isValid: true,
  expiresAt: true,
  publicIdentifier: true,
  createdBy: true
});

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;

export type InsertWebhookPayload = z.infer<typeof insertWebhookPayloadSchema>;
export type WebhookPayload = typeof webhookPayloads.$inferSelect;

// Domain-Specific Module types
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

export type InsertApiFirewallLog = z.infer<typeof insertApiFirewallLogSchema>;
export type ApiFirewallLog = typeof apiFirewallLogs.$inferSelect;

export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;

export type InsertPropertyDocument = z.infer<typeof insertPropertyDocumentSchema>;
export type PropertyDocument = typeof propertyDocuments.$inferSelect;

export type InsertPropertyTag = z.infer<typeof insertPropertyTagSchema>;
export type PropertyTag = typeof propertyTags.$inferSelect;

export type InsertPropertyVerification = z.infer<typeof insertPropertyVerificationSchema>;
export type PropertyVerification = typeof propertyVerifications.$inferSelect;

export type InsertBusinessCreditProfile = z.infer<typeof insertBusinessCreditProfileSchema>;
export type BusinessCreditProfile = typeof businessCreditProfiles.$inferSelect;

export type InsertCreditEnrichmentLog = z.infer<typeof insertCreditEnrichmentLogSchema>;
export type CreditEnrichmentLog = typeof creditEnrichmentLogs.$inferSelect;

export type InsertZkpCreditProof = z.infer<typeof insertZkpCreditProofSchema>;
export type ZkpCreditProof = typeof zkpCreditProofs.$inferSelect;
