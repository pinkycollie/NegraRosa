import { pasetoService, PasetoTokenResult, PasetoPayload } from './PasetoService';
import { storage } from '../storage';
import * as crypto from 'crypto';

/**
 * DeafAuth Integration Service
 * 
 * This service provides authentication foundational elements for the DeafAuth project
 * (github.com/deafauth/deafauth) using PASETO tokens.
 * 
 * DeafAuth is designed to be an inclusive authentication system that considers
 * accessibility needs, particularly for deaf and hard-of-hearing users.
 * 
 * Key features:
 * - Visual-based authentication methods
 * - Sign language verification support
 * - PASETO token-based secure sessions
 * - Multi-factor authentication with visual cues
 * - Accessibility-first design
 */

// DeafAuth user profile
export interface DeafAuthProfile {
  userId: number;
  preferredCommunication: 'visual' | 'text' | 'sign_language' | 'mixed';
  signLanguageType?: 'ASL' | 'BSL' | 'LSF' | 'DGS' | 'other';
  visualVerificationEnabled: boolean;
  videoRelayServiceEnabled: boolean;
  captioningPreference: 'auto' | 'manual' | 'none';
  vibrationAlerts: boolean;
  lightAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication request for DeafAuth
export interface DeafAuthRequest {
  userId?: number;
  email?: string;
  username?: string;
  authMethod: 'visual' | 'biometric' | 'sign_verification' | 'passkey' | 'nft';
  authData?: any;
  accessibilityPreferences?: Partial<DeafAuthProfile>;
}

// Authentication result
export interface DeafAuthResult {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  userId?: number;
  profile?: DeafAuthProfile;
  accessibilitySettings?: Record<string, any>;
  error?: string;
}

// Visual verification challenge
export interface VisualChallenge {
  id: string;
  type: 'pattern' | 'gesture' | 'color_sequence' | 'symbol_match';
  challenge: any;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

/**
 * DeafAuthService - Accessibility-first authentication
 */
export class DeafAuthService {
  private profiles: Map<number, DeafAuthProfile> = new Map();
  private challenges: Map<string, VisualChallenge> = new Map();
  private challengeExpiry: number = 300000; // 5 minutes
  
  constructor() {
    // Clean up expired challenges periodically
    setInterval(() => this.cleanupExpiredChallenges(), 60000);
    console.log('DeafAuth service initialized');
  }
  
  /**
   * Authenticate user with DeafAuth
   */
  async authenticate(request: DeafAuthRequest): Promise<DeafAuthResult> {
    try {
      // Find or create user
      let userId = request.userId;
      
      if (!userId && request.email) {
        // Look up user by email (simplified - would use storage in production)
        const users = await storage.getAllUsers();
        const user = users.find(u => u.email === request.email);
        userId = user?.id;
      }
      
      if (!userId && request.username) {
        const user = await storage.getUserByUsername(request.username);
        userId = user?.id;
      }
      
      if (!userId) {
        return {
          success: false,
          error: 'User not found',
          message: 'Please provide valid credentials',
        };
      }
      
      // Handle different auth methods
      let authResult: boolean;
      
      switch (request.authMethod) {
        case 'visual':
          authResult = await this.verifyVisualAuth(userId, request.authData);
          break;
        case 'biometric':
          authResult = await this.verifyBiometric(userId, request.authData);
          break;
        case 'sign_verification':
          authResult = await this.verifySignLanguage(userId, request.authData);
          break;
        case 'passkey':
          authResult = await this.verifyPasskey(userId, request.authData);
          break;
        case 'nft':
          authResult = await this.verifyNftAuth(userId, request.authData);
          break;
        default:
          return {
            success: false,
            error: 'Unsupported authentication method',
          };
      }
      
      if (!authResult) {
        return {
          success: false,
          error: 'Authentication failed',
          message: 'Please try again or use an alternative method',
        };
      }
      
      // Update or create profile with accessibility preferences
      if (request.accessibilityPreferences) {
        await this.updateProfile(userId, request.accessibilityPreferences);
      }
      
      // Create PASETO tokens
      const accessTokenResult = await pasetoService.createIntegrationToken(
        'deafauth',
        userId,
        ['authenticate', 'profile:read', 'profile:write'],
        3600 // 1 hour
      );
      
      const refreshTokenResult = await pasetoService.createRefreshToken(
        userId,
        undefined,
        604800 // 7 days
      );
      
      if (!accessTokenResult.success || !refreshTokenResult.success) {
        return {
          success: false,
          error: 'Failed to generate tokens',
        };
      }
      
      const profile = await this.getProfile(userId);
      
      return {
        success: true,
        token: accessTokenResult.token,
        refreshToken: refreshTokenResult.token,
        userId,
        profile,
        accessibilitySettings: this.getAccessibilitySettings(profile),
        message: 'Authentication successful',
      };
    } catch (error) {
      console.error('DeafAuth authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }
  
  /**
   * Create a visual authentication challenge
   */
  async createVisualChallenge(
    type: VisualChallenge['type'],
    userId: number
  ): Promise<{ success: boolean; challenge?: VisualChallenge; error?: string }> {
    try {
      const id = crypto.randomBytes(16).toString('hex');
      let challengeData: any;
      
      switch (type) {
        case 'pattern':
          // Generate a pattern grid for the user to replicate
          challengeData = this.generatePatternChallenge();
          break;
        case 'gesture':
          // Generate a gesture sequence to perform
          challengeData = this.generateGestureChallenge();
          break;
        case 'color_sequence':
          // Generate a color sequence to match
          challengeData = this.generateColorSequenceChallenge();
          break;
        case 'symbol_match':
          // Generate symbols to match
          challengeData = this.generateSymbolMatchChallenge();
          break;
        default:
          return { success: false, error: 'Invalid challenge type' };
      }
      
      const challenge: VisualChallenge = {
        id,
        type,
        challenge: challengeData,
        expiresAt: new Date(Date.now() + this.challengeExpiry),
        attempts: 0,
        maxAttempts: 3,
      };
      
      this.challenges.set(id, challenge);
      
      return { success: true, challenge };
    } catch (error) {
      console.error('Error creating visual challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create challenge',
      };
    }
  }
  
  /**
   * Verify a visual challenge response
   */
  async verifyVisualChallenge(
    challengeId: string,
    response: any
  ): Promise<{ success: boolean; message?: string }> {
    const challenge = this.challenges.get(challengeId);
    
    if (!challenge) {
      return { success: false, message: 'Challenge not found or expired' };
    }
    
    if (challenge.expiresAt < new Date()) {
      this.challenges.delete(challengeId);
      return { success: false, message: 'Challenge has expired' };
    }
    
    challenge.attempts++;
    
    if (challenge.attempts > challenge.maxAttempts) {
      this.challenges.delete(challengeId);
      return { success: false, message: 'Maximum attempts exceeded' };
    }
    
    // Verify based on challenge type
    let isValid = false;
    
    switch (challenge.type) {
      case 'pattern':
        isValid = this.verifyPatternResponse(challenge.challenge, response);
        break;
      case 'gesture':
        isValid = this.verifyGestureResponse(challenge.challenge, response);
        break;
      case 'color_sequence':
        isValid = this.verifyColorSequenceResponse(challenge.challenge, response);
        break;
      case 'symbol_match':
        isValid = this.verifySymbolMatchResponse(challenge.challenge, response);
        break;
    }
    
    if (isValid) {
      this.challenges.delete(challengeId);
      return { success: true, message: 'Challenge verified successfully' };
    }
    
    return { 
      success: false, 
      message: `Verification failed. ${challenge.maxAttempts - challenge.attempts} attempts remaining` 
    };
  }
  
  /**
   * Get user profile
   */
  async getProfile(userId: number): Promise<DeafAuthProfile | undefined> {
    if (this.profiles.has(userId)) {
      return this.profiles.get(userId);
    }
    
    // Create default profile
    const defaultProfile: DeafAuthProfile = {
      userId,
      preferredCommunication: 'visual',
      visualVerificationEnabled: true,
      videoRelayServiceEnabled: false,
      captioningPreference: 'auto',
      vibrationAlerts: true,
      lightAlerts: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.profiles.set(userId, defaultProfile);
    return defaultProfile;
  }
  
  /**
   * Update user profile
   */
  async updateProfile(
    userId: number,
    updates: Partial<DeafAuthProfile>
  ): Promise<{ success: boolean; profile?: DeafAuthProfile; error?: string }> {
    try {
      const existing = await this.getProfile(userId);
      
      if (!existing) {
        return { success: false, error: 'Profile not found' };
      }
      
      const updated: DeafAuthProfile = {
        ...existing,
        ...updates,
        userId, // Ensure userId cannot be changed
        updatedAt: new Date(),
      };
      
      this.profiles.set(userId, updated);
      
      return { success: true, profile: updated };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }
  
  /**
   * Get accessibility settings for a profile
   */
  private getAccessibilitySettings(profile?: DeafAuthProfile): Record<string, any> {
    if (!profile) {
      return {
        visualMode: true,
        captioning: 'auto',
        vibration: true,
        light: true,
      };
    }
    
    return {
      visualMode: profile.visualVerificationEnabled,
      captioning: profile.captioningPreference,
      vibration: profile.vibrationAlerts,
      light: profile.lightAlerts,
      communication: profile.preferredCommunication,
      signLanguage: profile.signLanguageType,
      videoRelay: profile.videoRelayServiceEnabled,
    };
  }
  
  /**
   * Verify visual authentication
   */
  private async verifyVisualAuth(userId: number, authData: any): Promise<boolean> {
    // In a real implementation, this would verify the visual authentication data
    // For now, we'll do a simple check
    if (authData.challengeId && authData.response) {
      const result = await this.verifyVisualChallenge(authData.challengeId, authData.response);
      return result.success;
    }
    return false;
  }
  
  /**
   * Verify biometric authentication
   * 
   * SECURITY NOTE: This is a placeholder implementation for development/testing.
   * In production, this must integrate with actual biometric verification APIs
   * (e.g., WebAuthn, device biometrics, or third-party biometric services).
   * 
   * DO NOT USE IN PRODUCTION without implementing proper biometric verification.
   */
  private async verifyBiometric(userId: number, authData: any): Promise<boolean> {
    // PLACEHOLDER: In production, integrate with actual biometric APIs
    // This currently only checks for a test flag - NOT SECURE
    if (process.env.NODE_ENV === 'production') {
      console.warn('Biometric verification not fully implemented for production use');
      return false; // Fail-safe in production until properly implemented
    }
    return authData && authData.verified === true && authData.testMode === true;
  }
  
  /**
   * Verify sign language authentication
   * 
   * SECURITY NOTE: This is a placeholder implementation for development/testing.
   * In production, this must integrate with computer vision APIs for sign language recognition.
   */
  private async verifySignLanguage(userId: number, authData: any): Promise<boolean> {
    // PLACEHOLDER: Would integrate with computer vision APIs for sign language recognition
    if (process.env.NODE_ENV === 'production') {
      console.warn('Sign language verification not fully implemented for production use');
      return false; // Fail-safe in production until properly implemented
    }
    return authData && authData.signatureMatch === true && authData.testMode === true;
  }
  
  /**
   * Verify passkey authentication
   */
  private async verifyPasskey(userId: number, authData: any): Promise<boolean> {
    // Placeholder for WebAuthn/passkey verification
    // Would use WebAuthn APIs
    return authData && authData.credentialVerified === true;
  }
  
  /**
   * Verify NFT-based authentication
   */
  private async verifyNftAuth(userId: number, authData: any): Promise<boolean> {
    // Verify NFT ownership for identity
    // Would verify blockchain ownership
    return authData && authData.nftOwnershipVerified === true;
  }
  
  /**
   * Generate pattern challenge
   */
  private generatePatternChallenge(): any {
    const gridSize = 3;
    const patternLength = Math.floor(Math.random() * 3) + 4; // 4-6 points
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < patternLength; i++) {
      let point: { x: number; y: number };
      do {
        point = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        };
      } while (points.some(p => p.x === point.x && p.y === point.y));
      points.push(point);
    }
    
    return {
      gridSize,
      pattern: points,
      displayDuration: 3000, // 3 seconds to memorize
    };
  }
  
  /**
   * Generate gesture challenge
   */
  private generateGestureChallenge(): any {
    const gestures = ['up', 'down', 'left', 'right', 'circle', 'tap', 'hold'];
    const sequenceLength = Math.floor(Math.random() * 3) + 3; // 3-5 gestures
    const sequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(gestures[Math.floor(Math.random() * gestures.length)]);
    }
    
    return {
      sequence,
      displayDuration: 2000, // 2 seconds per gesture
    };
  }
  
  /**
   * Generate color sequence challenge
   */
  private generateColorSequenceChallenge(): any {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const sequenceLength = Math.floor(Math.random() * 3) + 4; // 4-6 colors
    const sequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    
    return {
      sequence,
      options: colors,
      displayDuration: 1500, // 1.5 seconds per color
    };
  }
  
  /**
   * Generate symbol match challenge
   */
  private generateSymbolMatchChallenge(): any {
    const symbols = ['★', '♠', '♥', '♦', '♣', '☀', '☁', '☂', '✿', '✈'];
    const targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const shuffled = [...symbols].sort(() => Math.random() - 0.5);
    
    return {
      target: targetSymbol,
      options: shuffled,
      displayDuration: 2000,
    };
  }
  
  /**
   * Verify pattern response
   */
  private verifyPatternResponse(challenge: any, response: any): boolean {
    if (!response.pattern || !Array.isArray(response.pattern)) {
      return false;
    }
    
    if (response.pattern.length !== challenge.pattern.length) {
      return false;
    }
    
    return response.pattern.every((point: { x: number; y: number }, index: number) => {
      return point.x === challenge.pattern[index].x && 
             point.y === challenge.pattern[index].y;
    });
  }
  
  /**
   * Verify gesture response
   */
  private verifyGestureResponse(challenge: any, response: any): boolean {
    if (!response.sequence || !Array.isArray(response.sequence)) {
      return false;
    }
    
    if (response.sequence.length !== challenge.sequence.length) {
      return false;
    }
    
    return response.sequence.every((gesture: string, index: number) => {
      return gesture === challenge.sequence[index];
    });
  }
  
  /**
   * Verify color sequence response
   */
  private verifyColorSequenceResponse(challenge: any, response: any): boolean {
    if (!response.sequence || !Array.isArray(response.sequence)) {
      return false;
    }
    
    if (response.sequence.length !== challenge.sequence.length) {
      return false;
    }
    
    return response.sequence.every((color: string, index: number) => {
      return color === challenge.sequence[index];
    });
  }
  
  /**
   * Verify symbol match response
   */
  private verifySymbolMatchResponse(challenge: any, response: any): boolean {
    return response.selected === challenge.target;
  }
  
  /**
   * Cleanup expired challenges
   */
  private cleanupExpiredChallenges(): void {
    const now = new Date();
    const entries = Array.from(this.challenges.entries());
    for (const [id, challenge] of entries) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(id);
      }
    }
  }
  
  /**
   * Verify a DeafAuth token
   */
  async verifyToken(token: string): Promise<DeafAuthResult> {
    const result = await pasetoService.verifyToken(token);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }
    
    const payload = result.payload;
    if (!payload || payload.service !== 'deafauth') {
      return {
        success: false,
        error: 'Invalid DeafAuth token',
      };
    }
    
    const userId = parseInt(payload.sub || '0', 10);
    const profile = await this.getProfile(userId);
    
    return {
      success: true,
      userId,
      profile,
      accessibilitySettings: this.getAccessibilitySettings(profile),
    };
  }
}

// Export singleton instance
export const deafAuthService = new DeafAuthService();
