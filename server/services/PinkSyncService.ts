import * as crypto from 'crypto';
import { storage } from '../storage';

/**
 * PinkSync Service - Offline/Online Synchronization
 * 
 * Enables seamless data synchronization for DeafAUTH users and MBTQ ecosystem:
 * - Offline-first data storage
 * - Conflict resolution
 * - Cross-device synchronization
 * - Attestation and verification state sync
 * - Accessibility preferences sync
 */

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: unknown;
  timestamp: Date;
  deviceId: string;
  userId: number;
  synced: boolean;
  conflictResolved?: boolean;
  checksum: string;
}

export interface SyncState {
  deviceId: string;
  userId: number;
  lastSyncTimestamp: Date;
  pendingOperations: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'conflict';
  offlineData: Map<string, unknown>;
}

export interface ConflictResolution {
  operationId: string;
  localData: unknown;
  remoteData: unknown;
  resolvedData: unknown;
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  resolvedAt: Date;
}

export interface DeviceRegistration {
  deviceId: string;
  userId: number;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'wearable';
  lastSeen: Date;
  syncEnabled: boolean;
  accessibilityFeatures: string[];
}

/**
 * PinkSync Service - Offline/Online synchronization for MBTQ ecosystem
 */
export class PinkSyncService {
  private syncStates: Map<string, SyncState> = new Map();
  private pendingOperations: Map<string, SyncOperation[]> = new Map();
  private registeredDevices: Map<string, DeviceRegistration> = new Map();
  private conflictHistory: ConflictResolution[] = [];

  constructor() {
    console.log('PinkSync Service initialized - Offline/Online synchronization ready');
    
    // Periodic sync check
    setInterval(() => this.processPendingSyncs(), 30000);
  }

  /**
   * Register a device for synchronization
   */
  async registerDevice(
    userId: number,
    deviceName: string,
    deviceType: DeviceRegistration['deviceType'],
    accessibilityFeatures?: string[]
  ): Promise<{
    success: boolean;
    deviceId?: string;
    error?: string;
  }> {
    try {
      const deviceId = crypto.randomBytes(16).toString('hex');
      
      const registration: DeviceRegistration = {
        deviceId,
        userId,
        deviceName,
        deviceType,
        lastSeen: new Date(),
        syncEnabled: true,
        accessibilityFeatures: accessibilityFeatures || []
      };

      this.registeredDevices.set(deviceId, registration);

      // Initialize sync state for this device
      this.syncStates.set(deviceId, {
        deviceId,
        userId,
        lastSyncTimestamp: new Date(),
        pendingOperations: 0,
        syncStatus: 'idle',
        offlineData: new Map()
      });

      return { success: true, deviceId };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Device registration error:', error);
      return { success: false, error: err.message || 'Registration failed' };
    }
  }

  /**
   * Queue an operation for synchronization
   */
  async queueOperation(
    deviceId: string,
    type: SyncOperation['type'],
    entity: string,
    entityId: string,
    data: unknown
  ): Promise<{
    success: boolean;
    operationId?: string;
    error?: string;
  }> {
    const device = this.registeredDevices.get(deviceId);
    if (!device) {
      return { success: false, error: 'Device not registered' };
    }

    try {
      const operationId = crypto.randomBytes(16).toString('hex');
      const checksum = this.calculateChecksum(data);

      const operation: SyncOperation = {
        id: operationId,
        type,
        entity,
        entityId,
        data,
        timestamp: new Date(),
        deviceId,
        userId: device.userId,
        synced: false,
        checksum
      };

      // Add to pending operations
      const deviceOps = this.pendingOperations.get(deviceId) || [];
      deviceOps.push(operation);
      this.pendingOperations.set(deviceId, deviceOps);

      // Update sync state
      const state = this.syncStates.get(deviceId);
      if (state) {
        state.pendingOperations = deviceOps.length;
      }

      return { success: true, operationId };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Queue operation error:', error);
      return { success: false, error: err.message || 'Failed to queue operation' };
    }
  }

  /**
   * Sync data between device and server
   */
  async syncDevice(deviceId: string): Promise<{
    success: boolean;
    syncedOperations: number;
    conflicts: number;
    error?: string;
  }> {
    const device = this.registeredDevices.get(deviceId);
    if (!device) {
      return { success: false, syncedOperations: 0, conflicts: 0, error: 'Device not registered' };
    }

    const state = this.syncStates.get(deviceId);
    if (!state) {
      return { success: false, syncedOperations: 0, conflicts: 0, error: 'Sync state not found' };
    }

    try {
      state.syncStatus = 'syncing';

      const operations = this.pendingOperations.get(deviceId) || [];
      let syncedCount = 0;
      let conflictCount = 0;

      for (const operation of operations) {
        if (operation.synced) continue;

        // Check for conflicts
        const hasConflict = await this.detectConflict(operation);
        
        if (hasConflict) {
          conflictCount++;
          state.syncStatus = 'conflict';
          
          // Attempt auto-resolution
          const resolved = await this.autoResolveConflict(operation);
          if (!resolved) {
            continue; // Skip if can't auto-resolve
          }
        }

        // Apply operation to storage
        await this.applyOperation(operation);
        operation.synced = true;
        syncedCount++;
      }

      // Remove synced operations
      const unsynced = operations.filter(op => !op.synced);
      this.pendingOperations.set(deviceId, unsynced);

      state.lastSyncTimestamp = new Date();
      state.pendingOperations = unsynced.length;
      state.syncStatus = conflictCount > 0 ? 'conflict' : 'idle';

      // Update device last seen
      device.lastSeen = new Date();

      return {
        success: true,
        syncedOperations: syncedCount,
        conflicts: conflictCount
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      state.syncStatus = 'error';
      console.error('Sync error:', error);
      return {
        success: false,
        syncedOperations: 0,
        conflicts: 0,
        error: err.message || 'Sync failed'
      };
    }
  }

  /**
   * Get pending changes for a device
   */
  async getPendingChanges(deviceId: string): Promise<{
    success: boolean;
    operations?: SyncOperation[];
    error?: string;
  }> {
    const device = this.registeredDevices.get(deviceId);
    if (!device) {
      return { success: false, error: 'Device not registered' };
    }

    const operations = this.pendingOperations.get(deviceId) || [];
    return { success: true, operations };
  }

  /**
   * Get remote changes since last sync
   */
  async getRemoteChanges(deviceId: string, since?: Date): Promise<{
    success: boolean;
    changes?: SyncOperation[];
    error?: string;
  }> {
    const device = this.registeredDevices.get(deviceId);
    if (!device) {
      return { success: false, error: 'Device not registered' };
    }

    const state = this.syncStates.get(deviceId);
    const sinceDate = since || state?.lastSyncTimestamp || new Date(0);

    // Collect changes from other devices for this user
    const changes: SyncOperation[] = [];

    for (const [otherId, operations] of this.pendingOperations) {
      if (otherId === deviceId) continue;

      const otherDevice = this.registeredDevices.get(otherId);
      if (otherDevice?.userId !== device.userId) continue;

      for (const op of operations) {
        if (op.synced && op.timestamp > sinceDate) {
          changes.push(op);
        }
      }
    }

    return { success: true, changes };
  }

  /**
   * Store data offline for later sync
   */
  async storeOffline(
    deviceId: string,
    key: string,
    data: unknown
  ): Promise<{ success: boolean; error?: string }> {
    const state = this.syncStates.get(deviceId);
    if (!state) {
      return { success: false, error: 'Device not registered' };
    }

    state.offlineData.set(key, data);
    return { success: true };
  }

  /**
   * Retrieve offline data
   */
  async getOfflineData(
    deviceId: string,
    key: string
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const state = this.syncStates.get(deviceId);
    if (!state) {
      return { success: false, error: 'Device not registered' };
    }

    const data = state.offlineData.get(key);
    return { success: true, data };
  }

  /**
   * Sync accessibility preferences across devices
   */
  async syncAccessibilityPreferences(
    userId: number,
    preferences: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find all devices for this user
      const userDevices: DeviceRegistration[] = [];
      for (const device of this.registeredDevices.values()) {
        if (device.userId === userId) {
          userDevices.push(device);
        }
      }

      // Queue preference update for all devices
      for (const device of userDevices) {
        await this.queueOperation(
          device.deviceId,
          'update',
          'accessibility_preferences',
          userId.toString(),
          preferences
        );
      }

      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Accessibility sync error:', error);
      return { success: false, error: err.message || 'Sync failed' };
    }
  }

  /**
   * Sync attestation data
   */
  async syncAttestation(
    userId: number,
    attestation: {
      type: string;
      data: unknown;
      signature: string;
      timestamp: Date;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find all devices for this user
      for (const device of this.registeredDevices.values()) {
        if (device.userId === userId && device.syncEnabled) {
          await this.queueOperation(
            device.deviceId,
            'create',
            'attestation',
            crypto.randomBytes(8).toString('hex'),
            attestation
          );
        }
      }

      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Attestation sync error:', error);
      return { success: false, error: err.message || 'Sync failed' };
    }
  }

  /**
   * Resolve conflict manually
   */
  async resolveConflict(
    operationId: string,
    resolution: 'local_wins' | 'remote_wins' | 'merge',
    mergedData?: unknown
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the operation
      for (const operations of this.pendingOperations.values()) {
        const operation = operations.find(op => op.id === operationId);
        if (operation) {
          // Apply resolution
          if (resolution === 'local_wins') {
            await this.applyOperation(operation);
          } else if (resolution === 'merge' && mergedData) {
            operation.data = mergedData;
            await this.applyOperation(operation);
          }
          // For 'remote_wins', we just mark as resolved without applying

          operation.synced = true;
          operation.conflictResolved = true;

          // Record resolution history
          this.conflictHistory.push({
            operationId,
            localData: operation.data,
            remoteData: null, // Would be fetched from remote
            resolvedData: resolution === 'merge' ? mergedData : operation.data,
            strategy: resolution,
            resolvedAt: new Date()
          });

          return { success: true };
        }
      }

      return { success: false, error: 'Operation not found' };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Conflict resolution error:', error);
      return { success: false, error: err.message || 'Resolution failed' };
    }
  }

  /**
   * Get sync status for a device
   */
  getSyncStatus(deviceId: string): SyncState | null {
    return this.syncStates.get(deviceId) || null;
  }

  /**
   * Get all registered devices for a user
   */
  getUserDevices(userId: number): DeviceRegistration[] {
    const devices: DeviceRegistration[] = [];
    for (const device of this.registeredDevices.values()) {
      if (device.userId === userId) {
        devices.push(device);
      }
    }
    return devices;
  }

  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(data: unknown): string {
    const json = JSON.stringify(data);
    return crypto.createHash('sha256').update(json).digest('hex').substring(0, 16);
  }

  /**
   * Detect conflicts between operations
   */
  private async detectConflict(operation: SyncOperation): Promise<boolean> {
    // Check if same entity was modified on different devices
    for (const [deviceId, operations] of this.pendingOperations) {
      if (deviceId === operation.deviceId) continue;

      for (const otherOp of operations) {
        if (
          otherOp.entity === operation.entity &&
          otherOp.entityId === operation.entityId &&
          otherOp.synced &&
          otherOp.timestamp > operation.timestamp
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Attempt automatic conflict resolution
   */
  private async autoResolveConflict(operation: SyncOperation): Promise<boolean> {
    // Simple strategy: last write wins
    // More sophisticated strategies could be implemented
    console.log(`Auto-resolving conflict for operation ${operation.id}`);
    return true;
  }

  /**
   * Apply operation to storage
   */
  private async applyOperation(operation: SyncOperation): Promise<void> {
    // This would integrate with the actual storage layer
    console.log(`Applying ${operation.type} operation for ${operation.entity}:${operation.entityId}`);
    
    // In a real implementation, this would call the appropriate storage methods
    switch (operation.type) {
      case 'create':
        // await storage.create(operation.entity, operation.data);
        break;
      case 'update':
        // await storage.update(operation.entity, operation.entityId, operation.data);
        break;
      case 'delete':
        // await storage.delete(operation.entity, operation.entityId);
        break;
    }
  }

  /**
   * Process pending syncs for all devices
   */
  private async processPendingSyncs(): Promise<void> {
    for (const deviceId of this.registeredDevices.keys()) {
      const state = this.syncStates.get(deviceId);
      if (state && state.pendingOperations > 0 && state.syncStatus === 'idle') {
        // Trigger sync for devices with pending operations
        await this.syncDevice(deviceId);
      }
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    registeredDevices: number;
    activeStates: number;
    totalPendingOperations: number;
    conflictHistory: number;
  } {
    let totalPending = 0;
    for (const operations of this.pendingOperations.values()) {
      totalPending += operations.filter(op => !op.synced).length;
    }

    return {
      registeredDevices: this.registeredDevices.size,
      activeStates: this.syncStates.size,
      totalPendingOperations: totalPending,
      conflictHistory: this.conflictHistory.length
    };
  }
}

// Export singleton instance
export const pinkSyncService = new PinkSyncService();
