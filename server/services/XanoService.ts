import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for interacting with Xano API
 */
export class XanoService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string | undefined;
  private apiKey: string | undefined;
  private initialized: boolean = false;

  constructor() {
    this.baseUrl = process.env.XANO_API_BASE_URL;
    this.apiKey = process.env.XANO_API_KEY;

    if (this.baseUrl && this.apiKey) {
      this.initialized = true;
      console.log('Xano service initialized');
    } else {
      console.log('Xano service not configured. Missing:', 
        !this.baseUrl ? 'XANO_API_BASE_URL' : '', 
        !this.apiKey ? 'XANO_API_KEY' : ''
      );
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  /**
   * Check if Xano service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Test connection to Xano API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.initialized) {
      return { 
        success: false, 
        message: 'Xano service not configured. Missing API key or base URL.' 
      };
    }

    try {
      // Try to access an endpoint that should be accessible with the API key
      // This might need to be adjusted based on your specific Xano setup
      await this.axiosInstance.get('/auth/status');
      
      return { 
        success: true, 
        message: 'Successfully connected to Xano API' 
      };
    } catch (error: any) {
      console.error('Error testing Xano connection:', error);
      return { 
        success: false, 
        message: `Failed to connect to Xano API: ${error.message || 'Unknown error'}` 
      };
    }
  }

  /**
   * Get records from a Xano collection
   */
  async getRecords<T>(collectionPath: string, params?: Record<string, any>): Promise<T[]> {
    if (!this.initialized) {
      throw new Error('Xano service not configured');
    }

    try {
      const response: AxiosResponse<T[]> = await this.axiosInstance.get(collectionPath, { params });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching records from ${collectionPath}:`, error);
      throw new Error(`Failed to fetch records: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a record in a Xano collection
   */
  async createRecord<T>(collectionPath: string, data: Record<string, any>): Promise<T> {
    if (!this.initialized) {
      throw new Error('Xano service not configured');
    }

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(collectionPath, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error creating record in ${collectionPath}:`, error);
      throw new Error(`Failed to create record: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a record in a Xano collection
   */
  async updateRecord<T>(collectionPath: string, recordId: string | number, data: Record<string, any>): Promise<T> {
    if (!this.initialized) {
      throw new Error('Xano service not configured');
    }

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(`${collectionPath}/${recordId}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating record ${recordId} in ${collectionPath}:`, error);
      throw new Error(`Failed to update record: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a record from a Xano collection
   */
  async deleteRecord(collectionPath: string, recordId: string | number): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Xano service not configured');
    }

    try {
      await this.axiosInstance.delete(`${collectionPath}/${recordId}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting record ${recordId} from ${collectionPath}:`, error);
      throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Send webhook data to Xano
   */
  async sendWebhookToXano(webhook: any, payload: any): Promise<{ success: boolean; xanoId?: string; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Xano service not configured' };
    }

    try {
      // Format the data to send to Xano
      const xanoPayload = {
        webhook_id: webhook.id,
        event: webhook.event,
        timestamp: new Date().toISOString(),
        data: payload
      };

      // Send to Xano webhooks endpoint (adjust path as needed for your Xano setup)
      const response = await this.axiosInstance.post('/webhooks/incoming', xanoPayload);
      
      // Store the data in our webhook payload system
      const payloadId = uuidv4();
      await storage.createWebhookPayload({
        id: payloadId,
        webhookId: webhook.id,
        event: webhook.event,
        data: payload,
        deliveryStatus: 'SUCCESS',
        timestamp: new Date(),
        responseCode: response.status,
        responseBody: JSON.stringify(response.data),
        notionEntryId: null,
        retryCount: 0
      });

      return { 
        success: true,
        xanoId: response.data.id?.toString() || undefined
      };
    } catch (error: any) {
      console.error('Error sending webhook to Xano:', error);
      
      // Store the failed attempt
      try {
        const payloadId = uuidv4();
        await storage.createWebhookPayload({
          id: payloadId,
          webhookId: webhook.id,
          event: webhook.event,
          data: payload,
          deliveryStatus: 'FAILED',
          timestamp: new Date(),
          responseCode: error.response?.status || null,
          responseBody: JSON.stringify(error.message || 'Unknown error'),
          notionEntryId: null,
          retryCount: 0
        });
      } catch (storageError) {
        console.error('Error storing failed webhook payload:', storageError);
      }

      return { 
        success: false, 
        error: `Failed to send webhook to Xano: ${error.message || 'Unknown error'}` 
      };
    }
  }

  /**
   * Register a webhook endpoint in Xano
   */
  async registerWebhookEndpoint(endpoint: string, description: string): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'Xano service not configured' };
    }

    try {
      // This endpoint path may need to be adjusted for your Xano setup
      const response = await this.axiosInstance.post('/webhooks/register', {
        endpoint,
        description
      });

      return { 
        success: true,
        id: response.data.id?.toString() || undefined
      };
    } catch (error: any) {
      console.error('Error registering webhook endpoint in Xano:', error);
      return { 
        success: false, 
        error: `Failed to register webhook endpoint: ${error.message || 'Unknown error'}` 
      };
    }
  }
}

export const xanoService = new XanoService();