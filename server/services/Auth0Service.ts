import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { storage } from '../storage';
import { User } from '@shared/schema';

/**
 * Service for handling Auth0 authentication and authorization
 */
export class Auth0Service {
  private domain: string;
  private clientId: string;
  private clientSecret: string;
  private audience: string;
  private algorithms: string[];
  private jwksUri: string;
  private jwks: any; // Cache for JWKS
  private lastJwksFetch: number;

  constructor() {
    // Initialize from environment variables
    this.domain = process.env.AUTH0_DOMAIN || '';
    this.clientId = process.env.AUTH0_CLIENT_ID || '';
    this.clientSecret = process.env.AUTH0_CLIENT_SECRET || '';
    this.audience = process.env.AUTH0_AUDIENCE || '';
    this.algorithms = ['RS256'];
    this.jwksUri = `https://${this.domain}/.well-known/jwks.json`;
    this.jwks = null;
    this.lastJwksFetch = 0;

    if (!this.domain || !this.clientId || !this.clientSecret) {
      console.warn('Auth0Service not fully configured. Missing credentials.');
    } else {
      console.log('Auth0Service initialized');
    }
  }

  /**
   * Fetches JSON Web Key Set (JWKS) from Auth0
   * Used for token verification
   */
  private async getJwks(): Promise<any> {
    const now = Date.now();
    // Refresh JWKS every hour
    if (this.jwks && now - this.lastJwksFetch < 3600000) {
      return this.jwks;
    }

    try {
      const response = await axios.get(this.jwksUri);
      this.jwks = response.data;
      this.lastJwksFetch = now;
      return this.jwks;
    } catch (error) {
      console.error('Failed to fetch JWKS:', error);
      throw new Error('Failed to fetch JWKS for token verification');
    }
  }

  /**
   * Finds the signing key in JWKS that matches the token's key ID (kid)
   */
  private async getSigningKey(kid: string): Promise<string> {
    const jwks = await this.getJwks();
    const signingKey = jwks.keys.find((key: any) => key.kid === kid);
    
    if (!signingKey) {
      throw new Error('Unable to find a signing key that matches the key ID in the token');
    }
    
    return signingKey.x5c[0];
  }

  /**
   * Verifies an Auth0 access token
   */
  async verifyToken(token: string): Promise<any> {
    if (!token) {
      throw new Error('No token provided');
    }

    // Decode the token without verification to get the key ID
    const decoded: any = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('Invalid token structure');
    }

    try {
      // Get the signing key that matches the token's key ID
      const signingKey = await this.getSigningKey(decoded.header.kid);
      const cert = `-----BEGIN CERTIFICATE-----\n${signingKey}\n-----END CERTIFICATE-----`;

      // Verify the token using the correct signing key
      return jwt.verify(token, cert, {
        algorithms: this.algorithms,
        audience: this.audience,
        issuer: `https://${this.domain}/`
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Express middleware to check if a request is authenticated
   */
  checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = await this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
  };

  /**
   * Express middleware to check if a user has required permissions
   */
  checkPermissions = (requiredPermissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.permissions) {
        return res.status(403).json({ message: 'Missing user permissions' });
      }

      const userPermissions = req.user.permissions;
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: requiredPermissions,
          user: userPermissions
        });
      }

      next();
    };
  };

  /**
   * Gets user profile information from Auth0
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      // First, get management API token
      const tokenResponse = await axios.post(
        `https://${this.domain}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: `https://${this.domain}/api/v2/`
        }
      );

      const apiToken = tokenResponse.data.access_token;

      // Use token to get user profile
      const userResponse = await axios.get(
        `https://${this.domain}/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      return userResponse.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new Error('Could not retrieve user profile');
    }
  }

  /**
   * Synchronizes Auth0 user with our internal database
   */
  async syncUserFromAuth0(auth0UserId: string): Promise<User> {
    try {
      // Get user from Auth0
      const auth0User = await this.getUserProfile(auth0UserId);
      
      // Check if we already have this user in our DB
      let user = await storage.getUserByExternalId(auth0UserId);
      
      if (user) {
        // Update existing user
        user = await storage.updateUserFromAuth0(user.id, {
          email: auth0User.email,
          fullName: auth0User.name,
          auth0Metadata: auth0User.user_metadata || {},
          lastLogin: new Date()
        });
      } else {
        // Create new user
        user = await storage.createUserFromAuth0({
          externalId: auth0UserId,
          username: auth0User.nickname || auth0User.email,
          email: auth0User.email,
          fullName: auth0User.name,
          phone: auth0User.phone_number,
          auth0Metadata: auth0User.user_metadata || {}
        });
      }
      
      return user;
    } catch (error) {
      console.error('Failed to sync user from Auth0:', error);
      throw new Error('User synchronization failed');
    }
  }

  /**
   * Validates user membership in a specific tenant
   */
  async validateTenantAccess(userId: number, tenantId: string): Promise<boolean> {
    try {
      const tenant = await storage.getUserTenantMembership(userId, tenantId);
      return !!tenant;
    } catch (error) {
      console.error('Failed to validate tenant access:', error);
      return false;
    }
  }

  /**
   * Express middleware to check if a user has access to the requested tenant
   */
  checkTenantAccess = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const tenantId = req.params.tenantId || req.query.tenantId as string;
      
      if (!tenantId) {
        return res.status(400).json({ message: 'Missing tenant ID' });
      }

      if (!req.user || !req.user.sub) {
        return res.status(403).json({ message: 'Unauthenticated request' });
      }

      try {
        // Get internal user ID from Auth0 ID
        const user = await storage.getUserByExternalId(req.user.sub);
        
        if (!user) {
          return res.status(403).json({ message: 'User not found in system' });
        }

        const hasAccess = await this.validateTenantAccess(user.id, tenantId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: 'User does not have access to this tenant' });
        }

        // Add tenant context to request for downstream use
        req.tenantId = tenantId;
        next();
      } catch (error) {
        console.error('Tenant access check failed:', error);
        return res.status(500).json({ message: 'Failed to validate tenant access' });
      }
    };
  };
}

// Export a singleton instance
export const auth0Service = new Auth0Service();