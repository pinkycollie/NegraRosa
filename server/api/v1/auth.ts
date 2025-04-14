import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenantId?: string;
    }
  }
}

const router = Router();

/**
 * @route GET /api/v1/auth/me
 * @desc Get authenticated user profile
 * @access Private
 */
router.get('/me', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get or create user in our database
    const user = await auth0Service.syncUserFromAuth0(req.user.sub);
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

/**
 * @route GET /api/v1/auth/permissions
 * @desc Get authenticated user permissions
 * @access Private
 */
router.get('/permissions', auth0Service.checkJwt, (req: Request, res: Response) => {
  try {
    if (!req.user?.permissions) {
      return res.json({ permissions: [] });
    }
    return res.json({ permissions: req.user.permissions });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return res.status(500).json({ message: 'Error fetching user permissions', error: error.message });
  }
});

/**
 * @route GET /api/v1/auth/tenants
 * @desc Get user's assigned tenants
 * @access Private
 */
router.get('/tenants', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get internal user from Auth0 ID
    const user = await storage.getUserByExternalId(req.user.sub);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get tenants from storage
    const tenants = await storage.getUserTenants(user.id);
    return res.json(tenants);
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    return res.status(500).json({ message: 'Error fetching user tenants', error: error.message });
  }
});

/**
 * @route GET /api/v1/auth/config
 * @desc Get Auth0 configuration for frontend
 * @access Public
 */
router.get('/config', (req: Request, res: Response) => {
  // Only expose public configuration settings
  const config = {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email',
    redirectUri: process.env.AUTH0_CALLBACK_URL || `${req.protocol}://${req.get('host')}/callback`
  };
  
  res.json(config);
});

export default router;