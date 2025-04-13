import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { Client as NotionClient } from '@notionhq/client';
import { InsertWebhookPayload } from '@shared/schema';

export interface Webhook {
  id: string;
  userId: number;
  name: string;
  url: string;
  event: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date | null;
  payload?: any | null;
}

export interface WebhookPayload {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
}

export class WebhookService {
  private notion: NotionClient | null = null;
  private baseUrl: string;
  private notionDatabaseId: string | undefined;

  constructor(baseUrl?: string) {
    // Base URL for webhooks (defaults to localhost in dev)
    this.baseUrl = baseUrl || 'http://localhost:5000';
    
    // Initialize Notion client if API key is available
    this.initializeNotionClient();
    
    // Store Notion database ID
    this.notionDatabaseId = process.env.NOTION_DATABASE_ID;
  }

  private initializeNotionClient(): void {
    const notionApiKey = process.env.NOTION_API_KEY;
    if (notionApiKey) {
      this.notion = new NotionClient({ 
        auth: notionApiKey 
      });
      console.log('Notion client initialized');
    } else {
      console.log('Notion API key not found, Notion integration disabled');
    }
  }

  /**
   * Create a new webhook
   */
  public async createWebhook(userId: number, name: string, url: string, event: string): Promise<Webhook> {
    const webhookId = uuidv4();
    const webhook = {
      id: webhookId,
      userId,
      name,
      url,
      event,
      active: true
    };

    return await storage.createWebhook(webhook);
  }

  /**
   * Get a webhook by ID
   */
  public async getWebhook(id: string): Promise<Webhook | undefined> {
    return await storage.getWebhook(id);
  }

  /**
   * Get all webhooks for a user
   */
  public async getWebhooksByUserId(userId: number): Promise<Webhook[]> {
    return await storage.getWebhooksByUserId(userId);
  }

  /**
   * Update a webhook
   */
  public async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook | undefined> {
    return await storage.updateWebhook(id, updates);
  }

  /**
   * Delete a webhook
   */
  public async deleteWebhook(id: string): Promise<boolean> {
    return await storage.deleteWebhook(id);
  }

  /**
   * Process an incoming webhook
   */
  public async processWebhook(webhookId: string, payload: any): Promise<WebhookPayload> {
    const webhook = await this.getWebhook(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    if (!webhook.active) {
      throw new Error(`Webhook with ID ${webhookId} is inactive`);
    }

    // Create webhook payload entry
    const webhookPayload: WebhookPayload = {
      id: uuidv4(),
      webhookId,
      event: webhook.event,
      data: payload,
      timestamp: new Date(),
      deliveryStatus: 'PENDING'
    };

    // Store the payload in the database
    const savedPayload = await storage.createWebhookPayload(webhookPayload);

    try {
      // Send the webhook to the destination URL
      const response = await axios.post(webhook.url, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-ID': webhookId,
          'X-Webhook-Signature': this.generateSignature(webhookPayload)
        },
        timeout: 10000 // 10 second timeout
      });

      // Update the webhook payload status
      await storage.updateWebhookPayloadStatus(
        savedPayload.id,
        'DELIVERED',
        response.status,
        JSON.stringify(response.data)
      );

      // Update the webhook last triggered time
      await this.updateWebhook(webhookId, {
        lastTriggeredAt: new Date(),
        payload: webhookPayload.data
      });

      // Post to Notion if enabled
      if (this.notion && this.notionDatabaseId) {
        await this.postToNotion(webhook, webhookPayload);
      }

      return {
        ...webhookPayload,
        deliveryStatus: 'DELIVERED'
      };
    } catch (error) {
      // Log the error
      console.error(`Error sending webhook ${webhookId}:`, error);

      // Update the webhook payload status
      await storage.updateWebhookPayloadStatus(
        savedPayload.id,
        'FAILED',
        error.response?.status || 0,
        error.message
      );

      return {
        ...webhookPayload,
        deliveryStatus: 'FAILED',
        responseCode: error.response?.status || 0,
        responseBody: error.message
      };
    }
  }

  /**
   * Post webhook data to Notion
   */
  private async postToNotion(webhook: Webhook, payload: WebhookPayload): Promise<void> {
    if (!this.notion || !this.notionDatabaseId) {
      console.log('Notion integration not configured, skipping');
      return;
    }

    try {
      const response = await this.notion.pages.create({
        parent: { database_id: this.notionDatabaseId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `${webhook.name} - ${payload.event}`
                }
              }
            ]
          },
          Event: {
            rich_text: [
              {
                text: {
                  content: payload.event
                }
              }
            ]
          },
          Status: {
            select: {
              name: 'Processed'
            }
          },
          Webhook: {
            rich_text: [
              {
                text: {
                  content: webhook.id
                }
              }
            ]
          },
          Timestamp: {
            date: {
              start: payload.timestamp.toISOString()
            }
          },
          URL: {
            url: webhook.url
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [
                {
                  text: {
                    content: 'Payload Data'
                  }
                }
              ]
            }
          },
          {
            object: 'block',
            type: 'code',
            code: {
              rich_text: [
                {
                  text: {
                    content: JSON.stringify(payload.data, null, 2)
                  }
                }
              ],
              language: 'json'
            }
          }
        ]
      });

      // Update payload with Notion entry ID
      await storage.updateWebhookPayloadNotionId(payload.id, response.id);
      console.log(`Posted webhook ${webhook.id} to Notion as page ${response.id}`);
    } catch (error) {
      console.error('Error posting to Notion:', error);
    }
  }

  /**
   * Generate a signature for webhook payload verification
   */
  private generateSignature(payload: WebhookPayload): string {
    // In a real app, you would use a crypto library to generate HMAC signatures
    // For this prototype, we're using a simple approach
    const timestamp = new Date().getTime().toString();
    const payloadStr = JSON.stringify(payload);
    return `${timestamp}.${Buffer.from(payloadStr).toString('base64')}`;
  }

  /**
   * Generate a test webhook payload for a specific event
   */
  public generateTestPayload(event: string, customData?: any): any {
    const defaultData = {
      timestamp: new Date().toISOString(),
      source: 'NegraRosa Security Framework',
      environment: process.env.NODE_ENV || 'development',
      testMode: true
    };

    // Add event-specific test data
    let eventData = {};
    switch (event) {
      case 'user.verification.complete':
        eventData = {
          userId: 1,
          verificationId: Math.floor(Math.random() * 1000),
          verificationType: 'ID_DOCUMENT',
          status: 'VERIFIED',
          timestamp: new Date().toISOString()
        };
        break;
      case 'transaction.risk.assessment':
        eventData = {
          transactionId: Math.floor(Math.random() * 1000),
          userId: 1,
          amount: 250.00,
          riskScore: Math.random() * 100,
          allowed: Math.random() > 0.3,
          restrictions: {
            maxAmount: 500,
            requiresAdditionalVerification: Math.random() > 0.5
          }
        };
        break;
      case 'claim.submitted':
        eventData = {
          claimId: Math.floor(Math.random() * 1000),
          userId: 1,
          amount: 150.00,
          description: 'Test claim for webhook',
          status: 'PENDING',
          timestamp: new Date().toISOString()
        };
        break;
      case 'why.submission.received':
        eventData = {
          submissionId: Math.floor(Math.random() * 1000),
          userId: 1,
          triggerType: 'TRANSACTION_DECLINED',
          submissionMethod: 'FORM',
          content: 'This is a test WHY submission for webhook testing',
          timestamp: new Date().toISOString()
        };
        break;
      default:
        eventData = {
          message: `Test payload for ${event}`,
          note: 'This is a generic test payload'
        };
    }

    return {
      event,
      ...defaultData,
      data: customData || eventData
    };
  }

  /**
   * Simulate a webhook trigger for testing purposes
   */
  public async simulateWebhookTrigger(webhookId: string, customPayload?: any): Promise<WebhookPayload> {
    const webhook = await this.getWebhook(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    // Generate test payload based on the webhook event
    const payload = customPayload || this.generateTestPayload(webhook.event);

    // Process the webhook with test payload
    return await this.processWebhook(webhookId, payload);
  }

  /**
   * Test Notion connection
   */
  public async testNotionConnection(): Promise<any> {
    if (!this.notion) {
      return { success: false, message: 'Notion client not initialized' };
    }

    if (!this.notionDatabaseId) {
      return { success: false, message: 'Notion database ID not configured' };
    }

    try {
      // Try to retrieve the database to test the connection
      const database = await this.notion.databases.retrieve({
        database_id: this.notionDatabaseId
      });

      return {
        success: true,
        message: 'Successfully connected to Notion',
        database: {
          id: database.id,
          title: database.title,
          properties: Object.keys(database.properties)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error connecting to Notion: ${error.message}`,
        error: error.code || error.message
      };
    }
  }
}

// Export singleton instance
export const webhookService = new WebhookService();