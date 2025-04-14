import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';
import { webhookService } from '../../services/WebhookService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @route GET /api/v1/webhooks
 * @desc Get all webhooks for the authenticated user
 * @access Private
 */
router.get('/', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all webhooks for the user
    const webhooks = await storage.getWebhooksByUserId(user.id);
    
    return res.json(webhooks);
  } catch (error: any) {
    console.error('Error fetching webhooks:', error);
    return res.status(500).json({ message: 'Error fetching webhooks', error: error.message });
  }
});

/**
 * @route GET /api/v1/webhooks/:id
 * @desc Get a webhook by ID
 * @access Private
 */
router.get('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhookId = req.params.id;
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the webhook
    const webhook = await storage.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the webhook belongs to the user or the user is an admin
    if (webhook.userId !== user.id && !req.user.permissions?.includes('read:webhooks')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(webhook);
  } catch (error: any) {
    console.error('Error fetching webhook:', error);
    return res.status(500).json({ message: 'Error fetching webhook', error: error.message });
  }
});

/**
 * @route POST /api/v1/webhooks
 * @desc Create a new webhook
 * @access Private
 */
router.post('/', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { name, url, event, active } = req.body;
    
    if (!name || !url || !event) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['name', 'url', 'event'] 
      });
    }
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    // Check available events
    const availableEvents = webhookService.getAvailableEvents();
    if (!availableEvents.includes(event)) {
      return res.status(400).json({ 
        message: 'Invalid event type',
        availableEvents 
      });
    }
    
    // Create the webhook
    const webhook = await storage.createWebhook({
      id: uuidv4(),
      name,
      url,
      userId: user.id,
      event,
      active: active !== undefined ? active : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastTriggeredAt: null,
      payload: {}
    });
    
    return res.status(201).json(webhook);
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    return res.status(500).json({ message: 'Error creating webhook', error: error.message });
  }
});

/**
 * @route PUT /api/v1/webhooks/:id
 * @desc Update a webhook
 * @access Private
 */
router.put('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhookId = req.params.id;
    const { name, url, event, active } = req.body;
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the webhook
    const webhook = await storage.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the webhook belongs to the user or the user is an admin
    if (webhook.userId !== user.id && !req.user.permissions?.includes('update:webhooks')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check URL format if provided
    if (url) {
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }
    }
    
    // Check event if provided
    if (event) {
      const availableEvents = webhookService.getAvailableEvents();
      if (!availableEvents.includes(event)) {
        return res.status(400).json({ 
          message: 'Invalid event type',
          availableEvents 
        });
      }
    }
    
    // Update the webhook
    const updates: any = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (url !== undefined) updates.url = url;
    if (event !== undefined) updates.event = event;
    if (active !== undefined) updates.active = active;
    
    const updatedWebhook = await storage.updateWebhook(webhookId, updates);
    
    return res.json(updatedWebhook);
  } catch (error: any) {
    console.error('Error updating webhook:', error);
    return res.status(500).json({ message: 'Error updating webhook', error: error.message });
  }
});

/**
 * @route DELETE /api/v1/webhooks/:id
 * @desc Delete a webhook
 * @access Private
 */
router.delete('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhookId = req.params.id;
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the webhook
    const webhook = await storage.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the webhook belongs to the user or the user is an admin
    if (webhook.userId !== user.id && !req.user.permissions?.includes('delete:webhooks')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete the webhook
    const success = await storage.deleteWebhook(webhookId);
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete webhook' });
    }
    
    return res.status(204).end();
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    return res.status(500).json({ message: 'Error deleting webhook', error: error.message });
  }
});

/**
 * @route GET /api/v1/webhooks/:id/deliveries
 * @desc Get webhook delivery history
 * @access Private
 */
router.get('/:id/deliveries', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhookId = req.params.id;
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the webhook
    const webhook = await storage.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the webhook belongs to the user or the user is an admin
    if (webhook.userId !== user.id && !req.user.permissions?.includes('read:webhook_deliveries')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get delivery history
    const deliveries = await storage.getWebhookDeliveriesByWebhookId(webhookId);
    
    return res.json(deliveries);
  } catch (error: any) {
    console.error('Error fetching webhook deliveries:', error);
    return res.status(500).json({ message: 'Error fetching webhook deliveries', error: error.message });
  }
});

/**
 * @route POST /api/v1/webhooks/:id/test
 * @desc Test a webhook
 * @access Private
 */
router.post('/:id/test', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhookId = req.params.id;
    const { payload } = req.body;
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the webhook
    const webhook = await storage.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the webhook belongs to the user or the user is an admin
    if (webhook.userId !== user.id && !req.user.permissions?.includes('test:webhooks')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Test the webhook
    const testResult = await webhookService.triggerWebhook(webhook, payload || {
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
      event: webhook.event,
      test: true
    });
    
    return res.json({
      success: testResult.success,
      deliveryId: testResult.deliveryId,
      message: testResult.success ? 'Webhook test was successful' : 'Webhook test failed',
      errors: testResult.errors
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return res.status(500).json({ message: 'Error testing webhook', error: error.message });
  }
});

/**
 * @route POST /api/v1/webhooks/import
 * @desc Import webhooks from CSV
 * @access Private
 */
router.post('/import', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData) {
      return res.status(400).json({ message: 'Missing CSV data' });
    }
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Process the CSV import
    const importResult = await webhookService.importWebhooksFromCSV(csvData, user.id);
    
    return res.json({
      success: importResult.success,
      imported: importResult.imported,
      errors: importResult.errors,
      webhooks: importResult.webhooks
    });
  } catch (error: any) {
    console.error('Error importing webhooks:', error);
    return res.status(500).json({ message: 'Error importing webhooks', error: error.message });
  }
});

/**
 * @route GET /api/v1/webhooks/export
 * @desc Export webhooks to CSV
 * @access Private
 */
router.get('/export', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all webhooks for the user
    const webhooks = await storage.getWebhooksByUserId(user.id);
    
    // Generate CSV
    const csv = webhookService.exportWebhooksToCSV(webhooks);
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=webhooks.csv');
    
    return res.send(csv);
  } catch (error: any) {
    console.error('Error exporting webhooks:', error);
    return res.status(500).json({ message: 'Error exporting webhooks', error: error.message });
  }
});

/**
 * @route POST /api/v1/webhooks/receive
 * @desc General webhook receiver endpoint for external services
 * @access Public
 */
router.post('/receive', async (req: Request, res: Response) => {
  try {
    console.log('Received external webhook:', JSON.stringify(req.body));
    
    // Get webhook source from headers or query parameters
    const source = req.headers['x-webhook-source'] || 
                  req.query.source || 
                  'unknown';
    
    // Get event type from headers, query, or body
    const eventType = req.headers['x-webhook-event'] || 
                     req.query.event || 
                     req.body.event || 
                     'webhook.received';
    
    // Generate a unique ID for this webhook payload
    const payloadId = uuidv4();
    
    // Store the webhook payload
    const webhookPayload = await storage.createWebhookPayload({
      id: payloadId,
      webhookId: `external-${source}`,
      event: eventType.toString(),
      payload: {
        headers: req.headers,
        query: req.query,
        body: req.body,
        receivedAt: new Date().toISOString()
      },
      status: 'RECEIVED',
      createdAt: new Date(),
      updatedAt: new Date(),
      processedAt: null,
      retryCount: 0,
      responseCode: null,
      responseBody: null,
      notionEntryId: null
    });
    
    // Process the webhook asynchronously
    setImmediate(async () => {
      try {
        // Call webhook service to process this event
        const result = await webhookService.processWebhook(source.toString(), 
                                                         eventType.toString(), 
                                                         req.body);
        
        // Update webhook payload status
        await storage.updateWebhookPayloadStatus(
          payloadId,
          result.success ? 'PROCESSED' : 'FAILED',
          result.status || 200,
          result.message || 'Webhook processed'
        );
      } catch (error) {
        console.error('Error processing external webhook asynchronously:', error);
        
        // Update webhook payload with error
        await storage.updateWebhookPayloadStatus(
          payloadId,
          'FAILED',
          500,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    });
    
    // Acknowledge receipt of the webhook
    return res.status(200).json({
      success: true,
      message: 'Webhook received and queued for processing',
      payloadId: webhookPayload.id
    });
  } catch (error: any) {
    console.error('Error handling external webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Error handling webhook',
      error: error.message
    });
  }
});

export default router;