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
  previousFunding: real("previous_funding"),
  financialContext: text("financial_context"),
  businessModel: text("business_model"),
  cashEarningContext: text("cash_earning_context"),
  personalStatement: text("personal_statement"),
  metricsData: jsonb("metrics_data"), // JSON data with business metrics
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEntrepreneurProfileSchema = createInsertSchema(entrepreneurProfiles).pick({
  userId: true,
  businessName: true,
  businessDescription: true,
  yearsInBusiness: true,
  industry: true,
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
