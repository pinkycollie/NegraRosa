import { Router } from 'express';
import { Request, Response } from 'express';
import { storage } from '../../storage';
import { auth0Service } from '../../services/Auth0Service';
import { civicService } from '../../services/CivicService';
import { z } from 'zod';
import { AuthService } from '../../services/AuthService';

// Create an instance of the AuthService
const authService = new AuthService();

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    
    const loginResult = await auth0Service.login(username, password);
    
    if (!loginResult.success) {
      return res.status(401).json({ message: loginResult.message || 'Authentication failed' });
    }
    
    res.json(loginResult.data);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      username: z.string().min(3),
      password: z.string().min(6),
      email: z.string().email(),
      fullName: z.string().optional(),
      phone: z.string().optional()
    });
    
    const userData = userSchema.parse(req.body);
    
    // Check if username or email already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Register with Auth0 and our database
    const registerResult = await auth0Service.register(userData);
    
    if (!registerResult.success) {
      return res.status(400).json({ message: registerResult.message || 'Registration failed' });
    }
    
    res.status(201).json(registerResult.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @route POST /api/v1/auth/verify-token
 * @desc Verify JWT token
 * @access Public
 */
router.post('/verify-token', auth0Service.checkJwt, (req: Request, res: Response) => {
  try {
    // If middleware passed, token is valid
    res.json({ valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const changePasswordResult = await auth0Service.changePassword(req.user.id, currentPassword, newPassword);
    
    if (!changePasswordResult.success) {
      return res.status(400).json({ message: changePasswordResult.message || 'Password change failed' });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Initiate forgot password process
 * @access Public
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }
    
    const forgotPasswordResult = await auth0Service.forgotPassword(email);
    
    if (!forgotPasswordResult.success) {
      return res.status(400).json({ message: forgotPasswordResult.message || 'Forgot password request failed' });
    }
    
    res.json({ message: 'Password reset initiated. Check your email for instructions.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password process' });
  }
});

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Please provide refresh token' });
    }
    
    const tokenResult = await auth0Service.refreshToken(refreshToken);
    
    if (!tokenResult.success) {
      return res.status(401).json({ message: tokenResult.message || 'Token refresh failed' });
    }
    
    res.json(tokenResult.data);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userInfo = await auth0Service.getUserInfo(req.user.id);
    
    if (!userInfo.success) {
      return res.status(404).json({ message: userInfo.message || 'User not found' });
    }
    
    res.json(userInfo.data);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Server error fetching user information' });
  }
});

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    // Clients should delete the token on their side
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

/**
 * @route POST /api/v1/auth/biometric
 * @desc Authenticate with biometric verification
 * @access Public
 */
router.post('/biometric', async (req: Request, res: Response) => {
  try {
    const { biometricData, userId } = req.body;
    
    if (!biometricData || !userId) {
      return res.status(400).json({ message: 'Please provide biometric data and user ID' });
    }
    
    const authResult = await authService.biometricAuth(userId, biometricData);
    
    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message || 'Biometric authentication failed' });
    }
    
    res.json(authResult.data);
  } catch (error) {
    console.error('Biometric authentication error:', error);
    res.status(500).json({ message: 'Server error during biometric authentication' });
  }
});

/**
 * @route POST /api/v1/auth/nft
 * @desc Authenticate with NFT verification
 * @access Public
 */
router.post('/nft', async (req: Request, res: Response) => {
  try {
    const { walletAddress, nftTokenId, chainId } = req.body;
    
    if (!walletAddress || !nftTokenId) {
      return res.status(400).json({ message: 'Please provide wallet address and NFT token ID' });
    }
    
    const authResult = await authService.nftAuth(walletAddress, nftTokenId, chainId);
    
    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message || 'NFT authentication failed' });
    }
    
    res.json(authResult.data);
  } catch (error) {
    console.error('NFT authentication error:', error);
    res.status(500).json({ message: 'Server error during NFT authentication' });
  }
});

/**
 * @route POST /api/v1/auth/recovery-code
 * @desc Authenticate with recovery code
 * @access Public
 */
router.post('/recovery-code', async (req: Request, res: Response) => {
  try {
    const { email, recoveryCode } = req.body;
    
    if (!email || !recoveryCode) {
      return res.status(400).json({ message: 'Please provide email and recovery code' });
    }
    
    const authResult = await authService.recoveryCodeAuth(email, recoveryCode);
    
    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message || 'Recovery code authentication failed' });
    }
    
    res.json(authResult.data);
  } catch (error) {
    console.error('Recovery code authentication error:', error);
    res.status(500).json({ message: 'Server error during recovery code authentication' });
  }
});

/**
 * @route GET /api/v1/auth/callback
 * @desc OAuth callback handler
 * @access Public
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    console.log('Received OAuth callback:', JSON.stringify(req.query));
    
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ 
        message: 'Invalid OAuth callback', 
        error: 'Missing code or state parameter'
      });
    }
    
    // Process the OAuth callback with Auth0
    const authResult = await auth0Service.handleOAuthCallback(code.toString(), state.toString());
    
    if (!authResult.success) {
      console.error('OAuth callback failed:', authResult.message);
      
      // Redirect to error page with error message
      return res.redirect(`/auth-error?message=${encodeURIComponent(authResult.message || 'Authentication failed')}`);
    }
    
    // If the auth was successful, redirect to the appropriate page with the token
    // Usually, we would set a cookie or store the token in session before redirecting
    const redirectUrl = authResult.data.redirectUrl || '/dashboard';
    const token = authResult.data.accessToken;
    
    // For security, tokens should not be passed in URL parameters in production
    // This is just for demonstration - in a real app, use secure cookies or session
    return res.redirect(`${redirectUrl}?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect('/auth-error?message=Server+error+during+authentication');
  }
});

/**
 * @route GET /api/v1/auth/civic/login
 * @desc Start Civic.com OAuth login flow
 * @access Public
 */
router.get('/civic/login', async (req: Request, res: Response) => {
  try {
    // Check if Civic service is properly configured
    if (!civicService.isFullyConfigured()) {
      return res.status(400).json({
        message: 'Civic authentication is not fully configured',
        error: 'Missing required environment variables'
      });
    }

    // Get user ID from query parameter or authenticated session
    let userId: number | undefined;
    
    if (req.query.userId) {
      userId = parseInt(req.query.userId as string, 10);
    } else if (req.user?.id) {
      userId = req.user.id;
    } else {
      // Create a temporary user if no user ID provided
      const user = await storage.createUser({
        username: `temp_${Date.now()}`,
        password: '', // Will be set after authentication
        email: '',    // Will be set after authentication
        fullName: null,
        phone: null
      });
      userId = user.id;
    }

    // Generate authorization URL
    const authUrl = await civicService.startAuthFlow(userId);
    
    // Determine if this is an API request or direct browser request
    if (req.headers.accept?.includes('application/json')) {
      res.json({ redirectUrl: authUrl });
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error('Civic login error:', error);
    res.status(500).json({ message: 'Server error starting Civic authentication' });
  }
});

/**
 * @route GET /api/v1/auth/civic/callback
 * @desc Handle Civic.com OAuth callback
 * @access Public
 */
router.get('/civic/callback', async (req: Request, res: Response) => {
  try {
    console.log('Received Civic callback:', JSON.stringify(req.query));
    
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ 
        message: 'Invalid Civic callback', 
        error: 'Missing code or state parameter'
      });
    }
    
    // Process the callback with Civic service
    const result = await civicService.handleCallback(code.toString(), state.toString());
    
    // Update or create user based on Civic data
    const user = await storage.getUser(result.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a session token or JWT
    // In a real application, we would use proper JWT issuance here
    const token = `civic_${result.userId}_${Date.now()}`;
    
    // Redirect to the frontend with token
    const redirectUrl = req.query.redirectUrl || '/dashboard';
    
    // For security, tokens should not be passed in URL parameters in production
    // This is just for demonstration - in a real app, use secure cookies or session
    return res.redirect(`${redirectUrl}?token=${token}&provider=civic`);
  } catch (error) {
    console.error('Civic callback error:', error);
    return res.redirect('/auth-error?message=Server+error+during+Civic+authentication');
  }
});

/**
 * @route POST /api/v1/auth/civic/verify
 * @desc Request verification of attributes through Civic
 * @access Private
 */
router.post('/civic/verify', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { attributes } = req.body;
    
    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      return res.status(400).json({ message: 'Please provide attributes to verify' });
    }
    
    // Request verification from Civic
    const verificationUrl = await civicService.requestVerification(req.user.id, attributes);
    
    res.json({ 
      success: true, 
      verificationUrl,
      message: 'Verification request initiated' 
    });
  } catch (error) {
    console.error('Civic verification request error:', error);
    res.status(500).json({ message: 'Server error during verification request' });
  }
});

export default router;