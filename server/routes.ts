import { Router, json, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { InclusiveAuthManager } from "./services/InclusiveAuthManager";
import { ReputationManager } from "./services/ReputationManager";
import { RiskManager } from "./services/RiskManager";
import { FraudDetectionEngine } from "./services/FraudDetectionEngine";
import { ErrorsAndOmissionsManager } from "./services/ErrorsAndOmissionsManager";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertVerificationSchema, 
  insertTransactionSchema, 
  insertClaimSchema,
  verificationTypes
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const authManager = new InclusiveAuthManager();
  const reputationManager = new ReputationManager();
  const riskManager = new RiskManager();
  const fraudDetectionEngine = new FraudDetectionEngine();
  const errorAndOmissionsManager = new ErrorsAndOmissionsManager();
  
  // Create API router
  const apiRouter = Router();
  app.use("/api", apiRouter);
  
  // Log API requests
  apiRouter.use((req, res, next) => {
    console.log(`API Request: ${req.method} ${req.path}`);
    next();
  });
  
  // Apply JSON middleware
  apiRouter.use(json());
  
  // User endpoints
  apiRouter.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Server error creating user" });
    }
  });
  
  apiRouter.get("/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error fetching user" });
    }
  });
  
  // Verification endpoints
  apiRouter.post("/users/:userId/verifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate verification type
      const verificationType = verificationTypes.safeParse(req.body.type);
      if (!verificationType.success) {
        return res.status(400).json({ message: "Invalid verification type" });
      }
      
      // Verify user with provided method
      const result = await authManager.verifyUser(
        userId,
        verificationType.data,
        req.body.data
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error with verification:", error);
      res.status(500).json({ message: "Server error during verification" });
    }
  });
  
  apiRouter.get("/users/:userId/verifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const verifications = await storage.getVerificationsByUserId(userId);
      const status = await authManager.getUserVerificationStatus(userId);
      
      res.json({ verifications, status });
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ message: "Server error fetching verifications" });
    }
  });
  
  apiRouter.get("/users/:userId/access-tier", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const tier = await authManager.getUserAccessTier(userId);
      
      res.json({ tier });
    } catch (error) {
      console.error("Error fetching access tier:", error);
      res.status(500).json({ message: "Server error fetching access tier" });
    }
  });
  
  // Reputation endpoints
  apiRouter.get("/users/:userId/reputation", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const reputationScore = await reputationManager.getUserReputationScore(userId);
      const recommendations = await reputationManager.getImprovementRecommendations(userId);
      
      res.json({ reputation: reputationScore, recommendations });
    } catch (error) {
      console.error("Error fetching reputation:", error);
      res.status(500).json({ message: "Server error fetching reputation" });
    }
  });
  
  apiRouter.get("/users/:userId/transaction-limits", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const limits = await reputationManager.getTransactionLimits(userId);
      
      res.json(limits);
    } catch (error) {
      console.error("Error fetching transaction limits:", error);
      res.status(500).json({ message: "Server error fetching transaction limits" });
    }
  });
  
  // Transaction endpoints
  apiRouter.post("/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate transaction data
      const transactionData = {
        ...req.body,
        userId,
        status: "PENDING", // All transactions start as pending
      };
      
      const validatedData = insertTransactionSchema.parse(transactionData);
      
      // Create transaction
      const transaction = await storage.createTransaction(validatedData);
      
      // Evaluate transaction risk
      const riskDecision = await riskManager.evaluateTransactionRisk(transaction);
      
      // Apply fraud detection
      const userTransactions = await storage.getTransactionsByUserId(userId);
      const reputation = await storage.getReputation(userId);
      if (!reputation) {
        return res.status(404).json({ message: "User reputation not found" });
      }
      
      const userHistory = {
        transactionCount: userTransactions.length,
        successfulTransactionRatio: reputation.totalTransactions > 0 
          ? reputation.positiveTransactions / reputation.totalTransactions
          : 0,
        accountAgeInDays: reputation.accountAge,
        hasSuccessfulVerifications: reputation.verificationCount > 0,
        recentActivity: userTransactions.slice(0, 5),
        improvementTrend: false // This would be calculated from historical data
      };
      
      const fraudAnalysis = await fraudDetectionEngine.analyzeTransaction(
        transaction,
        userHistory
      );
      
      // Update transaction status based on risk and fraud analysis
      let finalStatus = "PENDING";
      if (riskDecision.allowed && fraudAnalysis.action === "allow") {
        finalStatus = "COMPLETED";
      } else if (fraudAnalysis.action === "block") {
        finalStatus = "FAILED";
      }
      
      await storage.updateTransaction(transaction.id, finalStatus);
      
      // If transaction is completed, check for E&O coverage
      let coverageDecision = null;
      if (finalStatus === "COMPLETED") {
        coverageDecision = await errorAndOmissionsManager.evaluateForCoverage(transaction);
      }
      
      res.status(201).json({
        transaction: {
          ...transaction,
          status: finalStatus
        },
        riskDecision,
        fraudAnalysis,
        coverageDecision
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Server error creating transaction" });
    }
  });
  
  apiRouter.get("/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const transactions = await storage.getTransactionsByUserId(userId);
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Server error fetching transactions" });
    }
  });
  
  apiRouter.get("/transactions/:id/risk-assessment", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      const riskBreakdown = await riskManager.getRiskBreakdown(transactionId);
      
      res.json(riskBreakdown);
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
      res.status(500).json({ message: "Server error fetching risk assessment" });
    }
  });
  
  // E&O claims endpoints
  apiRouter.post("/users/:userId/claims", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate claim data
      const claimData = {
        ...req.body,
        userId,
        status: "PENDING", // All claims start as pending
      };
      
      const validatedData = insertClaimSchema.parse(claimData);
      
      // Process claim
      const claim = {
        id: 0, // Will be assigned by processClain
        userId,
        transactionId: validatedData.transactionId || 0,
        description: validatedData.description,
        amount: validatedData.amount
      };
      
      const claimResult = await errorAndOmissionsManager.processClaim(claim);
      
      res.status(201).json(claimResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid claim data", errors: error.errors });
      }
      console.error("Error creating claim:", error);
      res.status(500).json({ message: "Server error creating claim" });
    }
  });
  
  apiRouter.get("/users/:userId/claims", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const claims = await storage.getClaimsByUserId(userId);
      
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ message: "Server error fetching claims" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
