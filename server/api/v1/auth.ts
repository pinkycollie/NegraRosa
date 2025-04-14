import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }
    
    const authResult = await auth0Service.login(username, password);
    
    if (authResult.error) {
      return res.status(401).json({ message: authResult.error });
    }
    
    return res.json({
      token: authResult.access_token,
      expiresIn: authResult.expires_in,
      userId: authResult.user_id
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Authentication failed', error: String(error) });
  }
});

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['username', 'email', 'password'] 
      });
    }
    
    const registerResult = await auth0Service.register(username, email, password, fullName);
    
    if (registerResult.error) {
      return res.status(400).json({ message: registerResult.error });
    }
    
    return res.status(201).json({
      message: 'Registration successful',
      userId: registerResult.user_id
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: String(error) });
  }
});

/**
 * @route POST /api/v1/auth/verify-token
 * @desc Verify JWT token
 * @access Public
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const verifyResult = await auth0Service.verifyToken(token);
    
    if (verifyResult.error) {
      return res.status(401).json({ message: verifyResult.error });
    }
    
    return res.json({
      valid: true,
      decodedToken: verifyResult
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ message: 'Token verification failed', error: String(error) });
  }
});

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', auth0Service.checkJwt, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['currentPassword', 'newPassword'] 
      });
    }
    
    // Get the user ID from the token
    const userId = req.user.sub;
    
    const changeResult = await auth0Service.changePassword(userId, currentPassword, newPassword);
    
    if (changeResult.error) {
      return res.status(400).json({ message: changeResult.error });
    }
    
    return res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Password change failed', error: String(error) });
  }
});

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Initiate forgot password process
 * @access Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const forgotResult = await auth0Service.forgotPassword(email);
    
    if (forgotResult.error) {
      return res.status(400).json({ message: forgotResult.error });
    }
    
    return res.json({
      message: 'Password reset initiated successfully. Check your email for further instructions.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Forgot password request failed', error: String(error) });
  }
});

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    const refreshResult = await auth0Service.refreshToken(refreshToken);
    
    if (refreshResult.error) {
      return res.status(401).json({ message: refreshResult.error });
    }
    
    return res.json({
      token: refreshResult.access_token,
      refreshToken: refreshResult.refresh_token,
      expiresIn: refreshResult.expires_in
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ message: 'Token refresh failed', error: String(error) });
  }
});

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', auth0Service.checkJwt, async (req, res) => {
  try {
    // The user ID is in the token payload (req.user.sub)
    const userInfo = await auth0Service.getUserInfo(req.user.sub);
    
    if (!userInfo) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ message: 'Error fetching user info', error: String(error) });
  }
});

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', auth0Service.checkJwt, async (req, res) => {
  try {
    // Auth0 doesn't actually invalidate tokens server-side
    // The client should simply remove the token from storage
    // This endpoint would be used for any server-side cleanup needed
    
    return res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout failed', error: String(error) });
  }
});

export default router;