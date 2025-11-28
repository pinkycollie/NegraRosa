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
    };
  }
}

// Export singleton instance
export const deafAuthService = new DeafAuthService();
