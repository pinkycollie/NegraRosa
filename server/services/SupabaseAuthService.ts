import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as crypto from 'crypto';
import { storage } from '../storage';

/**
 * SupabaseAuthService - OAuth provider and identity layer integration
 * Provides authentication, identity verification, and session management
 * with focus on accessibility and DeafAUTH compatibility
 */
export class SupabaseAuthService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private supabaseServiceKey: string;
  private jwtSecret: string;
  private isConfigured: boolean = false;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

    if (this.supabaseUrl && this.supabaseAnonKey) {
      this.isConfigured = true;
      console.log('Supabase Auth Service initialized');
    } else {
      console.log('Supabase Auth Service not fully configured. Missing: SUPABASE_URL or SUPABASE_ANON_KEY');
    }
  }

  /**
   * Check if Supabase is properly configured
   */
  public isFullyConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Generate PKCE code verifier and challenge for secure OAuth flow
   */
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  /**
   * Sign up a new user with email/password
   */
  async signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<{
    success: boolean;
    user?: unknown;
    session?: unknown;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const response = await axios.post(
        `${this.supabaseUrl}/auth/v1/signup`,
        {
          email,
          password,
          data: metadata || {}
        },
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        user: response.data.user,
        session: response.data.session
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Supabase sign up error:', error);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Sign up failed'
      };
    }
  }

  /**
   * Sign in with email/password
   */
  async signIn(email: string, password: string): Promise<{
    success: boolean;
    user?: unknown;
    session?: unknown;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const response = await axios.post(
        `${this.supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          email,
          password
        },
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        user: response.data.user,
        session: response.data,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Supabase sign in error:', error);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Sign in failed'
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(accessToken: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      await axios.post(
        `${this.supabaseUrl}/auth/v1/logout`,
        {},
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Supabase sign out error:', error);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Sign out failed'
      };
    }
  }

  /**
   * Get user information from access token
   */
  async getUser(accessToken: string): Promise<{
    success: boolean;
    user?: unknown;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const response = await axios.get(
        `${this.supabaseUrl}/auth/v1/user`,
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return {
        success: true,
        user: response.data
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Supabase get user error:', error);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Failed to get user'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const response = await axios.post(
        `${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
        {
          refresh_token: refreshToken
        },
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Supabase refresh token error:', error);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Token refresh failed'
      };
    }
  }

  /**
   * Generate OAuth authorization URL for third-party providers
   */
  generateOAuthUrl(provider: string, redirectTo: string, scopes?: string[]): {
    url: string;
    codeVerifier: string;
  } {
    const { codeVerifier, codeChallenge } = this.generatePKCE();
    const state = crypto.randomBytes(16).toString('hex');

    const params = new URLSearchParams({
      provider,
      redirect_to: redirectTo,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    if (scopes && scopes.length > 0) {
      params.append('scopes', scopes.join(' '));
    }

    return {
      url: `${this.supabaseUrl}/auth/v1/authorize?${params.toString()}`,
      codeVerifier
    };
  }

  /**
   * Exchange OAuth code for session
   */
  async exchangeCodeForSession(code: string, codeVerifier: string): Promise<{
    success: boolean;
    session?: unknown;
    user?: unknown;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const response = await axios.post(
        `${this.supabaseUrl}/auth/v1/token?grant_type=pkce`,
        {
          auth_code: code,
          code_verifier: codeVerifier
        },
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        session: response.data,
        user: response.data.user
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Supabase exchange code error:', error);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Code exchange failed'
      };
    }
  }

  /**
   * Start OAuth flow for a user
   */
  async startOAuthFlow(userId: number, provider: string, redirectUrl: string): Promise<string> {
    const { url, codeVerifier } = this.generateOAuthUrl(provider, redirectUrl);
    const state = crypto.randomBytes(16).toString('hex');

    // Store the code verifier and state for later validation
    await storage.storeOAuthState(userId, {
      userId,
      provider: `supabase_${provider}`,
      state,
      codeVerifier,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    return `${url}&state=${state}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string): Promise<{
    success: boolean;
    userId?: number;
    user?: unknown;
    error?: string;
  }> {
    // Retrieve the stored OAuth state
    const oauthState = await storage.getOAuthStateByState(state);
    if (!oauthState || !oauthState.provider.startsWith('supabase_')) {
      return { success: false, error: 'Invalid state parameter' };
    }

    // Verify state hasn't expired
    if (new Date() > oauthState.expiresAt) {
      return { success: false, error: 'Authorization state has expired' };
    }

    // Exchange the code for session
    const result = await this.exchangeCodeForSession(code, oauthState.codeVerifier);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Link the identity to the user account
    const userData = result.user as { id: string; email?: string };
    await storage.linkExternalIdentity(oauthState.userId, {
      provider: oauthState.provider,
      externalId: userData.id,
      data: result.user
    });

    return {
      success: true,
      userId: oauthState.userId,
      user: result.user
    };
  }

  /**
   * Generate a local JWT token for users
   * Used when Supabase is not configured
   */
  generateLocalToken(userId: number, email: string, metadata?: Record<string, unknown>): string {
    return jwt.sign(
      {
        sub: userId.toString(),
        email,
        ...metadata,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      },
      this.jwtSecret
    );
  }

  /**
   * Verify a local JWT token
   */
  verifyLocalToken(token: string): { valid: boolean; payload?: jwt.JwtPayload; error?: string } {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      return { valid: true, payload };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { valid: false, error: err.message || 'Invalid token' };
    }
  }

  /**
   * Express middleware to check JWT authentication
   */
  checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Try Supabase verification first if configured
      if (this.isConfigured) {
        const result = await this.getUser(token);
        if (result.success) {
          (req as Request & { user: unknown }).user = result.user;
          return next();
        }
      }

      // Fall back to local token verification
      const localResult = this.verifyLocalToken(token);
      if (localResult.valid) {
        (req as Request & { user: unknown }).user = localResult.payload;
        return next();
      }

      return res.status(401).json({ message: 'Invalid token' });
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };

  /**
   * Get service status for health checks
   */
  getStatus(): {
    configured: boolean;
    supabaseUrl: string;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
  } {
    return {
      configured: this.isConfigured,
      supabaseUrl: this.supabaseUrl ? `${this.supabaseUrl.substring(0, 30)}...` : 'Not set',
      hasAnonKey: !!this.supabaseAnonKey,
      hasServiceKey: !!this.supabaseServiceKey
    };
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService();
