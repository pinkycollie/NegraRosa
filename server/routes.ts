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
  insertEntrepreneurProfileSchema,
  insertJsonDataUploadSchema,
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

  // Entrepreneur profile endpoints
  apiRouter.post("/users/:userId/entrepreneur-profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getEntrepreneurProfileByUserId(userId);
      if (existingProfile) {
        return res.status(409).json({ message: "Entrepreneur profile already exists for this user" });
      }
      
      // Validate profile data
      const profileData = {
        ...req.body,
        userId
      };
      
      const validatedData = insertEntrepreneurProfileSchema.parse(profileData);
      
      // Create profile
      const profile = await storage.createEntrepreneurProfile(validatedData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error creating entrepreneur profile:", error);
      res.status(500).json({ message: "Server error creating entrepreneur profile" });
    }
  });
  
  apiRouter.get("/users/:userId/entrepreneur-profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getEntrepreneurProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Entrepreneur profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching entrepreneur profile:", error);
      res.status(500).json({ message: "Server error fetching entrepreneur profile" });
    }
  });
  
  apiRouter.patch("/users/:userId/entrepreneur-profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get existing profile
      const profile = await storage.getEntrepreneurProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Entrepreneur profile not found" });
      }
      
      // Update profile
      const updatedProfile = await storage.updateEntrepreneurProfile(profile.id, req.body);
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating entrepreneur profile:", error);
      res.status(500).json({ message: "Server error updating entrepreneur profile" });
    }
  });
  
  // JSON data upload endpoints
  apiRouter.post("/users/:userId/json-data-uploads", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate upload data
      const uploadData = {
        ...req.body,
        userId,
        status: "UPLOADED" // Initial status
      };
      
      // Check if JSON data is valid
      try {
        // If it's a string, parse it to ensure it's valid JSON
        if (typeof uploadData.data === 'string') {
          JSON.parse(uploadData.data);
          // Convert the string to an object
          uploadData.data = JSON.parse(uploadData.data);
        } else if (typeof uploadData.data !== 'object') {
          return res.status(400).json({ message: "Data must be a valid JSON object" });
        }
      } catch (jsonError) {
        return res.status(400).json({ message: "Invalid JSON data format" });
      }
      
      const validatedData = insertJsonDataUploadSchema.parse(uploadData);
      
      // Create upload
      const upload = await storage.createJsonDataUpload(validatedData);
      
      res.status(201).json(upload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid JSON data upload", errors: error.errors });
      }
      console.error("Error creating JSON data upload:", error);
      res.status(500).json({ message: "Server error creating JSON data upload" });
    }
  });
  
  apiRouter.get("/users/:userId/json-data-uploads", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const uploads = await storage.getJsonDataUploadsByUserId(userId);
      
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching JSON data uploads:", error);
      res.status(500).json({ message: "Server error fetching JSON data uploads" });
    }
  });
  
  apiRouter.get("/json-data-uploads/:id", async (req, res) => {
    try {
      const uploadId = parseInt(req.params.id);
      if (isNaN(uploadId)) {
        return res.status(400).json({ message: "Invalid upload ID" });
      }
      
      const upload = await storage.getJsonDataUpload(uploadId);
      if (!upload) {
        return res.status(404).json({ message: "JSON data upload not found" });
      }
      
      res.json(upload);
    } catch (error) {
      console.error("Error fetching JSON data upload:", error);
      res.status(500).json({ message: "Server error fetching JSON data upload" });
    }
  });
  
  apiRouter.patch("/json-data-uploads/:id", async (req, res) => {
    try {
      const uploadId = parseInt(req.params.id);
      if (isNaN(uploadId)) {
        return res.status(400).json({ message: "Invalid upload ID" });
      }
      
      const upload = await storage.getJsonDataUpload(uploadId);
      if (!upload) {
        return res.status(404).json({ message: "JSON data upload not found" });
      }
      
      const { status, aiInsights } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Update upload
      const updatedUpload = await storage.updateJsonDataUpload(uploadId, status, aiInsights);
      
      res.json(updatedUpload);
    } catch (error) {
      console.error("Error updating JSON data upload:", error);
      res.status(500).json({ message: "Server error updating JSON data upload" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
