import { Router, Request, Response } from 'express';
import { pasetoService } from '../../services/PasetoService';
import { deafAuthService } from '../../services/DeafAuthService';
import { pinkSyncService } from '../../services/PinkSyncService';
import { fibonorseService } from '../../services/FibonorseService';
import { z } from 'zod';

/**
 * DeafAuth API Routes
 * 
 * Foundation authentication endpoints for DeafAuth (github.com/deafauth/deafauth),
 * PinkSync, and Fibonorse using PASETO tokens.
 * 
 * SECURITY NOTE: In production, implement rate limiting on all authentication
 * endpoints to prevent brute force attacks. Consider using express-rate-limit
 * or similar middleware. Example configuration:
 * 
 * const rateLimit = require('express-rate-limit');
 * const authLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100, // limit each IP to 100 requests per windowMs
 *   message: 'Too many authentication attempts, please try again later'
 * });
 * router.use('/authenticate', authLimiter);
 */

const router = Router();

// ============================================
// PASETO Token Endpoints
// ============================================

/**
 * @route GET /api/v1/paseto/public-key
 * @desc Get the current public key for token verification
 * @access Public
 */
router.get('/public-key', async (req: Request, res: Response) => {
  try {
    const result = await pasetoService.getPublicKey();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to get public key',
      });
    }
    
    res.json({
      success: true,
      publicKey: result.publicKey,
      keyId: result.keyId,
      algorithm: 'Ed25519',
      version: 'v4',
    });
  } catch (error) {
    console.error('Error getting public key:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting public key',
    });
  }
});

/**
 * @route POST /api/v1/paseto/verify
 * @desc Verify a PASETO token
 * @access Public
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }
    
    const result = await pasetoService.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error || 'Token verification failed',
      });
    }
    
    res.json({
      success: true,
      valid: true,
      payload: result.payload,
      version: result.version,
      purpose: result.purpose,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying token',
    });
  }
});

/**
 * @route GET /api/v1/paseto/config
 * @desc Get PASETO service configuration
 * @access Public
 */
router.get('/config', (req: Request, res: Response) => {
  const config = pasetoService.getConfig();
  res.json({
    success: true,
    issuer: config.issuer,
    audience: config.audience,
    version: 'v4',
    supportedPurposes: ['local', 'public'],
  });
});

// ============================================
// DeafAuth Endpoints
// ============================================

/**
 * @route POST /api/v1/paseto/deafauth/authenticate
 * @desc Authenticate with DeafAuth
 * @access Public
 */
router.post('/deafauth/authenticate', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number().optional(),
      email: z.string().email().optional(),
      username: z.string().optional(),
      authMethod: z.enum(['visual', 'biometric', 'sign_verification', 'passkey', 'nft']),
      authData: z.any(),
      accessibilityPreferences: z.object({
        preferredCommunication: z.enum(['visual', 'text', 'sign_language', 'mixed']).optional(),
        signLanguageType: z.enum(['ASL', 'BSL', 'LSF', 'DGS', 'other']).optional(),
        visualVerificationEnabled: z.boolean().optional(),
        videoRelayServiceEnabled: z.boolean().optional(),
        captioningPreference: z.enum(['auto', 'manual', 'none']).optional(),
        vibrationAlerts: z.boolean().optional(),
        lightAlerts: z.boolean().optional(),
      }).optional(),
    });
    
    const data = schema.parse(req.body);
    
    if (!data.userId && !data.email && !data.username) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, email, or username',
      });
    }
    
    const result = await deafAuthService.authenticate(data);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('DeafAuth authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication',
    });
  }
});

/**
 * @route POST /api/v1/paseto/deafauth/challenge/visual
 * @desc Create a visual authentication challenge
 * @access Public
 */
router.post('/deafauth/challenge/visual', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      type: z.enum(['pattern', 'gesture', 'color_sequence', 'symbol_match']),
    });
    
    const data = schema.parse(req.body);
    
    const result = await deafAuthService.createVisualChallenge(data.type, data.userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Error creating visual challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating challenge',
    });
  }
});

/**
 * @route POST /api/v1/paseto/deafauth/challenge/verify
 * @desc Verify a visual challenge response
 * @access Public
 */
router.post('/deafauth/challenge/verify', async (req: Request, res: Response) => {
  try {
    const { challengeId, response } = req.body;
    
    if (!challengeId || response === undefined) {
      return res.status(400).json({
        success: false,
        error: 'challengeId and response are required',
      });
    }
    
    const result = await deafAuthService.verifyVisualChallenge(challengeId, response);
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying challenge',
    });
  }
});

/**
 * @route GET /api/v1/paseto/deafauth/profile/:userId
 * @desc Get DeafAuth user profile
 * @access Public
 */
router.get('/deafauth/profile/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }
    
    const profile = await deafAuthService.getProfile(userId);
    
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting profile',
    });
  }
});

/**
 * @route PATCH /api/v1/paseto/deafauth/profile/:userId
 * @desc Update DeafAuth user profile
 * @access Public
 */
router.patch('/deafauth/profile/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }
    
    const result = await deafAuthService.updateProfile(userId, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile',
    });
  }
});

/**
 * @route POST /api/v1/paseto/deafauth/verify-token
 * @desc Verify a DeafAuth token
 * @access Public
 */
router.post('/deafauth/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }
    
    const result = await deafAuthService.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying DeafAuth token:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying token',
    });
  }
});

// ============================================
// PinkSync Endpoints
// ============================================

/**
 * @route POST /api/v1/paseto/pinksync/session
 * @desc Initialize a PinkSync session
 * @access Public
 */
router.post('/pinksync/session', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      deviceId: z.string(),
      platform: z.string(),
      metadata: z.record(z.any()).optional(),
    });
    
    const data = schema.parse(req.body);
    
    const result = await pinkSyncService.initializeSession(
      data.userId,
      data.deviceId,
      data.platform,
      data.metadata
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Error initializing PinkSync session:', error);
    res.status(500).json({
      success: false,
      error: 'Server error initializing session',
    });
  }
});

/**
 * @route POST /api/v1/paseto/pinksync/sync/start
 * @desc Start a sync operation
 * @access Public
 */
router.post('/pinksync/sync/start', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      sessionId: z.string(),
      type: z.enum(['push', 'pull', 'merge']),
      dataType: z.string(),
    });
    
    const data = schema.parse(req.body);
    
    const result = await pinkSyncService.startSync(data.sessionId, data.type, data.dataType);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Error starting sync:', error);
    res.status(500).json({
      success: false,
      error: 'Server error starting sync',
    });
  }
});

/**
 * @route POST /api/v1/paseto/pinksync/sync/process
 * @desc Process sync data
 * @access Public
 */
router.post('/pinksync/sync/process', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      sessionId: z.string(),
      operationId: z.string(),
      dataType: z.string(),
      version: z.number(),
      data: z.any(),
      checksum: z.string(),
      encryptedFields: z.array(z.string()).optional(),
    });
    
    const parsedData = schema.parse(req.body);
    const existingData = req.body.existingData;
    
    // Create packet with timestamp
    const packet: any = {
      ...parsedData,
      timestamp: new Date(),
    };
    
    const result = await pinkSyncService.processSync(
      packet,
      existingData
    );
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Error processing sync:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing sync',
    });
  }
});

/**
 * @route POST /api/v1/paseto/pinksync/conflict/resolve
 * @desc Resolve a sync conflict
 * @access Public
 */
router.post('/pinksync/conflict/resolve', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      operationId: z.string(),
      conflictId: z.string(),
      resolution: z.enum(['local', 'remote', 'merged']),
      mergedValue: z.any().optional(),
    });
    
    const data = schema.parse(req.body);
    
    const result = await pinkSyncService.resolveConflict(
      data.operationId,
      data.conflictId,
      data.resolution,
      data.mergedValue
    );
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Error resolving conflict:', error);
    res.status(500).json({
      success: false,
      error: 'Server error resolving conflict',
    });
  }
});

/**
 * @route GET /api/v1/paseto/pinksync/session/:sessionId/status
 * @desc Get sync session status
 * @access Public
 */
router.get('/pinksync/session/:sessionId/status', async (req: Request, res: Response) => {
  try {
    const result = await pinkSyncService.getSyncStatus(req.params.sessionId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting status',
    });
  }
});

/**
 * @route DELETE /api/v1/paseto/pinksync/session/:sessionId
 * @desc End a PinkSync session
 * @access Public
 */
router.delete('/pinksync/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const result = await pinkSyncService.endSession(req.params.sessionId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json({ success: true, message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Server error ending session',
    });
  }
});

/**
 * @route POST /api/v1/paseto/pinksync/verify-token
 * @desc Verify a PinkSync token
 * @access Public
 */
router.post('/pinksync/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }
    
    const result = await pinkSyncService.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying PinkSync token:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying token',
    });
  }
});

// ============================================
// Fibonorse Endpoints
// ============================================

/**
 * @route POST /api/v1/paseto/fibonorse/authenticate
 * @desc Authenticate with Fibonorse
 * @access Public
 */
router.post('/fibonorse/authenticate', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      method: z.enum(['rune', 'fibonacci', 'oath']),
      authData: z.any(),
    });
    
    const data = schema.parse(req.body);
    
    const result = await fibonorseService.authenticate(data.userId, data.method, data.authData);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Fibonorse authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication',
    });
  }
});

/**
 * @route POST /api/v1/paseto/fibonorse/challenge/rune
 * @desc Create a rune challenge
 * @access Public
 */
router.post('/fibonorse/challenge/rune', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    const result = await fibonorseService.createRuneChallenge(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error creating rune challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating challenge',
    });
  }
});

/**
 * @route POST /api/v1/paseto/fibonorse/challenge/fibonacci
 * @desc Create a Fibonacci challenge
 * @access Public
 */
router.post('/fibonorse/challenge/fibonacci', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    const result = await fibonorseService.createFibonacciChallenge(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error creating Fibonacci challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating challenge',
    });
  }
});

/**
 * @route POST /api/v1/paseto/fibonorse/oath
 * @desc Create a verification oath
 * @access Public
 */
router.post('/fibonorse/oath', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      oathType: z.enum(['identity', 'intent', 'truthfulness', 'commitment']),
      statement: z.string().min(10),
    });
    
    const data = schema.parse(req.body);
    
    const result = await fibonorseService.createOath(data.userId, data.oathType, data.statement);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('Error creating oath:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating oath',
    });
  }
});

/**
 * @route POST /api/v1/paseto/fibonorse/ascend
 * @desc Attempt to ascend to a higher realm
 * @access Public
 */
router.post('/fibonorse/ascend', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }
    
    const result = await fibonorseService.ascend(userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error during ascension:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during ascension',
    });
  }
});

/**
 * @route POST /api/v1/paseto/fibonorse/rune/bind
 * @desc Bind a rune to user identity
 * @access Public
 */
router.post('/fibonorse/rune/bind', async (req: Request, res: Response) => {
  try {
    const { userId, rune } = req.body;
    
    if (!userId || !rune) {
      return res.status(400).json({
        success: false,
        error: 'userId and rune are required',
      });
    }
    
    const result = await fibonorseService.bindRune(userId, rune);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error binding rune:', error);
    res.status(500).json({
      success: false,
      error: 'Server error binding rune',
    });
  }
});

/**
 * @route GET /api/v1/paseto/fibonorse/runes
 * @desc Get available runes
 * @access Public
 */
router.get('/fibonorse/runes', (req: Request, res: Response) => {
  const runes = fibonorseService.getAvailableRunes();
  res.json({
    success: true,
    runes,
  });
});

/**
 * @route GET /api/v1/paseto/fibonorse/profile/:userId
 * @desc Get Fibonorse trust profile
 * @access Public
 */
router.get('/fibonorse/profile/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }
    
    const profile = await fibonorseService.getProfile(userId);
    
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error getting Fibonorse profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting profile',
    });
  }
});

/**
 * @route POST /api/v1/paseto/fibonorse/verify-token
 * @desc Verify a Fibonorse token
 * @access Public
 */
router.post('/fibonorse/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }
    
    const result = await fibonorseService.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying Fibonorse token:', error);
    res.status(500).json({
      success: false,
      error: 'Server error verifying token',
    });
  }
});

export default router;
