import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Webhook, WebhookPayload } from '@shared/schema';
import { storage } from '../storage';

/**
 * Service for interacting with Xano API for webhook management
 * and PinkSync integration.
 */
class XanoService {
  private apiBaseUrl: string | null;
  private apiKey: string | null;
  
  constructor() {
    this.apiBaseUrl = process.env.XANO_API_BASE_URL || null;
    this.apiKey = process.env.XANO_API_KEY || null;
    
    if (this.apiBaseUrl && this.apiKey) {
      console.log('Xano service initialized');
    } else {
      console.log('Xano service not configured. Missing: ' + 
        (!this.apiBaseUrl ? 'XANO_API_BASE_URL' : '') + 
        (!this.apiKey ? ((!this.apiBaseUrl ? ', ' : '') + 'XANO_API_KEY') : ''));
    }
  }
  
  /**
   * Tests the connection to Xano API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.apiBaseUrl || !this.apiKey) {
        return { 
          success: false, 
          message: 'Xano API not configured. Please set XANO_API_BASE_URL and XANO_API_KEY environment variables.' 
        };
      }
      
      // Make a simple ping request to Xano API
      const url = this.apiBaseUrl?.endsWith('/') 
        ? `${this.apiBaseUrl}ping`
        : `${this.apiBaseUrl}/ping`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return { 
        success: true, 
        message: 'Successfully connected to Xano API' 
      };
    } catch (error) {
      console.error('Error testing Xano connection:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return { 
        success: false, 
        message: `Failed to connect to Xano API: ${errorMessage}` 
      };
    }
  }
  
  /**
   * Registers a new webhook endpoint in Xano
   */
  async registerWebhookEndpoint(
    endpoint: string, 
    description: string = 'NegraRosa webhook endpoint'
  ): Promise<{ success: boolean; message: string; webhookId?: string }> {
    try {
      if (!this.apiBaseUrl || !this.apiKey) {
        return { 
          success: false, 
          message: 'Xano API not configured. Please set XANO_API_BASE_URL and XANO_API_KEY environment variables.' 
        };
      }
      
      // Register webhook endpoint in Xano
      const url = this.apiBaseUrl?.endsWith('/') 
        ? `${this.apiBaseUrl}webhooks/register`
        : `${this.apiBaseUrl}/webhooks/register`;
      
      const response = await axios.post(
        url, 
        {
          endpoint,
          description
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { 
        success: true, 
        message: 'Webhook endpoint registered successfully in Xano', 
        webhookId: response.data.webhookId || uuidv4()
      };
    } catch (error) {
      console.error('Error registering webhook in Xano:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return { 
        success: false, 
        message: `Failed to register webhook in Xano: ${errorMessage}` 
      };
    }
  }
  
  /**
   * Sends a webhook payload to Xano
   */
  async sendWebhookToXano(
    webhook: Webhook, 
    payload: any
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.apiBaseUrl || !this.apiKey) {
        return { 
          success: false, 
          error: 'Xano API not configured. Please set XANO_API_BASE_URL and XANO_API_KEY environment variables.' 
        };
      }
      
      // Check if the webhook URL is for Xano
      if (!webhook.url.includes('xano') && !webhook.url.includes('internal://pinksync')) {
        // Save payload to database with note that this is a Xano notification
        const payloadId = uuidv4();
        await storage.createWebhookPayload({
          id: payloadId,
          webhookId: webhook.id,
          event: webhook.event,
          data: payload,
          deliveryStatus: 'REDIRECTED_TO_XANO'
        });
      }
      
      // Try multiple URL formats to find the right one for Xano
      const possiblePaths = [
        'api/webhooks/receive',
        'webhooks/receive',
        'webhook',
        'hooks',
        'pinksync/webhook'
      ];
      
      let lastError;
      
      // Try each possible URL format
      for (const path of possiblePaths) {
        try {
          const url = this.apiBaseUrl?.endsWith('/')
            ? `${this.apiBaseUrl}${path}`
            : `${this.apiBaseUrl}/${path}`;
            
          console.log(`Trying Xano webhook URL: ${url}`);
          
          const response = await axios.post(
            url, 
            {
              webhookId: webhook.id,
              event: webhook.event,
              payload
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          return { 
            success: true, 
            message: `Webhook payload sent successfully to Xano via ${path}`
          };
        } catch (err) {
          // Log but continue to try next URL format
          lastError = err;
          console.log(`Failed with ${path}: ${err.message}`);
        }
      }
      
      // If we reach here, all attempts failed
      throw lastError;
    } catch (error) {
      console.error('Error sending webhook to Xano:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const axiosError = error as AxiosError;
      
      // Save failed delivery to database
      try {
        const payloadId = uuidv4();
        await storage.createWebhookPayload({
          id: payloadId,
          webhookId: webhook.id,
          event: webhook.event,
          data: payload,
          deliveryStatus: 'FAILED',
          responseCode: axiosError.response?.status || 500,
          responseBody: JSON.stringify(axiosError.response?.data || errorMessage)
        });
      } catch (dbError) {
        console.error('Error saving failed webhook payload:', dbError);
      }
      
      return { 
        success: false, 
        error: `Failed to send webhook to Xano: ${errorMessage}` 
      };
    }
  }
  
  /**
   * Sends an event to PinkSync via Xano
   */
  async sendEventToPinkSync(
    event: string,
    data: any,
    userId: number = 1
  ): Promise<{ success: boolean; message?: string; error?: string; eventId?: string }> {
    try {
      if (!this.apiBaseUrl || !this.apiKey) {
        return { 
          success: false, 
          error: 'Xano API not configured. Please set XANO_API_BASE_URL and XANO_API_KEY environment variables.' 
        };
      }
      
      // Send event to PinkSync via Xano
      const url = this.apiBaseUrl?.endsWith('/') 
        ? `${this.apiBaseUrl}pinksync/events`
        : `${this.apiBaseUrl}/pinksync/events`;
        
      const response = await axios.post(
        url, 
        {
          event,
          data,
          userId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { 
        success: true, 
        message: 'Event sent successfully to PinkSync',
        eventId: response.data.eventId || uuidv4()
      };
    } catch (error: unknown) {
      console.error('Error sending event to PinkSync:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return { 
        success: false, 
        error: `Failed to send event to PinkSync: ${errorMessage}` 
      };
    }
  }
  
  /**
   * Syncs webhooks with PinkSync via Xano
   */
  async syncWithPinkSync(): Promise<{ success: boolean; message: string; syncedItems?: number }> {
    try {
      if (!this.apiBaseUrl || !this.apiKey) {
        return { 
          success: false, 
          message: 'Xano API not configured. Please set XANO_API_BASE_URL and XANO_API_KEY environment variables.' 
        };
      }
      
      // Fetch PinkSync webhooks from Xano
      const url = this.apiBaseUrl?.endsWith('/') 
        ? `${this.apiBaseUrl}pinksync/webhooks`
        : `${this.apiBaseUrl}/pinksync/webhooks`;
        
      const response = await axios.get(
        url, 
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const pinkSyncWebhooks = response.data.webhooks || [];
      let syncedCount = 0;
      
      // Sync PinkSync webhooks with our system
      for (const webhook of pinkSyncWebhooks) {
        // Check if webhook already exists
        const existingWebhooks = await storage.getWebhooksByUserId(webhook.userId || 1);
        const exists = existingWebhooks.some(w => 
          w.event === webhook.event && 
          w.url === webhook.url
        );
        
        if (!exists) {
          // Create webhook in our system
          await storage.createWebhook({
            id: webhook.id || uuidv4(),
            name: webhook.name || `PinkSync Webhook - ${webhook.event}`,
            url: webhook.url,
            event: webhook.event,
            userId: webhook.userId || 1,
            active: webhook.active !== false
          });
          syncedCount++;
        }
      }
      
      return {
        success: true,
        message: `Successfully synced ${syncedCount} webhooks with PinkSync`,
        syncedItems: syncedCount
      };
    } catch (error: unknown) {
      console.error('Error syncing with PinkSync:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return { 
        success: false, 
        message: `Failed to sync with PinkSync: ${errorMessage}` 
      };
    }
  }
}

export const xanoService = new XanoService();