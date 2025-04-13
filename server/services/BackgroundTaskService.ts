import { storage } from '../storage';
import { webhookService } from './WebhookService';
import { webhookDataService } from './WebhookDataService';
import fs from 'fs';
import path from 'path';

/**
 * Background task scheduler for webhook data processing
 */
export class BackgroundTaskService {
  private isRunning: boolean = false;
  private tasks: Map<string, NodeJS.Timeout> = new Map();
  private processingInterval: number = 60000; // Default: 1 minute
  private exportInterval: number = 3600000; // Default: 1 hour
  private retryLimit: number = 3;
  private exportDir: string = path.join(process.cwd(), 'exports');
  
  constructor(options?: {
    processingInterval?: number;
    exportInterval?: number;
    retryLimit?: number;
    exportDir?: string;
  }) {
    if (options?.processingInterval) {
      this.processingInterval = options.processingInterval;
    }
    
    if (options?.exportInterval) {
      this.exportInterval = options.exportInterval;
    }
    
    if (options?.retryLimit) {
      this.retryLimit = options.retryLimit;
    }
    
    if (options?.exportDir) {
      this.exportDir = options.exportDir;
    }
    
    // Create export directory if it doesn't exist
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }
  
  /**
   * Start background tasks
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Background tasks are already running.');
      return;
    }
    
    console.log('Starting background tasks...');
    
    // Start webhook processing task
    const processingTaskId = 'webhook-processing';
    const processingTask = setInterval(() => this.processWebhookQueue(), this.processingInterval);
    this.tasks.set(processingTaskId, processingTask);
    
    // Start data export task
    const exportTaskId = 'webhook-export';
    const exportTask = setInterval(() => this.exportWebhookData(), this.exportInterval);
    this.tasks.set(exportTaskId, exportTask);
    
    // Start retry failed webhooks task
    const retryTaskId = 'webhook-retry';
    const retryTask = setInterval(() => this.retryFailedWebhooks(), this.processingInterval * 5);
    this.tasks.set(retryTaskId, retryTask);
    
    // Start analytics task
    const analyticsTaskId = 'webhook-analytics';
    const analyticsTask = setInterval(() => this.generateAnalyticsReport(), this.exportInterval * 24);
    this.tasks.set(analyticsTaskId, analyticsTask);
    
    this.isRunning = true;
    console.log('Background tasks started.');
  }
  
  /**
   * Stop background tasks
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log('Background tasks are not running.');
      return;
    }
    
    console.log('Stopping background tasks...');
    
    for (const [taskId, task] of this.tasks.entries()) {
      clearInterval(task);
      this.tasks.delete(taskId);
      console.log(`Task ${taskId} stopped.`);
    }
    
    this.isRunning = false;
    console.log('All background tasks stopped.');
  }
  
  /**
   * Process the webhook queue
   */
  private async processWebhookQueue(): Promise<void> {
    try {
      console.log('Processing webhook queue...');
      
      // Get pending webhook payloads
      const pendingPayloads = await storage.getWebhookPayloadsByStatus('PENDING');
      
      if (pendingPayloads.length === 0) {
        console.log('No pending webhooks to process.');
        return;
      }
      
      console.log(`Found ${pendingPayloads.length} pending webhooks to process.`);
      
      // Process each payload
      for (const payload of pendingPayloads) {
        try {
          console.log(`Processing webhook payload ${payload.id}...`);
          
          // Get the webhook
          const webhook = await storage.getWebhook(payload.webhookId);
          if (!webhook) {
            console.log(`Webhook ${payload.webhookId} not found. Skipping payload ${payload.id}.`);
            await storage.updateWebhookPayloadStatus(
              payload.id,
              'ERROR',
              404,
              `Webhook ${payload.webhookId} not found`
            );
            continue;
          }
          
          // Check if webhook is active
          if (!webhook.active) {
            console.log(`Webhook ${payload.webhookId} is inactive. Skipping payload ${payload.id}.`);
            await storage.updateWebhookPayloadStatus(
              payload.id,
              'SKIPPED',
              null,
              'Webhook is inactive'
            );
            continue;
          }
          
          // Process the webhook
          await webhookService.processWebhook(payload.webhookId, payload.data);
          
          console.log(`Webhook payload ${payload.id} processed successfully.`);
        } catch (error) {
          console.error(`Error processing webhook payload ${payload.id}:`, error);
          
          // Update payload status
          await storage.updateWebhookPayloadStatus(
            payload.id,
            'ERROR',
            500,
            `Error processing webhook: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      console.error('Error processing webhook queue:', error);
    }
  }
  
  /**
   * Retry failed webhooks
   */
  private async retryFailedWebhooks(): Promise<void> {
    try {
      console.log('Retrying failed webhooks...');
      
      // Get failed webhook payloads
      const failedPayloads = await storage.getWebhookPayloadsByStatus('FAILED');
      
      if (failedPayloads.length === 0) {
        console.log('No failed webhooks to retry.');
        return;
      }
      
      console.log(`Found ${failedPayloads.length} failed webhooks to retry.`);
      
      // Retry each payload
      for (const payload of failedPayloads) {
        try {
          console.log(`Retrying webhook payload ${payload.id}...`);
          
          // Check retry count
          const retryCount = payload.retryCount || 0;
          if (retryCount >= this.retryLimit) {
            console.log(`Webhook payload ${payload.id} has reached retry limit (${this.retryLimit}). Skipping.`);
            await storage.updateWebhookPayloadStatus(
              payload.id,
              'FAILED_PERMANENT',
              null,
              `Retry limit reached (${this.retryLimit})`
            );
            continue;
          }
          
          // Update retry count
          await storage.updateWebhookPayloadRetryCount(payload.id, retryCount + 1);
          
          // Reprocess the webhook
          await webhookDataService.reprocessWebhookPayload(payload.id);
          
          console.log(`Webhook payload ${payload.id} retried successfully.`);
        } catch (error) {
          console.error(`Error retrying webhook payload ${payload.id}:`, error);
          
          // Update payload status
          await storage.updateWebhookPayloadStatus(
            payload.id,
            'FAILED',
            500,
            `Error retrying webhook: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      console.error('Error retrying failed webhooks:', error);
    }
  }
  
  /**
   * Export webhook data to CSV
   */
  private async exportWebhookData(): Promise<void> {
    try {
      console.log('Exporting webhook data...');
      
      // Get all webhooks
      const users = await storage.getAllUsers();
      const allWebhooks = [];
      
      for (const user of users) {
        const webhooks = await storage.getWebhooksByUserId(user.id);
        allWebhooks.push(...webhooks);
      }
      
      if (allWebhooks.length === 0) {
        console.log('No webhooks to export.');
        return;
      }
      
      console.log(`Found ${allWebhooks.length} webhooks to export.`);
      
      // Export webhooks
      const webhooksCsv = this.generateWebhooksCsv(allWebhooks);
      const webhooksFilename = `webhooks_${new Date().toISOString().replace(/:/g, '-')}.csv`;
      const webhooksPath = path.join(this.exportDir, webhooksFilename);
      
      fs.writeFileSync(webhooksPath, webhooksCsv);
      console.log(`Webhooks exported to ${webhooksPath}`);
      
      // Export payloads for each webhook
      for (const webhook of allWebhooks) {
        const payloads = await storage.getWebhookPayloadsByWebhookId(webhook.id);
        
        if (payloads.length === 0) {
          continue;
        }
        
        const payloadsCsv = this.generatePayloadsCsv(payloads);
        const payloadsFilename = `payloads_${webhook.id}_${new Date().toISOString().replace(/:/g, '-')}.csv`;
        const payloadsPath = path.join(this.exportDir, payloadsFilename);
        
        fs.writeFileSync(payloadsPath, payloadsCsv);
        console.log(`Payloads for webhook ${webhook.id} exported to ${payloadsPath}`);
      }
    } catch (error) {
      console.error('Error exporting webhook data:', error);
    }
  }
  
  /**
   * Generate analytics report
   */
  private async generateAnalyticsReport(): Promise<void> {
    try {
      console.log('Generating analytics report...');
      
      // Get analytics data
      const analytics = await webhookDataService.generateAnalytics();
      
      // Convert to JSON
      const analyticsJson = JSON.stringify(analytics, null, 2);
      
      // Write to file
      const analyticsFilename = `analytics_${new Date().toISOString().replace(/:/g, '-')}.json`;
      const analyticsPath = path.join(this.exportDir, analyticsFilename);
      
      fs.writeFileSync(analyticsPath, analyticsJson);
      console.log(`Analytics report exported to ${analyticsPath}`);
    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  }
  
  /**
   * Generate CSV for webhooks
   */
  private generateWebhooksCsv(webhooks: any[]): string {
    const header = 'id,name,url,event,userId,active,createdAt,updatedAt,lastTriggeredAt';
    const rows = webhooks.map(webhook => [
      webhook.id,
      this.escapeCsvValue(webhook.name),
      this.escapeCsvValue(webhook.url),
      this.escapeCsvValue(webhook.event),
      webhook.userId,
      webhook.active,
      webhook.createdAt,
      webhook.updatedAt,
      webhook.lastTriggeredAt || ''
    ].join(','));
    
    return [header, ...rows].join('\n');
  }
  
  /**
   * Generate CSV for payloads
   */
  private generatePayloadsCsv(payloads: any[]): string {
    const header = 'id,webhookId,event,timestamp,deliveryStatus,responseCode,responseBody,notionEntryId';
    const rows = payloads.map(payload => [
      payload.id,
      payload.webhookId,
      this.escapeCsvValue(payload.event),
      payload.timestamp,
      this.escapeCsvValue(payload.deliveryStatus),
      payload.responseCode || '',
      this.escapeCsvValue(payload.responseBody || ''),
      this.escapeCsvValue(payload.notionEntryId || '')
    ].join(','));
    
    return [header, ...rows].join('\n');
  }
  
  /**
   * Escape CSV value
   */
  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If the value contains a comma, double quote, or newline, wrap it in double quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Replace double quotes with two double quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }
  
  /**
   * Get status of background tasks
   */
  public getStatus(): {
    isRunning: boolean;
    tasks: string[];
  } {
    return {
      isRunning: this.isRunning,
      tasks: Array.from(this.tasks.keys())
    };
  }
}

export const backgroundTaskService = new BackgroundTaskService();