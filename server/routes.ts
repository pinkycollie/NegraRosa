import { Router, json, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { InclusiveAuthManager } from "./services/InclusiveAuthManager";
import { ReputationManager } from "./services/ReputationManager";
import { RiskManager } from "./services/RiskManager";
import { FraudDetectionEngine } from "./services/FraudDetectionEngine";
import { ErrorsAndOmissionsManager } from "./services/ErrorsAndOmissionsManager";
import { WebsiteVerificationService } from "./services/WebsiteVerificationService";
import { riskAssessmentService } from "./services/RiskAssessmentService";
import { InclusiveVerificationService } from "./services/InclusiveVerificationService";
import { AuthService } from "./services/AuthService";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertVerificationSchema, 
  insertTransactionSchema, 
  insertClaimSchema,
  insertEntrepreneurProfileSchema,
  insertJsonDataUploadSchema,
  insertWhySubmissionSchema,
  insertWhyNotificationSchema,
  verificationTypes
} from "@shared/schema";
import { FinancialVerificationService } from "./services/integrations/FinancialVerificationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const authManager = new InclusiveAuthManager();
  const reputationManager = new ReputationManager();
  const riskManager = new RiskManager();
  const financialVerificationService = new FinancialVerificationService();
  const fraudDetectionEngine = new FraudDetectionEngine();
  const errorAndOmissionsManager = new ErrorsAndOmissionsManager();
  const websiteVerificationService = new WebsiteVerificationService();
  const inclusiveVerificationService = new InclusiveVerificationService(
    process.env.N8N_VERIFICATION_WEBHOOK
  );
  const authService = new AuthService();
  
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
  
  // Inclusive verification endpoints
  apiRouter.post("/verifications/phone", async (req, res) => {
    try {
      const { userId, phoneNumber, metadata } = req.body;
      
      if (!userId || !phoneNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const result = await inclusiveVerificationService.verifyPhone(
        parseInt(userId),
        phoneNumber,
        metadata
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error with phone verification:", error);
      res.status(500).json({ message: "Server error during phone verification" });
    }
  });
  
  apiRouter.post("/verifications/:id/complete", async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(verificationId) || !status) {
        return res.status(400).json({ message: "Invalid request" });
      }
      
      const result = await inclusiveVerificationService.completeVerification(
        verificationId,
        status
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error completing verification:", error);
      res.status(500).json({ message: "Server error completing verification" });
    }
  });
  
  apiRouter.post("/verifications/:id/video", async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const { videoData } = req.body;
      
      if (isNaN(verificationId)) {
        return res.status(400).json({ message: "Invalid verification ID" });
      }
      
      const result = await inclusiveVerificationService.processVideoVerification(
        verificationId,
        videoData
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error processing video verification:", error);
      res.status(500).json({ message: "Server error processing video verification" });
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
  
  // Website verification endpoints
  apiRouter.post("/verify-website", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      // Verify the website
      const result = await websiteVerificationService.verifyWebsite(url);
      
      res.json(result);
    } catch (error) {
      console.error("Error verifying website:", error);
      res.status(500).json({ message: "Server error verifying website" });
    }
  });
  
  apiRouter.get("/website-metrics", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL query parameter is required" });
      }
      
      // Get website metrics
      const metrics = await websiteVerificationService.getWebsiteMetrics(url);
      
      res.json(metrics);
    } catch (error) {
      console.error("Error getting website metrics:", error);
      res.status(500).json({ message: "Server error getting website metrics" });
    }
  });
  
  apiRouter.post("/entrepreneur-profiles/:profileId/verify-website", async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      if (isNaN(profileId)) {
        return res.status(400).json({ message: "Invalid profile ID" });
      }
      
      // Get the profile
      const profile = await storage.getEntrepreneurProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Entrepreneur profile not found" });
      }
      
      // Verify the website from the profile's websiteUrl
      const result = await websiteVerificationService.verifyEntrepreneurWebsite(profileId);
      
      res.json(result);
    } catch (error) {
      console.error("Error verifying entrepreneur website:", error);
      res.status(500).json({ message: "Server error verifying entrepreneur website" });
    }
  });
  
  // Contextual risk assessment endpoints
  apiRouter.post("/users/:userId/risk-assessment-with-context", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate contextual factors
      const contextualFactors = req.body;
      
      // Perform risk assessment with contextual factors
      const riskDecision = await riskAssessmentService.assessRiskWithContext(userId, contextualFactors);
      
      res.json({
        riskDecision,
        contextualFactors,
        message: "Risk assessment completed with contextual factors considered."
      });
    } catch (error) {
      console.error("Error performing contextual risk assessment:", error);
      res.status(500).json({ message: "Server error during risk assessment" });
    }
  });
  
  apiRouter.post("/users/:userId/job-application-patterns", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Analyze job application patterns
      const analysis = await riskAssessmentService.analyzeJobApplicationPatterns(userId);
      
      res.json({
        analysis,
        message: "Job application pattern analysis completed."
      });
    } catch (error) {
      console.error("Error analyzing job application patterns:", error);
      res.status(500).json({ message: "Server error during job application analysis" });
    }
  });
  
  // Authentication endpoints
  apiRouter.post("/auth/biometric", async (req, res) => {
    try {
      const { faceData } = req.body;
      
      if (!faceData) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required biometric data" 
        });
      }
      
      const authResult = await authService.authenticateWithBiometrics(faceData);
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          message: authResult.message
        });
      }
      
      res.json({
        success: true,
        token: authResult.token,
        userId: authResult.userId,
        message: "Biometric authentication successful"
      });
    } catch (error) {
      console.error("Error with biometric authentication:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during biometric authentication" 
      });
    }
  });
  
  apiRouter.post("/auth/nft", async (req, res) => {
    try {
      const { nftToken } = req.body;
      
      if (!nftToken) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing NFT token" 
        });
      }
      
      const authResult = await authService.authenticateWithNft(nftToken);
      
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          message: authResult.message
        });
      }
      
      res.json({
        success: true,
        token: authResult.token,
        userId: authResult.userId,
        message: "NFT authentication successful"
      });
    } catch (error) {
      console.error("Error with NFT authentication:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during NFT authentication" 
      });
    }
  });
  
  apiRouter.post("/auth/recover", async (req, res) => {
    try {
      const { recoveryCode, newBiometricData } = req.body;
      
      if (!recoveryCode || !newBiometricData) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing recovery code or new biometric data" 
        });
      }
      
      const recoveryResult = await authService.recoverAccount(recoveryCode, newBiometricData);
      
      if (!recoveryResult.success) {
        return res.status(401).json({
          success: false,
          message: recoveryResult.message
        });
      }
      
      res.json({
        success: true,
        token: recoveryResult.token,
        userId: recoveryResult.userId,
        message: "Account recovery successful"
      });
    } catch (error) {
      console.error("Error with account recovery:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during account recovery" 
      });
    }
  });
  
  apiRouter.get("/auth/verification-methods", async (req, res) => {
    try {      
      const methods = await authService.getAvailableVerificationMethods();
      
      res.json({
        success: true,
        methods
      });
    } catch (error) {
      console.error("Error fetching verification methods:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error fetching verification methods" 
      });
    }
  });
  
  // WHY Submission Routes
  apiRouter.post("/users/:userId/why-submissions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Validate submission data
      const submissionData = {
        ...req.body,
        userId,
        status: "PENDING", // All submissions start as pending
      };
      
      const validatedData = insertWhySubmissionSchema.parse(submissionData);
      
      // Create submission
      const submission = await storage.createWhySubmission(validatedData);
      
      // Create notification for the user
      const notification = await storage.createWhyNotification({
        userId,
        content: "Your WHY submission has been received and is being reviewed",
        submissionId: submission.id,
        notificationType: "SUBMISSION_RECEIVED",
        status: "PENDING"
      });
      
      res.status(201).json({
        submission,
        notification,
        message: "WHY submission received successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      console.error("Error creating WHY submission:", error);
      res.status(500).json({ message: "Server error creating WHY submission" });
    }
  });
  
  // Get user's WHY submissions
  apiRouter.get("/users/:userId/why-submissions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const submissions = await storage.getWhySubmissionsByUserId(userId);
      
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching WHY submissions:", error);
      res.status(500).json({ message: "Server error fetching WHY submissions" });
    }
  });
  
  // Get specific WHY submission
  apiRouter.get("/why-submissions/:id", async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const submission = await storage.getWhySubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "WHY submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching WHY submission:", error);
      res.status(500).json({ message: "Server error fetching WHY submission" });
    }
  });
  
  // Update WHY submission (resolve, facilitate, etc.)
  apiRouter.patch("/why-submissions/:id", async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const { status, reviewerId, resolution, facilitated, facilitatorInfo } = req.body;
      
      const updatedSubmission = await storage.updateWhySubmission(
        submissionId,
        {
          status,
          reviewerId,
          resolution,
          facilitated,
          facilitatorInfo,
          ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {})
        }
      );
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: "WHY submission not found" });
      }
      
      // Create notification for the user about the update
      if (status) {
        const notificationContent = status === "RESOLVED" 
          ? "Your WHY submission has been resolved" 
          : `Your WHY submission status has been updated to ${status}`;
          
        await storage.createWhyNotification({
          userId: updatedSubmission.userId,
          content: notificationContent,
          submissionId: updatedSubmission.id,
          notificationType: "STATUS_UPDATE",
          status: "PENDING"
        });
      }
      
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating WHY submission:", error);
      res.status(500).json({ message: "Server error updating WHY submission" });
    }
  });
  
  // Quick submission methods
  
  // Text submission
  apiRouter.post("/users/:userId/why-submissions/text", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { content, triggerType } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Create submission
      const submission = await storage.createWhySubmission({
        userId,
        triggerType: triggerType || "GENERAL",
        submissionMethod: "TEXT",
        content,
        status: "PENDING"
      });
      
      res.status(201).json({
        submission,
        message: "Text WHY submission received successfully"
      });
    } catch (error) {
      console.error("Error creating text WHY submission:", error);
      res.status(500).json({ message: "Server error creating text WHY submission" });
    }
  });
  
  // SMS submission
  apiRouter.post("/why-submissions/sms", async (req, res) => {
    try {
      const { phoneNumber, content } = req.body;
      
      if (!phoneNumber || !content) {
        return res.status(400).json({ message: "Phone number and content are required" });
      }
      
      // Find user by phone number (this would be implemented in a real system)
      // For demo purposes, we'll use a placeholder user ID
      const userId = 1; // In a real system, look up by phone number
      
      // Create submission
      const submission = await storage.createWhySubmission({
        userId,
        triggerType: "SMS",
        submissionMethod: "SMS",
        content,
        status: "PENDING"
      });
      
      res.status(201).json({
        submission,
        message: "SMS WHY submission received successfully"
      });
    } catch (error) {
      console.error("Error creating SMS WHY submission:", error);
      res.status(500).json({ message: "Server error creating SMS WHY submission" });
    }
  });
  
  // Photo/image submission
  apiRouter.post("/users/:userId/why-submissions/image", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { imageData, caption, triggerType } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Create submission with image data
      const submission = await storage.createWhySubmission({
        userId,
        triggerType: triggerType || "GENERAL",
        submissionMethod: "IMAGE",
        content: caption || null,
        mediaUrl: JSON.stringify({ type: "image", data: imageData }), // Store as JSON string in mediaUrl
        status: "PENDING"
      });
      
      res.status(201).json({
        submission,
        message: "Image WHY submission received successfully"
      });
    } catch (error) {
      console.error("Error creating image WHY submission:", error);
      res.status(500).json({ message: "Server error creating image WHY submission" });
    }
  });
  
  // Quick scan/QR code submission
  apiRouter.post("/why-submissions/scan", async (req, res) => {
    try {
      const { scanCode, content } = req.body;
      
      if (!scanCode) {
        return res.status(400).json({ message: "Scan code is required" });
      }
      
      // Decode the scan code to get user ID and submission context
      // For demo purposes, we'll use a placeholder decoder
      const scanData = decodeScanCode(scanCode);
      
      // Create submission
      const submission = await storage.createWhySubmission({
        userId: scanData.userId,
        triggerType: scanData.triggerType || "SCAN",
        submissionMethod: "SCAN",
        content: content ? content + " " + JSON.stringify(scanData.context) : JSON.stringify(scanData.context),
        status: "PENDING"
      });
      
      res.status(201).json({
        submission,
        message: "Scan WHY submission received successfully"
      });
    } catch (error) {
      console.error("Error creating scan WHY submission:", error);
      res.status(500).json({ message: "Server error creating scan WHY submission" });
    }
  });
  
  // WHY Notification routes
  apiRouter.get("/users/:userId/why-notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const notifications = await storage.getWhyNotificationsByUserId(userId);
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching WHY notifications:", error);
      res.status(500).json({ message: "Server error fetching WHY notifications" });
    }
  });
  
  // Update notification status (e.g., mark as read)
  apiRouter.patch("/why-notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const now = new Date();
      const updatedNotification = await storage.updateWhyNotificationStatus(
        notificationId,
        status,
        status === "SENT" ? now : undefined,
        status === "READ" ? now : undefined
      );
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "WHY notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error updating WHY notification:", error);
      res.status(500).json({ message: "Server error updating WHY notification" });
    }
  });

  // Helper function to decode scan codes (placeholder for actual implementation)
  function decodeScanCode(code: string) {
    // In a real implementation, this would decode a QR code or other scan format
    // For demo purposes, we'll return a simple object
    return {
      userId: 1,
      triggerType: "EMPLOYMENT_VERIFICATION",
      context: {
        employerId: 123,
        position: "Software Developer",
        requestId: "abc123"
      }
    };
  }
  
  // Financial verification endpoints
  apiRouter.get("/financial-services/status", async (req, res) => {
    try {
      const status = financialVerificationService.checkConfiguration();
      res.json(status);
    } catch (error) {
      console.error("Error checking financial service status:", error);
      res.status(500).json({ message: "Server error checking financial service status" });
    }
  });

  // Plaid endpoints
  apiRouter.post("/financial/plaid/create-link-token", async (req, res) => {
    try {
      const { userId, fullName, email } = req.body;
      
      if (!userId || !fullName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const result = await financialVerificationService.createPlaidLinkToken(
        parseInt(userId),
        fullName,
        email
      );
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error creating Plaid link token:", error);
      res.status(500).json({ message: "Server error creating Plaid link token" });
    }
  });

  apiRouter.post("/financial/plaid/exchange-token", async (req, res) => {
    try {
      const { publicToken } = req.body;
      
      if (!publicToken) {
        return res.status(400).json({ message: "Missing public token" });
      }
      
      const result = await financialVerificationService.exchangePlaidPublicToken(publicToken);
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error exchanging Plaid token:", error);
      res.status(500).json({ message: "Server error exchanging Plaid token" });
    }
  });

  apiRouter.post("/financial/plaid/get-accounts", async (req, res) => {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ message: "Missing access token" });
      }
      
      const result = await financialVerificationService.getBankAccounts(accessToken);
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error getting bank accounts:", error);
      res.status(500).json({ message: "Server error getting bank accounts" });
    }
  });

  apiRouter.post("/financial/plaid/verify-bank-account", async (req, res) => {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ message: "Missing access token" });
      }
      
      const result = await financialVerificationService.verifyBankAccountOwner(accessToken);
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error verifying bank account:", error);
      res.status(500).json({ message: "Server error verifying bank account" });
    }
  });

  // Stripe endpoints
  apiRouter.post("/financial/stripe/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency, customerId } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Missing amount" });
      }
      
      const result = await financialVerificationService.createPaymentIntent(
        amount,
        currency,
        customerId
      );
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Server error creating payment intent" });
    }
  });

  apiRouter.post("/financial/stripe/create-customer", async (req, res) => {
    try {
      const { email, name, metadata } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const result = await financialVerificationService.createStripeCustomer(
        email,
        name,
        metadata
      );
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
      res.status(500).json({ message: "Server error creating Stripe customer" });
    }
  });

  apiRouter.post("/financial/stripe/analyze-payment-method", async (req, res) => {
    try {
      const { paymentMethodId } = req.body;
      
      if (!paymentMethodId) {
        return res.status(400).json({ message: "Missing payment method ID" });
      }
      
      const result = await financialVerificationService.analyzePaymentMethodRisk(paymentMethodId);
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error analyzing payment method:", error);
      res.status(500).json({ message: "Server error analyzing payment method" });
    }
  });

  // Comprehensive financial risk assessment
  apiRouter.post("/financial/risk-assessment", async (req, res) => {
    try {
      const { userId, plaidAccessToken, stripeCustomerId, paymentMethodId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "Missing user ID" });
      }
      
      // Need at least one verification method
      if (!plaidAccessToken && !stripeCustomerId && !paymentMethodId) {
        return res.status(400).json({ 
          message: "At least one verification method is required (plaidAccessToken, stripeCustomerId, or paymentMethodId)" 
        });
      }
      
      const result = await financialVerificationService.performFinancialRiskAssessment(
        parseInt(userId),
        plaidAccessToken,
        stripeCustomerId,
        paymentMethodId
      );
      
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error performing financial risk assessment:", error);
      res.status(500).json({ message: "Server error performing financial risk assessment" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
