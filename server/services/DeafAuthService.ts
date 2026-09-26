import * as crypto from 'crypto';
import { storage } from '../storage';

/**
 * DeafAUTH - Accessibility-Focused Authentication Service
 * 
 * Designed specifically for Deaf and Hard of Hearing users, providing:
 * - Visual-first authentication methods
 * - No audio-dependent verification
 * - Clear visual feedback and guidance
 * - QR code and visual pattern authentication
 * - Sign language video verification support
 * - Haptic feedback integration support
 * - Offline-capable authentication with PinkSync
 */

export interface DeafAuthSession {
  sessionId: string;
  userId: number;
  method: DeafAuthMethod;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  accessibilityPreferences: AccessibilityPreferences;
}

export interface AccessibilityPreferences {
  visualAlerts: boolean;
  highContrast: boolean;
  largeText: boolean;
  hapticFeedback: boolean;
  signLanguagePreference?: 'ASL' | 'BSL' | 'ISL' | 'other';
  reducedMotion: boolean;
  captionsEnabled: boolean;
  flashingDisabled: boolean;
}

export type DeafAuthMethod = 
  | 'visual_pattern'
  | 'qr_code'
  | 'biometric_face'
  | 'biometric_fingerprint'
  | 'sign_language_video'
  | 'visual_otp'
  | 'nfc_tap'
  | 'recovery_code';

export interface VisualPatternConfig {
  gridSize: number; // 3x3, 4x4, 5x5
  minNodes: number;
  patternHash: string;
}

export interface QRAuthConfig {
  qrData: string;
  expiresAt: Date;
  challenge: string;
}

export interface VisualOTPConfig {
  code: string;
  expiresAt: Date;
  displayFormat: 'numeric' | 'alphanumeric' | 'color_pattern' | 'icon_sequence';
}

/**
 * DeafAUTH Service - Accessibility-first authentication
 */
export class DeafAuthService {
  private activeSessions: Map<string, DeafAuthSession> = new Map();
  private visualPatterns: Map<number, VisualPatternConfig> = new Map();
  private pendingQRAuth: Map<string, QRAuthConfig> = new Map();
  private pendingVisualOTP: Map<number, VisualOTPConfig> = new Map();

  constructor() {
    console.log('DeafAUTH Service initialized - Accessibility-focused authentication ready');
    
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60000);
  }

  /**
   * Get available authentication methods for DeafAUTH users
   */
  getAvailableMethods(): Array<{
    method: DeafAuthMethod;
    name: string;
    description: string;
    visualGuidance: string;
    accessibilityFeatures: string[];
  }> {
    return [
      {
        method: 'visual_pattern',
        name: 'Visual Pattern',
        description: 'Draw a pattern on a grid to authenticate',
        visualGuidance: 'A grid of dots will appear. Connect dots in your secret pattern order.',
        accessibilityFeatures: ['No audio required', 'High contrast mode available', 'Customizable grid size']
      },
      {
        method: 'qr_code',
        name: 'QR Code Scan',
        description: 'Scan a QR code with your device to authenticate',
        visualGuidance: 'Point your camera at the QR code displayed on screen. Green border indicates successful scan.',
        accessibilityFeatures: ['No audio required', 'Visual confirmation', 'Works offline']
      },
      {
        method: 'biometric_face',
        name: 'Face Recognition',
        description: 'Use your face to authenticate securely',
        visualGuidance: 'Position your face within the oval guide. Green checkmark confirms recognition.',
        accessibilityFeatures: ['No audio required', 'Visual positioning guides', 'Fast authentication']
      },
      {
        method: 'biometric_fingerprint',
        name: 'Fingerprint',
        description: 'Use your fingerprint to authenticate',
        visualGuidance: 'Place your finger on the sensor. Animated indicator shows scan progress.',
        accessibilityFeatures: ['No audio required', 'Haptic feedback available', 'Quick and secure']
      },
      {
        method: 'sign_language_video',
        name: 'Sign Language Verification',
        description: 'Verify identity using sign language gestures',
        visualGuidance: 'Follow the on-screen prompt to sign the requested phrase. Camera will capture and verify.',
        accessibilityFeatures: ['Deaf-native authentication', 'Multiple sign language support', 'Visual prompts']
      },
      {
        method: 'visual_otp',
        name: 'Visual One-Time Password',
        description: 'Enter a visually displayed code',
        visualGuidance: 'A code will be displayed on your registered device. Enter it on this screen.',
        accessibilityFeatures: ['Large display option', 'Color-coded patterns available', 'Extended time limit']
      },
      {
        method: 'nfc_tap',
        name: 'NFC Tap Authentication',
        description: 'Tap your NFC-enabled device or card',
        visualGuidance: 'Hold your NFC device near the reader. Visual confirmation will appear on screen.',
        accessibilityFeatures: ['No audio required', 'Haptic feedback', 'Fast and contactless']
      },
      {
        method: 'recovery_code',
        name: 'Recovery Code',
        description: 'Use a pre-generated recovery code',
        visualGuidance: 'Enter one of your saved recovery codes. Each code can only be used once.',
        accessibilityFeatures: ['No audio required', 'Large input fields', 'Clear error messages']
      }
    ];
  }

  /**
   * Initialize a new authentication session
   */
  async initializeSession(
    userId: number,
    method: DeafAuthMethod,
    preferences?: Partial<AccessibilityPreferences>
  ): Promise<{
    success: boolean;
    sessionId?: string;
    challenge?: unknown;
    visualGuidance?: string;
    error?: string;
  }> {
    try {
      const sessionId = crypto.randomBytes(32).toString('hex');
      const defaultPreferences: AccessibilityPreferences = {
        visualAlerts: true,
        highContrast: false,
        largeText: false,
        hapticFeedback: true,
        reducedMotion: false,
        captionsEnabled: true,
        flashingDisabled: false,
        ...preferences
      };

      const session: DeafAuthSession = {
        sessionId,
        userId,
        method,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        verified: false,
        accessibilityPreferences: defaultPreferences
      };

      this.activeSessions.set(sessionId, session);

      // Generate method-specific challenge
      let challenge: unknown;
      let visualGuidance: string;

      switch (method) {
        case 'visual_pattern':
          challenge = await this.generatePatternChallenge(userId);
          visualGuidance = 'Draw your secret pattern on the grid. Connect at least 4 dots.';
          break;

        case 'qr_code':
          challenge = await this.generateQRChallenge(sessionId);
          visualGuidance = 'Scan this QR code with your registered device within 2 minutes.';
          break;

        case 'visual_otp':
          challenge = await this.generateVisualOTP(userId, defaultPreferences);
          visualGuidance = 'Enter the code shown on your registered device. You have 5 minutes.';
          break;

        case 'biometric_face':
          challenge = { type: 'face', sessionId };
          visualGuidance = 'Position your face within the oval guide. Keep still until the green checkmark appears.';
          break;

        case 'biometric_fingerprint':
          challenge = { type: 'fingerprint', sessionId };
          visualGuidance = 'Place your finger on the sensor and hold until the progress indicator completes.';
          break;

        case 'sign_language_video':
          challenge = await this.generateSignLanguageChallenge(defaultPreferences.signLanguagePreference);
          visualGuidance = 'Sign the phrase shown on screen. Camera will verify your identity.';
          break;

        case 'nfc_tap':
          challenge = { type: 'nfc', sessionId, nonce: crypto.randomBytes(16).toString('hex') };
          visualGuidance = 'Tap your registered NFC device or card against the reader.';
          break;

        case 'recovery_code':
          challenge = { type: 'recovery', sessionId };
          visualGuidance = 'Enter one of your recovery codes. Use the large text option if needed.';
          break;

        default:
          return { success: false, error: 'Unknown authentication method' };
      }

      return {
        success: true,
        sessionId,
        challenge,
        visualGuidance
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('DeafAUTH session initialization error:', error);
      return { success: false, error: err.message || 'Failed to initialize session' };
    }
  }

  /**
   * Verify authentication attempt
   */
  async verifyAuthentication(
    sessionId: string,
    response: unknown
  ): Promise<{
    success: boolean;
    token?: string;
    visualFeedback: string;
    error?: string;
  }> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        visualFeedback: '❌ Session not found or expired. Please start again.',
        error: 'Session not found'
      };
    }

    if (new Date() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      return {
        success: false,
        visualFeedback: '⏰ Session expired. Please start a new authentication.',
        error: 'Session expired'
      };
    }

    try {
      let verified = false;
      const authResponse = response as Record<string, unknown>;

      switch (session.method) {
        case 'visual_pattern':
          verified = await this.verifyPatternResponse(session.userId, authResponse.pattern as number[]);
          break;

        case 'qr_code':
          verified = await this.verifyQRResponse(sessionId, authResponse.qrResponse as string);
          break;

        case 'visual_otp':
          verified = await this.verifyVisualOTP(session.userId, authResponse.code as string);
          break;

        case 'biometric_face':
        case 'biometric_fingerprint':
          // Biometric verification would integrate with device APIs
          verified = await this.verifyBiometric(session.userId, session.method, authResponse);
          break;

        case 'sign_language_video':
          verified = await this.verifySignLanguage(session.userId, authResponse.videoData as string);
          break;

        case 'nfc_tap':
          verified = await this.verifyNFC(session.userId, authResponse.nfcData as string);
          break;

        case 'recovery_code':
          verified = await this.verifyRecoveryCode(session.userId, authResponse.code as string);
          break;
      }

      if (verified) {
        session.verified = true;
        const token = this.generateAuthToken(session);

        // Store verification in database
        await storage.createVerification({
          userId: session.userId,
          type: `DEAFAUTH_${session.method.toUpperCase()}`,
          status: 'VERIFIED',
          data: { sessionId, method: session.method }
        });

        return {
          success: true,
          token,
          visualFeedback: '✅ Authentication successful! You are now signed in.'
        };
      }

      return {
        success: false,
        visualFeedback: '❌ Authentication failed. Please try again.',
        error: 'Verification failed'
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('DeafAUTH verification error:', error);
      return {
        success: false,
        visualFeedback: '⚠️ An error occurred. Please try again.',
        error: err.message || 'Verification error'
      };
    }
  }

  /**
   * Set up visual pattern for a user
   */
  async setupVisualPattern(userId: number, pattern: number[], gridSize: number = 3): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (pattern.length < 4) {
      return { success: false, error: 'Pattern must connect at least 4 dots' };
    }

    const patternHash = crypto
      .createHash('sha256')
      .update(pattern.join('-'))
      .digest('hex');

    this.visualPatterns.set(userId, {
      gridSize,
      minNodes: 4,
      patternHash
    });

    return { success: true };
  }

  /**
   * Generate pattern challenge
   */
  private async generatePatternChallenge(userId: number): Promise<{
    gridSize: number;
    minNodes: number;
  }> {
    const config = this.visualPatterns.get(userId);
    return {
      gridSize: config?.gridSize || 3,
      minNodes: config?.minNodes || 4
    };
  }

  /**
   * Verify pattern response
   */
  private async verifyPatternResponse(userId: number, pattern: number[]): Promise<boolean> {
    const config = this.visualPatterns.get(userId);
    if (!config) return false;

    const responseHash = crypto
      .createHash('sha256')
      .update(pattern.join('-'))
      .digest('hex');

    return responseHash === config.patternHash;
  }

  /**
   * Generate QR code challenge
   */
  private async generateQRChallenge(sessionId: string): Promise<QRAuthConfig> {
    const challenge = crypto.randomBytes(32).toString('hex');
    const qrData = JSON.stringify({
      type: 'deafauth_qr',
      session: sessionId,
      challenge,
      timestamp: Date.now()
    });

    const config: QRAuthConfig = {
      qrData,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
      challenge
    };

    this.pendingQRAuth.set(sessionId, config);
    return config;
  }

  /**
   * Verify QR response
   */
  private async verifyQRResponse(sessionId: string, qrResponse: string): Promise<boolean> {
    const config = this.pendingQRAuth.get(sessionId);
    if (!config) return false;

    if (new Date() > config.expiresAt) {
      this.pendingQRAuth.delete(sessionId);
      return false;
    }

    // Parse and verify the QR response
    try {
      const parsed = JSON.parse(qrResponse);
      return parsed.challenge === config.challenge;
    } catch {
      return false;
    }
  }

  /**
   * Generate visual OTP
   */
  private async generateVisualOTP(
    userId: number,
    preferences: AccessibilityPreferences
  ): Promise<VisualOTPConfig> {
    // Generate OTP based on user preferences
    let code: string;
    let displayFormat: VisualOTPConfig['displayFormat'] = 'numeric';

    if (preferences.highContrast) {
      // Use larger, simpler codes for high contrast mode
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } else {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const config: VisualOTPConfig = {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      displayFormat
    };

    this.pendingVisualOTP.set(userId, config);
    return {
      ...config,
      code: '******' // Don't return actual code in response
    };
  }

  /**
   * Verify visual OTP
   */
  private async verifyVisualOTP(userId: number, code: string): Promise<boolean> {
    const config = this.pendingVisualOTP.get(userId);
    if (!config) return false;

    if (new Date() > config.expiresAt) {
      this.pendingVisualOTP.delete(userId);
      return false;
    }

    const verified = config.code === code;
    if (verified) {
      this.pendingVisualOTP.delete(userId);
    }
    return verified;
  }

  /**
   * Generate sign language challenge
   */
  private async generateSignLanguageChallenge(
    signLanguage?: 'ASL' | 'BSL' | 'ISL' | 'other'
  ): Promise<{
    phrase: string;
    signLanguage: string;
    visualGuide: string;
  }> {
    // Simple phrases for sign language verification
    const phrases = {
      ASL: ['Hello my name is [NAME]', 'Today is [DAY]', 'I am verifying my identity'],
      BSL: ['Hello my name is [NAME]', 'Today is [DAY]', 'I am verifying my identity'],
      ISL: ['Hello my name is [NAME]', 'Today is [DAY]', 'I am verifying my identity'],
      other: ['Hello my name is [NAME]', 'Today is [DAY]', 'I am verifying my identity']
    };

    const lang = signLanguage || 'ASL';
    const phraseList = phrases[lang];
    const phrase = phraseList[Math.floor(Math.random() * phraseList.length)];

    return {
      phrase,
      signLanguage: lang,
      visualGuide: 'Please sign the phrase shown above. Keep your hands visible in the camera frame.'
    };
  }

  /**
   * Verify sign language video (placeholder for ML integration)
   */
  private async verifySignLanguage(_userId: number, _videoData: string): Promise<boolean> {
    // This would integrate with a sign language recognition ML model
    // For now, return true as a placeholder
    console.log('Sign language verification would use ML model');
    return true;
  }

  /**
   * Verify biometric authentication
   */
  private async verifyBiometric(
    _userId: number,
    type: 'biometric_face' | 'biometric_fingerprint',
    _response: unknown
  ): Promise<boolean> {
    // This would integrate with device biometric APIs
    console.log(`Biometric ${type} verification`);
    return true;
  }

  /**
   * Verify NFC authentication
   */
  private async verifyNFC(_userId: number, _nfcData: string): Promise<boolean> {
    // This would verify NFC token data
    console.log('NFC verification');
    return true;
  }

  /**
   * Verify recovery code
   */
  private async verifyRecoveryCode(userId: number, code: string): Promise<boolean> {
    // Check against stored recovery codes
    // This is a simplified implementation
    if (!code || code.length < 8) return false;
    
    // In production, this would check against hashed recovery codes in the database
    console.log(`Recovery code verification for user ${userId}`);
    return true;
  }

  /**
   * Generate auth token after successful verification
   */
  private generateAuthToken(session: DeafAuthSession): string {
    const tokenData = {
      sub: session.userId.toString(),
      sessionId: session.sessionId,
      method: session.method,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      accessibility: session.accessibilityPreferences
    };

    // Simple token encoding (in production, use proper JWT with secret)
    return Buffer.from(JSON.stringify(tokenData)).toString('base64url');
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.activeSessions) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(sessionId);
      }
    }

    for (const [sessionId, config] of this.pendingQRAuth) {
      if (now > config.expiresAt) {
        this.pendingQRAuth.delete(sessionId);
      }
    }

    for (const [userId, config] of this.pendingVisualOTP) {
      if (now > config.expiresAt) {
        this.pendingVisualOTP.delete(userId);
      }
    }
  }

  /**
   * Get accessibility preferences for a user
   */
  async getAccessibilityPreferences(userId: number): Promise<AccessibilityPreferences> {
    // This would fetch from database
    // For now, return defaults
    return {
      visualAlerts: true,
      highContrast: false,
      largeText: false,
      hapticFeedback: true,
      reducedMotion: false,
      captionsEnabled: true,
      flashingDisabled: false
    };
  }

  /**
   * Update accessibility preferences
   */
  async updateAccessibilityPreferences(
    userId: number,
    preferences: Partial<AccessibilityPreferences>
  ): Promise<{ success: boolean; preferences: AccessibilityPreferences }> {
    const current = await this.getAccessibilityPreferences(userId);
    const updated = { ...current, ...preferences };
    
    // This would save to database
    console.log(`Updated accessibility preferences for user ${userId}:`, updated);
    
    return { success: true, preferences: updated };
  }

  /**
   * Get service status
   */
  getStatus(): {
    activeSessions: number;
    pendingQRAuth: number;
    pendingVisualOTP: number;
    supportedMethods: DeafAuthMethod[];
  } {
    return {
      activeSessions: this.activeSessions.size,
      pendingQRAuth: this.pendingQRAuth.size,
      pendingVisualOTP: this.pendingVisualOTP.size,
      supportedMethods: [
        'visual_pattern',
        'qr_code',
        'biometric_face',
        'biometric_fingerprint',
        'sign_language_video',
        'visual_otp',
        'nfc_tap',
        'recovery_code'
      ]
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
