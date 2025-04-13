import { Client as NotionClient } from '@notionhq/client';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';

// Types for webhook data
export interface Webhook {
  id: string;
  userId: number;
  name: string;
  url: string;
  event: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  payload?: any;
}

export interface WebhookPayload {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
}

export type InsertWebhook = Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>;

export class WebhookService {
  private notion: NotionClient | null = null;
  private webhooks: Map<string, Webhook> = new Map();
  private baseUrl: string;
  private notionDatabaseId: string | undefined;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initializeNotionClient();
  }

  private initializeNotionClient(): void {
    const notionApiKey = process.env.NOTION_API_KEY;
    this.notionDatabaseId = process.env.NOTION_DATABASE_ID;

    if (notionApiKey) {
      this.notion = new NotionClient({
        auth: notionApiKey,
      });
      console.log('Notion client initialized successfully');
    } else {
      console.warn('Notion API key not provided. Notion integration disabled.');
    }

    if (!this.notionDatabaseId) {
      console.warn('Notion database ID not provided. Data will not be synced to Notion.');
    }
  }

  /**
   * Create a new webhook
   */
  public async createWebhook(userId: number, name: string, event: string): Promise<Webhook> {
    const id = uuidv4();
    const url = `${this.baseUrl}/api/webhooks/${id}`;
    
    const webhook: Webhook = {
      id,
      userId,
      name,
      url,
      event,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.webhooks.set(id, webhook);
    return webhook;
  }

  /**
   * Get a webhook by ID
   */
  public getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Get all webhooks for a user
   */
  public getWebhooksByUserId(userId: number): Webhook[] {
    return Array.from(this.webhooks.values())
      .filter(webhook => webhook.userId === userId);
  }

  /**
   * Update a webhook
   */
  public updateWebhook(id: string, updates: Partial<Webhook>): Webhook | undefined {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;

    const updatedWebhook: Webhook = {
      ...webhook,
      ...updates,
      updatedAt: new Date(),
    };

    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }

  /**
   * Delete a webhook
   */
  public deleteWebhook(id: string): boolean {
    return this.webhooks.delete(id);
  }

  /**
   * Process an incoming webhook
   */
  public async processWebhook(id: string, payload: any): Promise<WebhookPayload> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error(`Webhook with ID ${id} not found`);
    }

    // Update the webhook with the last triggered time and payload
    this.updateWebhook(id, {
      lastTriggeredAt: new Date(),
      payload,
    });

    const webhookPayload: WebhookPayload = {
      id: uuidv4(),
      event: webhook.event,
      data: payload,
      timestamp: new Date(),
    };

    // Post to Notion if configured
    await this.postToNotion(webhook, webhookPayload);

    return webhookPayload;
  }

  /**
   * Post webhook data to Notion
   */
  private async postToNotion(webhook: Webhook, payload: WebhookPayload): Promise<void> {
    if (!this.notion || !this.notionDatabaseId) {
      console.log('Notion integration not configured. Skipping Notion update.');
      return;
    }

    try {
      // Get user information if available
      let username = 'Unknown';
      let email = 'Unknown';
      
      if (webhook.userId) {
        const user = await storage.getUser(webhook.userId);
        if (user) {
          username = user.username;
          email = user.email || 'No email provided';
        }
      }

      // Create a new page in the Notion database
      await this.notion.pages.create({
        parent: {
          database_id: this.notionDatabaseId,
        },
        properties: {
          'Name': {
            title: [
              {
                text: {
                  content: webhook.name,
                },
              },
            ],
          },
          'Event': {
            rich_text: [
              {
                text: {
                  content: webhook.event,
                },
              },
            ],
          },
          'User': {
            rich_text: [
              {
                text: {
                  content: `${username} (${email})`,
                },
              },
            ],
          },
          'Triggered': {
            date: {
              start: payload.timestamp.toISOString(),
            },
          },
          'Status': {
            select: {
              name: 'New',
            },
          },
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [
                {
                  text: {
                    content: 'Webhook Payload',
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: 'URL: ',
                  },
                  annotations: {
                    bold: true,
                  },
                },
                {
                  text: {
                    content: webhook.url,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'code',
            code: {
              rich_text: [
                {
                  text: {
                    content: JSON.stringify(payload.data, null, 2),
                  },
                },
              ],
              language: 'json',
            },
          },
        ],
      });

      console.log(`Successfully added webhook data to Notion database for webhook ${webhook.id}`);
    } catch (error) {
      console.error('Error posting to Notion:', error);
    }
  }

  /**
   * Generate a test webhook payload for a specific event
   */
  public generateTestPayload(event: string, customData?: any): any {
    const basePayload = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      event,
    };

    switch (event) {
      case 'verification.created':
        return {
          ...basePayload,
          data: customData || {
            userId: 1,
            verificationType: 'IDENTITY',
            status: 'PENDING',
            metadata: {
              documentType: 'PASSPORT',
              submissionMethod: 'SCAN',
            },
          },
        };
      
      case 'transaction.processed':
        return {
          ...basePayload,
          data: customData || {
            userId: 1,
            amount: 500.00,
            currency: 'USD',
            status: 'COMPLETED',
            riskScore: 0.15,
            metadata: {
              merchant: 'Example Store',
              category: 'Retail',
            },
          },
        };
      
      case 'why.submitted':
        return {
          ...basePayload,
          data: customData || {
            userId: 1,
            submissionId: uuidv4(),
            submissionType: 'TEXT',
            content: 'This is a test WHY submission for demonstration purposes.',
            status: 'PENDING',
          },
        };
      
      default:
        return {
          ...basePayload,
          data: customData || {
            message: 'Test webhook payload',
          },
        };
    }
  }

  /**
   * Simulate a webhook trigger for testing purposes
   */
  public async simulateWebhookTrigger(webhookId: string, customPayload?: any): Promise<WebhookPayload> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    const payload = customPayload || this.generateTestPayload(webhook.event);
    return await this.processWebhook(webhookId, payload);
  }
}

// Initialize the webhook service with the base URL
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
export const webhookService = new WebhookService(baseUrl);