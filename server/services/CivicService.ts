import axios from 'axios';
import * as crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { storage } from '../storage';

interface CivicOAuthConfig {
  clientId: string;           // The CIVIC_APP_ID
  privateKey?: string;        // The CIVIC_PRIVATE_KEY (optional for some flows)
  redirectUri: string;        // The URL Civic will redirect to after authentication
  scope: string;              // Requested scope (e.g., 'basic')
}

interface CivicUser {
  userId: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  verifiedFields: string[];
  civicId: string;
}

/**
 * Service to handle Civic.com integration using OAuth 2.0 with PKCE flow
 */
export class CivicService {
  private config: CivicOAuthConfig;
  private baseUrl: string = 'https://api.civic.com/';
  private authUrl: string = 'https://auth.civic.com/';
  private isConfigured: boolean = false;
  
  constructor() {
    // Initialize from environment variables
    const clientId = process.env.CIVIC_APP_ID;
    const privateKey = process.env.CIVIC_PRIVATE_KEY;
    const redirectDomain = process.env.REDIRECT_DOMAIN || 'negrarosa.mbtquniverse.com';
    
    if (clientId) {
      this.config = {
        clientId,
        privateKey,
        redirectUri: `https://${redirectDomain}/api/v1/auth/civic/callback`,
        scope: 'basic openid email phone'
      };
      this.isConfigured = true;
      console.log('Civic service initialized');
    } else {
      console.log('Civic service not fully configured. Missing: CIVIC_APP_ID');
      this.config = {
        clientId: '',
        redirectUri: '',
        scope: ''
      };
    }
  }
  
  /**
   * Generate a PKCE code verifier and challenge
   */
  private generatePKCE(): { codeVerifier: string, codeChallenge: string } {
    // Generate a random code verifier
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    
    // Create a code challenge from the verifier
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    return { codeVerifier, codeChallenge };
  }
  
  /**
   * Sign a message with the private key
   */
  private signMessage(message: string): string | null {
    if (!this.config.privateKey) {
      console.warn('Civic private key not configured, cannot sign message');
      return null;
    }
    
    try {
      const hmac = CryptoJS.HmacSHA256(message, this.config.privateKey);
      return CryptoJS.enc.Base64.stringify(hmac);
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }
  
  /**
   * Generate an authorization URL for redirecting users to Civic
   */
  public generateAuthUrl(state: string): { url: string, codeVerifier: string } {
    if (!this.isConfigured) {
      throw new Error('Civic service not properly configured');
    }
    
    // Generate PKCE code verifier and challenge
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    
    // Build the authorization URL
    const url = new URL(`${this.authUrl}authorize`);
    url.searchParams.append('client_id', this.config.clientId);
    url.searchParams.append('redirect_uri', this.config.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', this.config.scope);
    url.searchParams.append('state', state);
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
    
    return { url: url.toString(), codeVerifier };
  }
  
  /**
   * Exchange an authorization code for tokens
   */
  public async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('Civic service not properly configured');
    }
    
    try {
      const response = await axios.post(`${this.baseUrl}oauth2/token`, {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: this.config.redirectUri
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }
  
  /**
   * Get user info using an access token
   */
  public async getUserInfo(accessToken: string): Promise<CivicUser> {
    try {
      const response = await axios.get(`${this.baseUrl}v1/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user info from Civic:', error);
      throw new Error('Failed to fetch user info from Civic');
    }
  }
  
  /**
   * Start the authentication flow by generating an auth URL and storing the code verifier
   */
  public async startAuthFlow(userId: number): Promise<string> {
    // Generate a unique state parameter to prevent CSRF
    const state = crypto.randomBytes(16).toString('hex');
    
    // Generate the authorization URL with PKCE
    const { url, codeVerifier } = this.generateAuthUrl(state);
    
    // Store the code verifier and state for later validation
    await storage.storeOAuthState(userId, {
      provider: 'civic',
      state,
      codeVerifier,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    return url;
  }
  
  /**
   * Complete the authentication flow by handling the callback
   */
  public async handleCallback(code: string, state: string): Promise<{ userId: number, userInfo: CivicUser }> {
    // Retrieve the stored OAuth state
    const oauthState = await storage.getOAuthStateByState(state);
    if (!oauthState || oauthState.provider !== 'civic') {
      throw new Error('Invalid state parameter');
    }
    
    // Verify state hasn't expired
    if (new Date() > oauthState.expiresAt) {
      throw new Error('Authorization state has expired');
    }
    
    // Exchange the code for tokens
    const tokens = await this.exchangeCodeForTokens(code, oauthState.codeVerifier);
    
    // Get user info
    const userInfo = await this.getUserInfo(tokens.access_token);
    
    // Store the tokens
    await storage.storeUserTokens(oauthState.userId, {
      provider: 'civic',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      tokenType: tokens.token_type,
      scope: tokens.scope
    });
    
    // Link the Civic identity to the user account
    await storage.linkExternalIdentity(oauthState.userId, {
      provider: 'civic',
      externalId: userInfo.civicId,
      data: {
        verifiedFields: userInfo.verifiedFields
      }
    });
    
    return { userId: oauthState.userId, userInfo };
  }
  
  /**
   * Request verification of specific user attributes
   */
  public async requestVerification(userId: number, attributes: string[]): Promise<string> {
    // Generate a unique request ID
    const requestId = crypto.randomBytes(16).toString('hex');
    
    // In a real implementation, this would make an API call to Civic
    // For now, we'll simulate by storing the request locally
    await storage.storeVerificationRequest(userId, {
      id: requestId,
      provider: 'civic',
      attributes,
      status: 'PENDING',
      createdAt: new Date()
    });
    
    // Return a URL where the user would be redirected to complete verification
    const baseUrl = process.env.REDIRECT_DOMAIN || 'negrarosa.mbtquniverse.com';
    return `https://${baseUrl}/verification/civic/${requestId}`;
  }
  
  /**
   * Check if the service is properly configured
   */
  public isFullyConfigured(): boolean {
    return this.isConfigured && !!this.config.privateKey;
  }
}

// Export a singleton instance
export const civicService = new CivicService();