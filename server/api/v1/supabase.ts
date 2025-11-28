import { Router, Request, Response } from 'express';
import { supabaseAuthService } from '../../services/SupabaseAuthService';
import { deafAuthService } from '../../services/DeafAuthService';
import { pinkSyncService } from '../../services/PinkSyncService';
import { z } from 'zod';

const router = Router();

// ==================== Supabase Auth Routes ====================

/**
 * @route POST /api/v1/supabase/signup
 * @desc Register a new user with Supabase
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      metadata: z.record(z.unknown()).optional()
    });

    const { email, password, metadata } = schema.parse(req.body);
    const result = await supabaseAuthService.signUp(email, password, metadata);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({
      success: true,
      user: result.user,
      session: result.session
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input', details: error.errors });
    }
    console.error('Supabase signup error:', error);
    res.status(500).json({ success: false, error: 'Server error during signup' });
  }
});

/**
 * @route POST /api/v1/supabase/signin
 * @desc Sign in with Supabase
 */
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const result = await supabaseAuthService.signIn(email, password);

    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('Supabase signin error:', error);
    res.status(500).json({ success: false, error: 'Server error during signin' });
  }
});

/**
 * @route POST /api/v1/supabase/signout
 * @desc Sign out from Supabase
 */
router.post('/signout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const result = await supabaseAuthService.signOut(token);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Supabase signout error:', error);
    res.status(500).json({ success: false, error: 'Server error during signout' });
  }
});

/**
 * @route GET /api/v1/supabase/user
 * @desc Get current user info
 */
router.get('/user', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const result = await supabaseAuthService.getUser(token);

    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }

    res.json({ success: true, user: result.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/refresh
 * @desc Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const result = await supabaseAuthService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/oauth/:provider
 * @desc Start OAuth flow with a provider
 */
router.get('/oauth/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { userId, redirectUrl } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const authUrl = await supabaseAuthService.startOAuthFlow(
      parseInt(userId as string),
      provider,
      (redirectUrl as string) || `${req.protocol}://${req.get('host')}/api/v1/supabase/callback`
    );

    if (req.headers.accept?.includes('application/json')) {
      res.json({ success: true, authUrl });
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error('OAuth start error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/callback
 * @desc Handle OAuth callback
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ success: false, error: 'Missing code or state' });
    }

    const result = await supabaseAuthService.handleOAuthCallback(
      code as string,
      state as string
    );

    if (!result.success) {
      return res.redirect(`/auth-error?error=${encodeURIComponent(result.error || 'Unknown error')}`);
    }

    res.redirect('/dashboard?oauth=success');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/auth-error?error=server_error');
  }
});

/**
 * @route GET /api/v1/supabase/status
 * @desc Get Supabase service status
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: supabaseAuthService.getStatus()
  });
});

// ==================== DeafAUTH Routes ====================

/**
 * @route GET /api/v1/supabase/deafauth/methods
 * @desc Get available DeafAUTH methods
 */
router.get('/deafauth/methods', (_req: Request, res: Response) => {
  const methods = deafAuthService.getAvailableMethods();
  res.json({ success: true, methods });
});

/**
 * @route POST /api/v1/supabase/deafauth/session
 * @desc Initialize a DeafAUTH session
 */
router.post('/deafauth/session', async (req: Request, res: Response) => {
  try {
    const { userId, method, preferences } = req.body;

    if (!userId || !method) {
      return res.status(400).json({ success: false, error: 'User ID and method required' });
    }

    const result = await deafAuthService.initializeSession(
      parseInt(userId),
      method,
      preferences
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      sessionId: result.sessionId,
      challenge: result.challenge,
      visualGuidance: result.visualGuidance
    });
  } catch (error) {
    console.error('DeafAUTH session error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/deafauth/verify
 * @desc Verify DeafAUTH authentication
 */
router.post('/deafauth/verify', async (req: Request, res: Response) => {
  try {
    const { sessionId, response } = req.body;

    if (!sessionId || !response) {
      return res.status(400).json({ success: false, error: 'Session ID and response required' });
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
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/deafauth/pattern/setup
 * @desc Set up visual pattern for a user
 */
router.post('/deafauth/pattern/setup', async (req: Request, res: Response) => {
  try {
    const { userId, pattern, gridSize } = req.body;

    if (!userId || !pattern) {
      return res.status(400).json({ success: false, error: 'User ID and pattern required' });
    }

    const result = await deafAuthService.setupVisualPattern(
      parseInt(userId),
      pattern,
      gridSize
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Visual pattern configured' });
  } catch (error) {
    console.error('Pattern setup error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/deafauth/preferences/:userId
 * @desc Get accessibility preferences
 */
router.get('/deafauth/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const preferences = await deafAuthService.getAccessibilityPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route PUT /api/v1/supabase/deafauth/preferences/:userId
 * @desc Update accessibility preferences
 */
router.put('/deafauth/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await deafAuthService.updateAccessibilityPreferences(userId, req.body);
    res.json({ success: true, preferences: result.preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/deafauth/status
 * @desc Get DeafAUTH service status
 */
router.get('/deafauth/status', (_req: Request, res: Response) => {
  res.json({ success: true, status: deafAuthService.getStatus() });
});

// ==================== PinkSync Routes ====================

/**
 * @route POST /api/v1/supabase/pinksync/device
 * @desc Register a device for sync
 */
router.post('/pinksync/device', async (req: Request, res: Response) => {
  try {
    const { userId, deviceName, deviceType, accessibilityFeatures } = req.body;

    if (!userId || !deviceName || !deviceType) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await pinkSyncService.registerDevice(
      parseInt(userId),
      deviceName,
      deviceType,
      accessibilityFeatures
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, deviceId: result.deviceId });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/pinksync/operation
 * @desc Queue a sync operation
 */
router.post('/pinksync/operation', async (req: Request, res: Response) => {
  try {
    const { deviceId, type, entity, entityId, data } = req.body;

    if (!deviceId || !type || !entity || !entityId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await pinkSyncService.queueOperation(
      deviceId,
      type,
      entity,
      entityId,
      data
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, operationId: result.operationId });
  } catch (error) {
    console.error('Queue operation error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/pinksync/sync/:deviceId
 * @desc Sync a device
 */
router.post('/pinksync/sync/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const result = await pinkSyncService.syncDevice(deviceId);

    res.json({
      success: result.success,
      syncedOperations: result.syncedOperations,
      conflicts: result.conflicts,
      error: result.error
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/pinksync/pending/:deviceId
 * @desc Get pending changes
 */
router.get('/pinksync/pending/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const result = await pinkSyncService.getPendingChanges(deviceId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, operations: result.operations });
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/pinksync/remote/:deviceId
 * @desc Get remote changes since last sync
 */
router.get('/pinksync/remote/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { since } = req.query;

    const result = await pinkSyncService.getRemoteChanges(
      deviceId,
      since ? new Date(since as string) : undefined
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, changes: result.changes });
  } catch (error) {
    console.error('Get remote changes error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/pinksync/offline
 * @desc Store data offline
 */
router.post('/pinksync/offline', async (req: Request, res: Response) => {
  try {
    const { deviceId, key, data } = req.body;

    if (!deviceId || !key) {
      return res.status(400).json({ success: false, error: 'Device ID and key required' });
    }

    const result = await pinkSyncService.storeOffline(deviceId, key, data);
    res.json({ success: result.success, error: result.error });
  } catch (error) {
    console.error('Store offline error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/pinksync/offline/:deviceId/:key
 * @desc Get offline data
 */
router.get('/pinksync/offline/:deviceId/:key', async (req: Request, res: Response) => {
  try {
    const { deviceId, key } = req.params;
    const result = await pinkSyncService.getOfflineData(deviceId, key);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Get offline error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/pinksync/accessibility
 * @desc Sync accessibility preferences
 */
router.post('/pinksync/accessibility', async (req: Request, res: Response) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId || !preferences) {
      return res.status(400).json({ success: false, error: 'User ID and preferences required' });
    }

    const result = await pinkSyncService.syncAccessibilityPreferences(
      parseInt(userId),
      preferences
    );

    res.json({ success: result.success, error: result.error });
  } catch (error) {
    console.error('Accessibility sync error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/pinksync/attestation
 * @desc Sync attestation data
 */
router.post('/pinksync/attestation', async (req: Request, res: Response) => {
  try {
    const { userId, attestation } = req.body;

    if (!userId || !attestation) {
      return res.status(400).json({ success: false, error: 'User ID and attestation required' });
    }

    const result = await pinkSyncService.syncAttestation(parseInt(userId), attestation);
    res.json({ success: result.success, error: result.error });
  } catch (error) {
    console.error('Attestation sync error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/supabase/pinksync/conflict/resolve
 * @desc Resolve a sync conflict
 */
router.post('/pinksync/conflict/resolve', async (req: Request, res: Response) => {
  try {
    const { operationId, resolution, mergedData } = req.body;

    if (!operationId || !resolution) {
      return res.status(400).json({ success: false, error: 'Operation ID and resolution required' });
    }

    const result = await pinkSyncService.resolveConflict(operationId, resolution, mergedData);
    res.json({ success: result.success, error: result.error });
  } catch (error) {
    console.error('Conflict resolution error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/supabase/pinksync/status/:deviceId
 * @desc Get sync status for a device
 */
router.get('/pinksync/status/:deviceId', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const status = pinkSyncService.getSyncStatus(deviceId);

  if (!status) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }

  res.json({ success: true, status });
});

/**
 * @route GET /api/v1/supabase/pinksync/devices/:userId
 * @desc Get all devices for a user
 */
router.get('/pinksync/devices/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const devices = pinkSyncService.getUserDevices(userId);
  res.json({ success: true, devices });
});

/**
 * @route GET /api/v1/supabase/pinksync/status
 * @desc Get PinkSync service status
 */
router.get('/pinksync/status', (_req: Request, res: Response) => {
  res.json({ success: true, status: pinkSyncService.getStatus() });
});

export default router;
