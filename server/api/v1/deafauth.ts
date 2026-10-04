import { Router, Request, Response } from 'express';
import { deafAuthService } from '../../services/DeafAuthService';

const router = Router();

/**
 * DeafAUTH API Routes
 * Accessibility-first authentication for Deaf and Hard of Hearing users
 */

/**
 * @route GET /api/v1/deafauth/methods
 * @desc Get available DeafAUTH authentication methods
 */
router.get('/methods', (_req: Request, res: Response) => {
  const methods = deafAuthService.getAvailableMethods();
  res.json({ 
    success: true, 
    methods,
    message: 'All methods are visual-first with no audio dependencies'
  });
});

/**
 * @route POST /api/v1/deafauth/session
 * @desc Initialize a DeafAUTH authentication session
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { userId, method, preferences } = req.body;

    if (!userId || !method) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and method required',
        visualFeedback: '❌ Missing required fields'
      });
    }

    const result = await deafAuthService.initializeSession(
      parseInt(userId),
      method,
      preferences
    );

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.error,
        visualFeedback: '❌ Session initialization failed'
      });
    }

    res.json({
      success: true,
      sessionId: result.sessionId,
      challenge: result.challenge,
      visualGuidance: result.visualGuidance
    });
  } catch (error) {
    console.error('DeafAUTH session error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      visualFeedback: '⚠️ Please try again'
    });
  }
});

/**
 * @route POST /api/v1/deafauth/verify
 * @desc Verify DeafAUTH authentication response
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { sessionId, response } = req.body;

    if (!sessionId || !response) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID and response required',
        visualFeedback: '❌ Missing authentication data'
      });
    }

    const result = await deafAuthService.verifyAuthentication(sessionId, response);

    res.json({
      success: result.success,
      token: result.token,
      visualFeedback: result.visualFeedback,
      error: result.error
    });
  } catch (error) {
    console.error('DeafAUTH verify error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      visualFeedback: '⚠️ Verification failed, please try again'
    });
  }
});

/**
 * @route POST /api/v1/deafauth/pattern/setup
 * @desc Set up visual pattern for a user
 */
router.post('/pattern/setup', async (req: Request, res: Response) => {
  try {
    const { userId, pattern, gridSize } = req.body;

    if (!userId || !pattern) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and pattern required',
        visualFeedback: '❌ Please provide pattern data'
      });
    }

    const result = await deafAuthService.setupVisualPattern(
      parseInt(userId),
      pattern,
      gridSize
    );

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.error,
        visualFeedback: '❌ Pattern must connect at least 4 dots'
      });
    }

    res.json({ 
      success: true, 
      message: 'Visual pattern configured',
      visualFeedback: '✅ Pattern saved successfully'
    });
  } catch (error) {
    console.error('Pattern setup error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      visualFeedback: '⚠️ Setup failed, please try again'
    });
  }
});

/**
 * @route GET /api/v1/deafauth/preferences/:userId
 * @desc Get accessibility preferences for a user
 */
router.get('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const preferences = await deafAuthService.getAccessibilityPreferences(userId);
    res.json({ 
      success: true, 
      preferences,
      visualFeedback: '✅ Preferences loaded'
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      visualFeedback: '⚠️ Could not load preferences'
    });
  }
});

/**
 * @route PUT /api/v1/deafauth/preferences/:userId
 * @desc Update accessibility preferences for a user
 */
router.put('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await deafAuthService.updateAccessibilityPreferences(userId, req.body);
    res.json({ 
      success: true, 
      preferences: result.preferences,
      visualFeedback: '✅ Preferences updated'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      visualFeedback: '⚠️ Could not update preferences'
    });
  }
});

/**
 * @route GET /api/v1/deafauth/status
 * @desc Get DeafAUTH service status
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = deafAuthService.getStatus();
  res.json({ 
    success: true, 
    status,
    ecosystem: {
      service: 'DeafAUTH',
      version: '1.0.0',
      deafFirst: true,
      visualFeedback: true,
      hapticSupport: true
    }
  });
});

export default router;
