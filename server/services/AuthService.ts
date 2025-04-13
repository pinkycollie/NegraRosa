import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { User, InsertUser } from "@shared/schema";
import { randomBytes, createHash } from "crypto";
import jwt from "jsonwebtoken";

// Biometric data interface - would include facial recognition data
interface BiometricData {
  userId: number;
  faceTemplate: string; // Encoded facial recognition data
  createdAt: Date;
  lastUpdated: Date;
}

export class AuthService {
  private tokenSecret: string;
  private tokenExpiry: string;
  private biometricData: Map<number, BiometricData> = new Map();

  constructor() {
    // In a production environment, these should be loaded from environment variables
    this.tokenSecret = process.env.JWT_SECRET || "negrarosa-inclusive-security-framework-secret";
    this.tokenExpiry = "24h"; // Token expires in 24 hours
  }

  /**
   * Register a new user with biometric data
   */
  async registerUser(userData: InsertUser, faceData: string): Promise<User | null> {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return null;
      }

      // Create user
      const newUser = await storage.createUser(userData);
      
      // Store biometric data
      if (newUser) {
        this.storeBiometricData(newUser.id, faceData);
      }
      
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  }

  /**
   * Store user's biometric data
   */
  private storeBiometricData(userId: number, faceTemplate: string): void {
    const now = new Date();
    
    this.biometricData.set(userId, {
      userId,
      faceTemplate,
      createdAt: now,
      lastUpdated: now
    });
    
    // In a real implementation, this would be stored in a secure database
    console.log(`Stored biometric data for user ${userId}`);
  }

  /**
   * Authenticate with biometric data
   * This is the primary authentication method using facial recognition
   */
  async authenticateWithBiometrics(faceData: string): Promise<{ success: boolean; token?: string; userId?: number; message?: string }> {
    try {
      // In a real implementation, we would use a facial recognition algorithm
      // to compare the provided face data with stored templates
      const userId = this.findUserByFaceData(faceData);
      
      if (!userId) {
        return { success: false, message: "Biometric authentication failed. Face not recognized." };
      }
      
      // Generate JWT for authenticated user
      const jwtToken = this.generateJwt(userId);
      
      return {
        success: true,
        token: jwtToken,
        userId
      };
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return { success: false, message: "Authentication failed due to system error." };
    }
  }

  /**
   * Find a user by their facial data
   * In a real implementation, this would use a facial recognition algorithm
   */
  private findUserByFaceData(faceData: string): number | null {
    // Simplified implementation for demo purposes
    // In a real system, this would compare facial templates using proper algorithms
    
    for (const [userId, data] of this.biometricData.entries()) {
      // Simple comparison - in reality, this would use a similarity score
      if (data.faceTemplate === faceData) {
        return userId;
      }
    }
    
    return null;
  }

  /**
   * Authenticate with NFT token integration
   * This would be implemented to verify the user's "I AM WHO I AM" NFT ownership
   */
  async authenticateWithNft(nftToken: string): Promise<{ success: boolean; token?: string; userId?: number; message?: string }> {
    // In a real implementation, this would verify NFT ownership through a blockchain service
    // The NFT serves as a portable identity token that can be linked to biometric data
    
    // For demo purposes, we'll just check for a test token
    if (nftToken === "test-nft-token") {
      // Here we'd normally verify on-chain that the user owns the NFT
      // For now, we'll just return a dummy user ID
      const userId = 1;
      const jwtToken = this.generateJwt(userId);
      
      return {
        success: true,
        token: jwtToken,
        userId
      };
    }
    
    return { success: false, message: "Invalid NFT token." };
  }

  /**
   * Update user's biometric data
   * This allows for changes in appearance over time
   */
  async updateBiometricData(userId: number, newFaceData: string): Promise<boolean> {
    const existing = this.biometricData.get(userId);
    
    if (!existing) {
      return false;
    }
    
    this.biometricData.set(userId, {
      ...existing,
      faceTemplate: newFaceData,
      lastUpdated: new Date()
    });
    
    return true;
  }

  /**
   * Generate a JWT token for authenticated users
   */
  private generateJwt(userId: number): string {
    const payload = { userId };
    return jwt.sign(payload, this.tokenSecret, { expiresIn: this.tokenExpiry });
  }

  /**
   * Verify a JWT token
   */
  verifyJwt(token: string): { valid: boolean; userId?: number } {
    try {
      const decoded = jwt.verify(token, this.tokenSecret) as { userId: number };
      return { valid: true, userId: decoded.userId };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Authentication middleware for protecting routes
   */
  authenticate(req: Request, res: Response, next: NextFunction) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const token = authHeader.split(' ')[1];
    const result = this.verifyJwt(token);
    
    if (!result.valid) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    // Attach user ID to request
    (req as any).userId = result.userId;
    next();
  }
}