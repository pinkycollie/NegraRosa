import { Router, Request, Response } from 'express';
import { pinkSyncService } from '../../services/PinkSyncService';

const router = Router();

/**
 * PinkSync API Routes
 * Offline/Online synchronization for MBTQ ecosystem
 */

// ==================== Device Management ====================

/**
 * @route POST /api/v1/pinksync/device
 * @desc Register a device for sync
 */
router.post('/device', async (req: Request, res: Response) => {
  try {
    const { userId, deviceName, deviceType, accessibilityFeatures } = req.body;

    if (!userId || !deviceName || !deviceType) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, deviceName, and deviceType required' 
      });
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

    res.status(201).json({ 
      success: true, 
      deviceId: result.deviceId,
      message: 'Device registered for PinkSync'
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/pinksync/devices/:userId
 * @desc Get all devices for a user
 */
router.get('/devices/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const devices = pinkSyncService.getUserDevices(userId);
  res.json({ success: true, devices });
});

// ==================== Sync Operations ====================

/**
 * @route POST /api/v1/pinksync/operation
 * @desc Queue a sync operation
 */
router.post('/operation', async (req: Request, res: Response) => {
  try {
    const { deviceId, type, entity, entityId, data } = req.body;

    if (!deviceId || !type || !entity || !entityId) {
      return res.status(400).json({ 
        success: false, 
        error: 'deviceId, type, entity, and entityId required' 
      });
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

    res.json({ 
      success: true, 
      operationId: result.operationId,
      message: 'Operation queued for sync'
    });
  } catch (error) {
    console.error('Queue operation error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/pinksync/sync/:deviceId
 * @desc Sync a device
 */
router.post('/sync/:deviceId', async (req: Request, res: Response) => {
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
 * @route GET /api/v1/pinksync/pending/:deviceId
 * @desc Get pending changes for a device
 */
router.get('/pending/:deviceId', async (req: Request, res: Response) => {
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
 * @route GET /api/v1/pinksync/remote/:deviceId
 * @desc Get remote changes since last sync
 */
router.get('/remote/:deviceId', async (req: Request, res: Response) => {
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

// ==================== Offline Storage ====================

/**
 * @route POST /api/v1/pinksync/offline
 * @desc Store data offline
 */
router.post('/offline', async (req: Request, res: Response) => {
  try {
    const { deviceId, key, data } = req.body;

    if (!deviceId || !key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Device ID and key required' 
      });
    }

    const result = await pinkSyncService.storeOffline(deviceId, key, data);
    res.json({ success: result.success, error: result.error });
  } catch (error) {
    console.error('Store offline error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route GET /api/v1/pinksync/offline/:deviceId/:key
 * @desc Get offline data
 */
router.get('/offline/:deviceId/:key', async (req: Request, res: Response) => {
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

// ==================== Accessibility Sync ====================

/**
 * @route POST /api/v1/pinksync/accessibility
 * @desc Sync accessibility preferences across devices
 */
router.post('/accessibility', async (req: Request, res: Response) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId || !preferences) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and preferences required' 
      });
    }

    const result = await pinkSyncService.syncAccessibilityPreferences(
      parseInt(userId),
      preferences
    );

    res.json({ 
      success: result.success, 
      error: result.error,
      message: result.success ? 'Accessibility preferences synced to all devices' : undefined
    });
  } catch (error) {
    console.error('Accessibility sync error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== Attestation Sync ====================

/**
 * @route POST /api/v1/pinksync/attestation
 * @desc Sync attestation data across devices
 */
router.post('/attestation', async (req: Request, res: Response) => {
  try {
    const { userId, attestation } = req.body;

    if (!userId || !attestation) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and attestation required' 
      });
    }

    const result = await pinkSyncService.syncAttestation(parseInt(userId), attestation);
    res.json({ 
      success: result.success, 
      error: result.error,
      message: result.success ? 'Attestation synced' : undefined
    });
  } catch (error) {
    console.error('Attestation sync error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== Conflict Resolution ====================

/**
 * @route POST /api/v1/pinksync/conflict/resolve
 * @desc Resolve a sync conflict
 */
router.post('/conflict/resolve', async (req: Request, res: Response) => {
  try {
    const { operationId, resolution, mergedData } = req.body;

    if (!operationId || !resolution) {
      return res.status(400).json({ 
        success: false, 
        error: 'Operation ID and resolution required' 
      });
    }

    const result = await pinkSyncService.resolveConflict(operationId, resolution, mergedData);
    res.json({ 
      success: result.success, 
      error: result.error,
      message: result.success ? 'Conflict resolved' : undefined
    });
  } catch (error) {
    console.error('Conflict resolution error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== Status ====================

/**
 * @route GET /api/v1/pinksync/status/:deviceId
 * @desc Get sync status for a device
 */
router.get('/status/:deviceId', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const status = pinkSyncService.getSyncStatus(deviceId);

  if (!status) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }

  res.json({ success: true, status });
});

/**
 * @route GET /api/v1/pinksync/status
 * @desc Get PinkSync service status
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = pinkSyncService.getStatus();
  res.json({ 
    success: true, 
    status,
    ecosystem: {
      service: 'PinkSync',
      version: '1.0.0',
      offlineSupport: true,
      conflictResolution: true
    }
  });
});

export default router;
