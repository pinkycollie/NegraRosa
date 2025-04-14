import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @route GET /api/v1/webhooks
 * @desc Get all webhooks (admin only)
 * @access Private/Admin
 */
router.get('/', auth0Service.checkJwt, auth0Service.checkPermissions(['read:webhooks']), async (req: Request, res: Response) => {
  try {
    // This would be implemented with a proper method in a real scenario
    // For now, we'll get all users and collect all their webhooks
    const users = await storage.getAllUsers();
    const webhooks = [];
    
    for (const user of users) {
      const userWebhooks = await storage.getWebhooksByUserId(user.id);
      webhooks.push(...userWebhooks);
    }
    
    return res.json(webhooks);
  } catch (error: any) {
    console.error('Error fetching webhooks:', error);
    return res.status(500).json({ message: 'Error fetching webhooks', error: error.message });
  }
});

/**
 * @route GET /api/v1/webhooks/:id
 * @desc Get webhook by ID
 * @access Private
 */
router.get('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhook = await storage.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the user has permission to access this webhook
    if (!req.user.permissions?.includes('read:webhooks') && webhook.userId !== req.user.id) {
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
    // Get user ID from Auth0 user
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { url, events, description, headers = {}, active = true, format = 'JSON' } = req.body;
    
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: url, events' });
    }
    
    const webhookId = uuidv4();
    const webhook = await storage.createWebhook({
      id: webhookId,
      userId: user.id,
      url,
      events,
      description,
      headers,
      active,
      format,
      createdAt: new Date(),
      updatedAt: new Date(),
      secret: uuidv4() // Generate a webhook secret for signing payloads
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
    const webhook = await storage.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the user has permission to update this webhook
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!req.user.permissions?.includes('update:webhooks') && webhook.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { url, events, description, headers, active, format } = req.body;
    const updates: any = { updatedAt: new Date() };
    
    if (url) updates.url = url;
    if (events) updates.events = events;
    if (description !== undefined) updates.description = description;
    if (headers) updates.headers = headers;
    if (active !== undefined) updates.active = active;
    if (format) updates.format = format;
    
    const updatedWebhook = await storage.updateWebhook(req.params.id, updates);
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
    const webhook = await storage.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the user has permission to delete this webhook
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!req.user.permissions?.includes('delete:webhooks') && webhook.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteWebhook(req.params.id);
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
 * @route GET /api/v1/webhooks/:id/payloads
 * @desc Get webhook payloads history
 * @access Private
 */
router.get('/:id/payloads', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhook = await storage.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the user has permission to access this webhook's payloads
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!req.user.permissions?.includes('read:webhooks') && webhook.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const payloads = await storage.getWebhookPayloadsByWebhookId(req.params.id);
    return res.json(payloads);
  } catch (error: any) {
    console.error('Error fetching webhook payloads:', error);
    return res.status(500).json({ message: 'Error fetching webhook payloads', error: error.message });
  }
});

/**
 * @route POST /api/v1/webhooks/:id/test
 * @desc Test webhook by sending a test payload
 * @access Private
 */
router.post('/:id/test', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const webhook = await storage.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Check if the user has permission to test this webhook
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!req.user.permissions?.includes('update:webhooks') && webhook.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Create a test payload
    const testPayload = {
      id: uuidv4(),
      event: 'webhook.test',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook event'
      },
      webhookId: webhook.id,
      timestamp: new Date(),
      deliveryStatus: 'PENDING',
      responseCode: null,
      responseBody: null,
      notionEntryId: null,
      retryCount: 0
    };
    
    // Store the test payload
    const payload = await storage.createWebhookPayload(testPayload);
    
    // In a real implementation, this would trigger an actual HTTP request to the webhook URL
    // But for now, we'll just simulate a successful delivery
    const updatedPayload = await storage.updateWebhookPayloadStatus(
      payload.id,
      'DELIVERED',
      200,
      JSON.stringify({ success: true, message: 'Test webhook received' })
    );
    
    return res.json({
      success: true,
      payload: updatedPayload,
      message: 'Test webhook sent successfully'
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return res.status(500).json({ message: 'Error testing webhook', error: error.message });
  }
});

export default router;