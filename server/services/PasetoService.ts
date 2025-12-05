import * as crypto from 'crypto';

/**
 * PASETO Token Service - Platform-Agnostic Security Tokens v4
 * 
 * Following the PASETO specification: https://github.com/paseto-standard/paseto-spec
 * 
 * PASETO v4 supports:
 * - v4.local: Symmetric authenticated encryption (XChaCha20-Poly1305)
 * - v4.public: Asymmetric digital signatures (Ed25519)
 * 
 * This service is foundational for:
 * - DeafAuth (github.com/deafauth/deafauth)
 * - PinkSync
 * - Fibonorse
 */

// Token payload interface following PASETO claims
export interface PasetoPayload {
  iss?: string;          // Issuer
  sub?: string;          // Subject (user ID)
  aud?: string;          // Audience
  exp?: string;          // Expiration (ISO 8601)
  nbf?: string;          // Not Before (ISO 8601)
  iat?: string;          // Issued At (ISO 8601)
  jti?: string;          // Token ID
  kid?: string;          // Key ID
  [key: string]: any;    // Custom claims
}

// Token footer for key identification
export interface PasetoFooter {
  kid?: string;          // Key ID
  wpk?: string;          // Wrapped public key
  [key: string]: any;    // Custom footer data
}

// Token result interface
export interface PasetoTokenResult {
  success: boolean;
  token?: string;
  payload?: PasetoPayload;
  footer?: PasetoFooter;
  error?: string;
  version?: string;
  purpose?: 'local' | 'public';
}

// Key pair interface for public tokens
export interface PasetoKeyPair {
  publicKey: Buffer;
  secretKey: any; // KeyObject from crypto module
  keyId: string;
}

// Configuration for the PASETO service
export interface PasetoConfig {
  issuer: string;
  audience: string;
  defaultExpiry: number;  // In seconds
  keyRotationDays: number;
}

/**
 * PasetoService - Implements PASETO v4 tokens
 * 
 * This service provides secure, stateless token generation and validation
 * using the PASETO (Platform-Agnostic Security Tokens) standard.
 */
export class PasetoService {
  private config: PasetoConfig;
  private localKey: Buffer | null = null;
  private keyPairs: Map<string, PasetoKeyPair> = new Map();
  private currentKeyId: string | null = null;
  private paseto: any = null;
  
  constructor(config?: Partial<PasetoConfig>) {
    this.config = {
      issuer: config?.issuer || process.env.PASETO_ISSUER || 'negrarosa',
      audience: config?.audience || process.env.PASETO_AUDIENCE || 'negrarosa-api',
      defaultExpiry: config?.defaultExpiry || 86400, // 24 hours
      keyRotationDays: config?.keyRotationDays || 30,
    };
    
    // Initialize keys from environment or generate new ones
    this.initializeKeys();
  }
  
  /**
   * Initialize the PASETO library dynamically
   */
  private async getPaseto(): Promise<any> {
    if (!this.paseto) {
      this.paseto = await import('paseto');
    }
    return this.paseto;
  }
  
  /**
   * Initialize encryption and signing keys
   */
  private async initializeKeys(): Promise<void> {
    try {
      // For local tokens (symmetric encryption)
      const localKeyEnv = process.env.PASETO_LOCAL_KEY;
      if (localKeyEnv) {
        this.localKey = Buffer.from(localKeyEnv, 'base64');
      } else {
        // Generate a new key for local tokens
        this.localKey = crypto.randomBytes(32);
        console.log('Generated new PASETO local key - store this securely');
      }
      
      // For public tokens (asymmetric signatures)
      await this.generateKeyPair();
      
      console.log('PASETO keys initialized successfully');
    } catch (error) {
      console.error('Error initializing PASETO keys:', error);
    }
  }
  
  /**
   * Generate a new Ed25519 key pair for public tokens
   */
  private async generateKeyPair(): Promise<PasetoKeyPair> {
    const paseto = await this.getPaseto();
    const { V4 } = paseto;
    
    const keyId = crypto.randomBytes(8).toString('hex');
    const keyPair = await V4.generateKey('public');
    
    const pair: PasetoKeyPair = {
      publicKey: keyPair.export({ type: 'spki', format: 'der' }) as unknown as Buffer,
      secretKey: keyPair,
      keyId,
    };
    
    this.keyPairs.set(keyId, pair);
    this.currentKeyId = keyId;
    
    return pair;
  }
  
  /**
   * Create a PASETO v4.local token (symmetric encryption)
   * 
   * Use for internal API authentication where both parties share the key
   */
  async createLocalToken(
    payload: PasetoPayload,
    expirySeconds?: number,
    footer?: PasetoFooter
  ): Promise<PasetoTokenResult> {
    try {
      const paseto = await this.getPaseto();
      const { V4 } = paseto;
      
      if (!this.localKey) {
        await this.initializeKeys();
      }
      
      if (!this.localKey) {
        return {
          success: false,
          error: 'Local key not initialized',
        };
      }
      
      const now = new Date();
      const exp = new Date(now.getTime() + (expirySeconds || this.config.defaultExpiry) * 1000);
      
      const fullPayload: PasetoPayload = {
        iss: this.config.issuer,
        aud: this.config.audience,
        iat: now.toISOString(),
        exp: exp.toISOString(),
        jti: crypto.randomBytes(16).toString('hex'),
        ...payload,
      };
      
      const footerData = footer ? JSON.stringify(footer) : undefined;
      
      const token = await V4.encrypt(
        fullPayload,
        this.localKey,
        { footer: footerData }
      );
      
      return {
        success: true,
        token,
        payload: fullPayload,
        footer,
        version: 'v4',
        purpose: 'local',
      };
    } catch (error) {
      console.error('Error creating local token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating token',
      };
    }
  }
  
  /**
   * Verify and decrypt a PASETO v4.local token
   */
  async verifyLocalToken(token: string): Promise<PasetoTokenResult> {
    try {
      const paseto = await this.getPaseto();
      const { V4 } = paseto;
      
      if (!this.localKey) {
        return {
          success: false,
          error: 'Local key not initialized',
        };
      }
      
      const result = await V4.decrypt(token, this.localKey);
      
      // Check expiration
      if (result.exp) {
        const expDate = new Date(result.exp);
        if (expDate < new Date()) {
          return {
            success: false,
            error: 'Token has expired',
          };
        }
      }
      
      // Check not before
      if (result.nbf) {
        const nbfDate = new Date(result.nbf);
        if (nbfDate > new Date()) {
          return {
            success: false,
            error: 'Token is not yet valid',
          };
        }
      }
      
      return {
        success: true,
        payload: result as PasetoPayload,
        version: 'v4',
        purpose: 'local',
      };
    } catch (error) {
      console.error('Error verifying local token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      };
    }
  }
  
  /**
   * Create a PASETO v4.public token (asymmetric signature)
   * 
   * Use for tokens that need to be verified by external parties
   * without sharing the secret key (e.g., DeafAuth, PinkSync, Fibonorse)
   */
  async createPublicToken(
    payload: PasetoPayload,
    expirySeconds?: number,
    footer?: PasetoFooter
  ): Promise<PasetoTokenResult> {
    try {
      const paseto = await this.getPaseto();
      const { V4 } = paseto;
      
      if (!this.currentKeyId || !this.keyPairs.has(this.currentKeyId)) {
        await this.generateKeyPair();
      }
      
      const keyPair = this.keyPairs.get(this.currentKeyId!);
      if (!keyPair) {
        return {
          success: false,
          error: 'Key pair not initialized',
        };
      }
      
      const now = new Date();
      const exp = new Date(now.getTime() + (expirySeconds || this.config.defaultExpiry) * 1000);
      
      const fullPayload: PasetoPayload = {
        iss: this.config.issuer,
        aud: this.config.audience,
        iat: now.toISOString(),
        exp: exp.toISOString(),
        jti: crypto.randomBytes(16).toString('hex'),
        kid: keyPair.keyId,
        ...payload,
      };
      
      const footerData = footer 
        ? JSON.stringify({ ...footer, kid: keyPair.keyId }) 
        : JSON.stringify({ kid: keyPair.keyId });
      
      const token = await V4.sign(
        fullPayload,
        keyPair.secretKey,
        { footer: footerData }
      );
      
      return {
        success: true,
        token,
        payload: fullPayload,
        footer: { ...footer, kid: keyPair.keyId },
        version: 'v4',
        purpose: 'public',
      };
    } catch (error) {
      console.error('Error creating public token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating token',
      };
    }
  }
  
  /**
   * Verify a PASETO v4.public token
   */
  async verifyPublicToken(token: string, publicKey?: Buffer): Promise<PasetoTokenResult> {
    try {
      const paseto = await this.getPaseto();
      const { V4 } = paseto;
      
      // Extract footer to get key ID
      const parts = token.split('.');
      let footer: PasetoFooter | undefined;
      
      if (parts.length === 4) {
        try {
          const footerJson = Buffer.from(parts[3], 'base64url').toString('utf8');
          footer = JSON.parse(footerJson);
        } catch {
          // Footer parsing failed, continue without it
        }
      }
      
      // Find the appropriate key
      let keyToUse = publicKey;
      if (!keyToUse && footer?.kid && this.keyPairs.has(footer.kid)) {
        const keyPair = this.keyPairs.get(footer.kid);
        keyToUse = keyPair?.secretKey; // For verification we need the key object
      }
      
      if (!keyToUse && this.currentKeyId) {
        const keyPair = this.keyPairs.get(this.currentKeyId);
        keyToUse = keyPair?.secretKey;
      }
      
      if (!keyToUse) {
        return {
          success: false,
          error: 'No valid key found for token verification',
        };
      }
      
      const result = await V4.verify(token, keyToUse);
      
      // Check expiration
      if (result.exp) {
        const expDate = new Date(result.exp);
        if (expDate < new Date()) {
          return {
            success: false,
            error: 'Token has expired',
          };
        }
      }
      
      // Check not before
      if (result.nbf) {
        const nbfDate = new Date(result.nbf);
        if (nbfDate > new Date()) {
          return {
            success: false,
            error: 'Token is not yet valid',
          };
        }
      }
      
      return {
        success: true,
        payload: result as PasetoPayload,
        footer,
        version: 'v4',
        purpose: 'public',
      };
    } catch (error) {
      console.error('Error verifying public token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      };
    }
  }
  
  /**
   * Get the current public key for external verification
   */
  async getPublicKey(keyId?: string): Promise<{ success: boolean; publicKey?: string; keyId?: string; error?: string }> {
    try {
      const paseto = await this.getPaseto();
      const kid = keyId || this.currentKeyId;
      
      if (!kid || !this.keyPairs.has(kid)) {
        return {
          success: false,
          error: 'No public key available',
        };
      }
      
      const keyPair = this.keyPairs.get(kid);
      if (!keyPair) {
        return {
          success: false,
          error: 'Key pair not found',
        };
      }
      
      // Export the public key in a format suitable for sharing
      const publicKeyPem = keyPair.secretKey.export({ type: 'spki', format: 'pem' });
      
      return {
        success: true,
        publicKey: publicKeyPem as string,
        keyId: kid,
      };
    } catch (error) {
      console.error('Error getting public key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get public key',
      };
    }
  }
  
  /**
   * Create an access token for API authentication
   */
  async createAccessToken(
    userId: number | string,
    scopes: string[] = [],
    expirySeconds?: number
  ): Promise<PasetoTokenResult> {
    return this.createLocalToken(
      {
        sub: userId.toString(),
        scopes,
        type: 'access',
      },
      expirySeconds || 3600 // 1 hour default for access tokens
    );
  }
  
  /**
   * Create a refresh token for session management
   */
  async createRefreshToken(
    userId: number | string,
    sessionId?: string,
    expirySeconds?: number
  ): Promise<PasetoTokenResult> {
    return this.createLocalToken(
      {
        sub: userId.toString(),
        sid: sessionId || crypto.randomBytes(16).toString('hex'),
        type: 'refresh',
      },
      expirySeconds || 604800 // 7 days default for refresh tokens
    );
  }
  
  /**
   * Create a token for external service integration (DeafAuth, PinkSync, Fibonorse)
   */
  async createIntegrationToken(
    service: 'deafauth' | 'pinksync' | 'fibonorse',
    userId: number | string,
    permissions: string[] = [],
    expirySeconds?: number
  ): Promise<PasetoTokenResult> {
    return this.createPublicToken(
      {
        sub: userId.toString(),
        service,
        permissions,
        type: 'integration',
      },
      expirySeconds || 86400, // 24 hours default
      {
        service,
        version: '1.0',
      }
    );
  }
  
  /**
   * Verify any PASETO token (auto-detects version and purpose)
   */
  async verifyToken(token: string): Promise<PasetoTokenResult> {
    if (!token || typeof token !== 'string') {
      return {
        success: false,
        error: 'Invalid token format',
      };
    }
    
    // Detect token type from prefix
    if (token.startsWith('v4.local.')) {
      return this.verifyLocalToken(token);
    } else if (token.startsWith('v4.public.')) {
      return this.verifyPublicToken(token);
    } else {
      return {
        success: false,
        error: 'Unsupported token format. Expected v4.local or v4.public',
      };
    }
  }
  
  /**
   * Get service configuration
   */
  getConfig(): PasetoConfig {
    return { ...this.config };
  }
  
  /**
   * Check if the service is properly initialized
   */
  isInitialized(): boolean {
    return this.localKey !== null && this.currentKeyId !== null;
  }
}

// Export singleton instance
export const pasetoService = new PasetoService();
