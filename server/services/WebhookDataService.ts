import { storage } from '../storage';
import { webhookService } from './WebhookService';
import { WebhookPayload, Webhook } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for data validation, normalization, and processing of webhook data
 */
export class WebhookDataService {
  /**
   * Validate and normalize webhook data
   * This applies data validation rules and transforms data as needed
   */
  public async validateAndNormalizePayload(
    webhook: Webhook, 
    payload: any
  ): Promise<{ 
    valid: boolean; 
    errors: string[]; 
    normalizedData: any;
  }> {
    const errors: string[] = [];
    let normalizedData = { ...payload };
    
    try {
      // Apply different validation and normalization rules based on event type
      switch (webhook.event) {
        case 'user.verification.complete':
          return this.validateVerificationData(payload);
          
        case 'transaction.risk.assessment':
          return this.validateTransactionData(payload);
          
        case 'claim.submitted':
          return this.validateClaimData(payload);
          
        case 'why.submission.received':
          return this.validateWhySubmissionData(payload);
          
        default:
          // Apply generic validation for other event types
          if (!payload.timestamp) {
            normalizedData.timestamp = new Date().toISOString();
          }
          
          // Check if payload has required fields based on event context
          if (!payload.data) {
            errors.push('Payload must contain a data property');
          }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        normalizedData
      };
    } catch (error) {
      errors.push(`Error during validation: ${error instanceof Error ? error.message : String(error)}`);
      return {
        valid: false,
        errors,
        normalizedData
      };
    }
  }
  
  /**
   * Process an incoming webhook payload with validation and normalization
   */
  public async processWebhookPayload(
    webhookId: string,
    payload: any,
    options: {
      skipValidation?: boolean;
      test?: boolean;
    } = {}
  ): Promise<{ 
    success: boolean; 
    errors: string[]; 
    payloadId?: string;
    webhook?: Webhook;
    normalizedData?: any;
  }> {
    try {
      // Get webhook configuration
      const webhook = await storage.getWebhook(webhookId);
      if (!webhook) {
        return {
          success: false,
          errors: [`Webhook with ID ${webhookId} not found`]
        };
      }
      
      // Check if webhook is active
      if (!webhook.active) {
        return {
          success: false,
          errors: [`Webhook with ID ${webhookId} is inactive`]
        };
      }
      
      // Validate and normalize data
      let valid = true;
      let validationErrors: string[] = [];
      let normalizedData = payload;
      
      if (!options.skipValidation) {
        const validation = await this.validateAndNormalizePayload(webhook, payload);
        valid = validation.valid;
        validationErrors = validation.errors;
        normalizedData = validation.normalizedData;
      }
      
      if (!valid) {
        return {
          success: false,
          errors: validationErrors,
          webhook,
          normalizedData
        };
      }
      
      // Generate payload ID and create timestamp
      const payloadId = uuidv4();
      const timestamp = new Date();
      
      // Create webhook payload entry
      const webhookPayload = {
        id: payloadId,
        webhookId,
        event: webhook.event,
        data: normalizedData,
        timestamp,
        deliveryStatus: options.test ? 'TEST' : 'PENDING'
      };
      
      // Store the payload in the database
      await storage.createWebhookPayload(webhookPayload);
      
      // If this is a test, don't actually trigger the webhook
      if (options.test) {
        return {
          success: true,
          errors: [],
          payloadId,
          webhook,
          normalizedData
        };
      }
      
      // Process the webhook (send notification, update webhook status, post to Notion)
      await webhookService.processWebhook(webhookId, normalizedData);
      
      // Update the webhook last triggered time
      await storage.updateWebhook(webhookId, {
        lastTriggeredAt: timestamp,
        payload: normalizedData
      });
      
      return {
        success: true,
        errors: [],
        payloadId,
        webhook,
        normalizedData
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Error processing webhook payload: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
  
  /**
   * Reprocess a previously stored webhook payload
   */
  public async reprocessWebhookPayload(payloadId: string): Promise<{
    success: boolean;
    errors: string[];
    webhook?: Webhook;
  }> {
    try {
      // Get the stored payload
      const payloads = await storage.getWebhookPayloadsByIds([payloadId]);
      if (payloads.length === 0) {
        return {
          success: false,
          errors: [`Webhook payload with ID ${payloadId} not found`]
        };
      }
      
      const payload = payloads[0];
      
      // Get the webhook
      const webhook = await storage.getWebhook(payload.webhookId);
      if (!webhook) {
        return {
          success: false,
          errors: [`Webhook with ID ${payload.webhookId} not found`]
        };
      }
      
      // Check if webhook is active
      if (!webhook.active) {
        return {
          success: false,
          errors: [`Webhook with ID ${payload.webhookId} is inactive`]
        };
      }
      
      // Process the webhook with the stored payload data
      await webhookService.processWebhook(payload.webhookId, payload.data);
      
      // Update payload status
      await storage.updateWebhookPayloadStatus(
        payloadId,
        'REPROCESSED',
        null,
        `Manually reprocessed at ${new Date().toISOString()}`
      );
      
      return {
        success: true,
        errors: [],
        webhook
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Error reprocessing webhook payload: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Validate and normalize verification data
   */
  private validateVerificationData(payload: any): { 
    valid: boolean; 
    errors: string[]; 
    normalizedData: any;
  } {
    const errors: string[] = [];
    let normalizedData = { ...payload };
    
    // Validate required fields
    if (!payload.userId) {
      errors.push('Missing required field: userId');
    } else if (typeof payload.userId !== 'number') {
      // Convert string userId to number if possible
      if (!isNaN(Number(payload.userId))) {
        normalizedData.userId = Number(payload.userId);
      } else {
        errors.push('Invalid userId format: must be a number');
      }
    }
    
    if (!payload.verificationType) {
      errors.push('Missing required field: verificationType');
    }
    
    if (!payload.status) {
      errors.push('Missing required field: status');
    } else {
      // Normalize status to uppercase
      normalizedData.status = payload.status.toUpperCase();
    }
    
    // Add timestamp if missing
    if (!payload.timestamp) {
      normalizedData.timestamp = new Date().toISOString();
    }
    
    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }
  
  /**
   * Validate and normalize transaction data
   */
  private validateTransactionData(payload: any): { 
    valid: boolean; 
    errors: string[]; 
    normalizedData: any;
  } {
    const errors: string[] = [];
    let normalizedData = { ...payload };
    
    // Validate required fields
    if (!payload.transactionId) {
      errors.push('Missing required field: transactionId');
    }
    
    if (!payload.userId) {
      errors.push('Missing required field: userId');
    } else if (typeof payload.userId !== 'number') {
      // Convert string userId to number if possible
      if (!isNaN(Number(payload.userId))) {
        normalizedData.userId = Number(payload.userId);
      } else {
        errors.push('Invalid userId format: must be a number');
      }
    }
    
    if (payload.amount === undefined) {
      errors.push('Missing required field: amount');
    } else if (typeof payload.amount !== 'number') {
      // Convert string amount to number if possible
      if (!isNaN(Number(payload.amount))) {
        normalizedData.amount = Number(payload.amount);
      } else {
        errors.push('Invalid amount format: must be a number');
      }
    }
    
    // Add timestamp if missing
    if (!payload.timestamp) {
      normalizedData.timestamp = new Date().toISOString();
    }
    
    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }
  
  /**
   * Validate and normalize claim data
   */
  private validateClaimData(payload: any): { 
    valid: boolean; 
    errors: string[]; 
    normalizedData: any;
  } {
    const errors: string[] = [];
    let normalizedData = { ...payload };
    
    // Validate required fields
    if (!payload.claimId) {
      errors.push('Missing required field: claimId');
    }
    
    if (!payload.userId) {
      errors.push('Missing required field: userId');
    } else if (typeof payload.userId !== 'number') {
      // Convert string userId to number if possible
      if (!isNaN(Number(payload.userId))) {
        normalizedData.userId = Number(payload.userId);
      } else {
        errors.push('Invalid userId format: must be a number');
      }
    }
    
    if (payload.amount === undefined) {
      errors.push('Missing required field: amount');
    } else if (typeof payload.amount !== 'number') {
      // Convert string amount to number if possible
      if (!isNaN(Number(payload.amount))) {
        normalizedData.amount = Number(payload.amount);
      } else {
        errors.push('Invalid amount format: must be a number');
      }
    }
    
    if (!payload.description) {
      errors.push('Missing required field: description');
    }
    
    // Add timestamp if missing
    if (!payload.timestamp) {
      normalizedData.timestamp = new Date().toISOString();
    }
    
    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }
  
  /**
   * Validate and normalize WHY submission data
   */
  private validateWhySubmissionData(payload: any): { 
    valid: boolean; 
    errors: string[]; 
    normalizedData: any;
  } {
    const errors: string[] = [];
    let normalizedData = { ...payload };
    
    // Validate required fields
    if (!payload.userId) {
      errors.push('Missing required field: userId');
    } else if (typeof payload.userId !== 'number') {
      // Convert string userId to number if possible
      if (!isNaN(Number(payload.userId))) {
        normalizedData.userId = Number(payload.userId);
      } else {
        errors.push('Invalid userId format: must be a number');
      }
    }
    
    if (!payload.triggerType) {
      errors.push('Missing required field: triggerType');
    }
    
    if (!payload.submissionMethod) {
      errors.push('Missing required field: submissionMethod');
    } else {
      // Normalize submissionMethod to uppercase
      normalizedData.submissionMethod = payload.submissionMethod.toUpperCase();
    }
    
    if (!payload.content) {
      errors.push('Missing required field: content');
    }
    
    // Add timestamp if missing
    if (!payload.timestamp) {
      normalizedData.timestamp = new Date().toISOString();
    }
    
    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }
  
  /**
   * Generate standardized analytics data from webhook payloads
   */
  public async generateAnalytics(
    options: {
      startDate?: Date;
      endDate?: Date;
      userId?: number;
      event?: string;
    } = {}
  ): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    webhooksByEvent: Record<string, number>;
    payloadsByStatus: Record<string, number>;
    payloadsByDate: Record<string, number>;
    averagePayloadSize: number;
    successRate: number;
    topErrors: string[];
  }> {
    try {
      // Get all webhooks
      let webhooks: Webhook[] = [];
      if (options.userId) {
        webhooks = await storage.getWebhooksByUserId(options.userId);
      } else {
        // Get all webhooks
        const users = await storage.getAllUsers();
        for (const user of users) {
          const userWebhooks = await storage.getWebhooksByUserId(user.id);
          webhooks.push(...userWebhooks);
        }
      }
      
      // Filter by event if specified
      if (options.event) {
        webhooks = webhooks.filter(webhook => webhook.event === options.event);
      }
      
      // Count active webhooks
      const activeWebhooks = webhooks.filter(webhook => webhook.active).length;
      
      // Group webhooks by event
      const webhooksByEvent: Record<string, number> = {};
      webhooks.forEach(webhook => {
        webhooksByEvent[webhook.event] = (webhooksByEvent[webhook.event] || 0) + 1;
      });
      
      // Get all payloads
      let allPayloads: WebhookPayload[] = [];
      for (const webhook of webhooks) {
        const payloads = await storage.getWebhookPayloadsByWebhookId(webhook.id);
        allPayloads.push(...payloads);
      }
      
      // Filter payloads by date if specified
      if (options.startDate) {
        allPayloads = allPayloads.filter(payload => payload.timestamp >= options.startDate!);
      }
      
      if (options.endDate) {
        allPayloads = allPayloads.filter(payload => payload.timestamp <= options.endDate!);
      }
      
      // Group payloads by status
      const payloadsByStatus: Record<string, number> = {};
      allPayloads.forEach(payload => {
        payloadsByStatus[payload.deliveryStatus] = (payloadsByStatus[payload.deliveryStatus] || 0) + 1;
      });
      
      // Group payloads by date (daily)
      const payloadsByDate: Record<string, number> = {};
      allPayloads.forEach(payload => {
        const date = payload.timestamp.toISOString().split('T')[0];
        payloadsByDate[date] = (payloadsByDate[date] || 0) + 1;
      });
      
      // Calculate average payload size
      const totalSize = allPayloads.reduce((sum, payload) => {
        return sum + JSON.stringify(payload.data).length;
      }, 0);
      const averagePayloadSize = allPayloads.length > 0 ? totalSize / allPayloads.length : 0;
      
      // Calculate success rate
      const successfulPayloads = allPayloads.filter(payload => 
        payload.deliveryStatus === 'DELIVERED' || 
        payload.deliveryStatus === 'SUCCESS'
      ).length;
      const successRate = allPayloads.length > 0 ? (successfulPayloads / allPayloads.length) * 100 : 0;
      
      // Extract top errors
      const errorMessages: string[] = allPayloads
        .filter(payload => 
          payload.deliveryStatus === 'FAILED' || 
          payload.deliveryStatus === 'ERROR'
        )
        .map(payload => payload.responseBody || 'Unknown error')
        .filter(Boolean);
      
      // Count error occurrences
      const errorCounts: Record<string, number> = {};
      errorMessages.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
      
      // Get top 5 errors
      const topErrors = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([error]) => error);
      
      return {
        totalWebhooks: webhooks.length,
        activeWebhooks,
        webhooksByEvent,
        payloadsByStatus,
        payloadsByDate,
        averagePayloadSize,
        successRate,
        topErrors
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      return {
        totalWebhooks: 0,
        activeWebhooks: 0,
        webhooksByEvent: {},
        payloadsByStatus: {},
        payloadsByDate: {},
        averagePayloadSize: 0,
        successRate: 0,
        topErrors: [`Error generating analytics: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
}

export const webhookDataService = new WebhookDataService();