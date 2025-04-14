import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';
import { webhookService } from '../../services/WebhookService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * @route GET /api/v1/vanuatu/credentials/:userId
 * @desc Get all compliance credentials for a user
 * @access Private
 */
router.get('/credentials/:userId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if requesting user has access to this user's data
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (userId !== requestingUser.id && !req.user.permissions?.includes('read:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const credentials = await storage.getComplianceCredentialsByUserId(userId);
    return res.json(credentials);
  } catch (error: any) {
    console.error('Error fetching compliance credentials:', error);
    return res.status(500).json({ message: 'Error fetching compliance credentials', error: error.message });
  }
});

/**
 * @route POST /api/v1/vanuatu/credentials
 * @desc Create a new compliance credential
 * @access Private
 */
router.post('/credentials', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { jurisdictionCode, credentialType, metadata = {} } = req.body;
    
    if (!jurisdictionCode || !credentialType) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['jurisdictionCode', 'credentialType'] 
      });
    }
    
    // Get user from Auth0 ID
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const now = new Date();
    const credential = await storage.createComplianceCredential({
      userId: user.id,
      jurisdictionCode,
      credentialType,
      status: 'PENDING',
      metadata,
      createdAt: now,
      updatedAt: now,
      issuedAt: null,
      expiresAt: null,
      verificationHash: null,
      verifiableCredentialId: null
    });
    
    return res.status(201).json({
      credential,
      message: 'Compliance credential created successfully',
      status: 'PENDING_REVIEW'
    });
  } catch (error: any) {
    console.error('Error creating compliance credential:', error);
    return res.status(500).json({ message: 'Error creating compliance credential', error: error.message });
  }
});

/**
 * @route GET /api/v1/vanuatu/credentials/:id
 * @desc Get a specific compliance credential
 * @access Private
 */
router.get('/credentials/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid credential ID' });
    }
    
    const credential = await storage.getComplianceCredential(id);
    if (!credential) {
      return res.status(404).json({ message: 'Compliance credential not found' });
    }
    
    // Check if requesting user has access to this credential
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (credential.userId !== requestingUser.id && !req.user.permissions?.includes('read:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(credential);
  } catch (error: any) {
    console.error('Error fetching compliance credential:', error);
    return res.status(500).json({ message: 'Error fetching compliance credential', error: error.message });
  }
});

/**
 * @route GET /api/v1/vanuatu/entities/:credentialId
 * @desc Get entities associated with a credential
 * @access Private
 */
router.get('/entities/:credentialId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const credentialId = parseInt(req.params.credentialId);
    if (isNaN(credentialId)) {
      return res.status(400).json({ message: 'Invalid credential ID' });
    }
    
    // Get the credential to check ownership
    const credential = await storage.getComplianceCredential(credentialId);
    if (!credential) {
      return res.status(404).json({ message: 'Compliance credential not found' });
    }
    
    // Check if requesting user has access to this credential
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (credential.userId !== requestingUser.id && !req.user.permissions?.includes('read:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const entities = await storage.getVanuatuEntitiesByCredentialId(credentialId);
    return res.json(entities);
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    return res.status(500).json({ message: 'Error fetching entities', error: error.message });
  }
});

/**
 * @route POST /api/v1/vanuatu/entities
 * @desc Create a new Vanuatu entity
 * @access Private
 */
router.post('/entities', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { 
      credentialId, 
      entityType, 
      registrationNumber, 
      registeredName,
      registrationDate = null, 
      directors = [], 
      shareholders = [], 
      businessScope = null,
      registeredAddress = null,
      annualFilingDate = null,
      goodStandingStatus = true
    } = req.body;
    
    if (!credentialId || !entityType || !registrationNumber || !registeredName) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['credentialId', 'entityType', 'registrationNumber', 'registeredName'] 
      });
    }
    
    // Get the credential to check ownership
    const credential = await storage.getComplianceCredential(credentialId);
    if (!credential) {
      return res.status(404).json({ message: 'Compliance credential not found' });
    }
    
    // Check if requesting user has access to this credential
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (credential.userId !== requestingUser.id && !req.user.permissions?.includes('create:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const now = new Date();
    const entity = await storage.createVanuatuEntity({
      credentialId,
      entityType,
      registrationNumber,
      registeredName,
      registrationDate,
      directors,
      shareholders,
      businessScope,
      registeredAddress,
      annualFilingDate,
      goodStandingStatus,
      createdAt: now,
      updatedAt: now
    });
    
    return res.status(201).json({
      entity,
      message: 'Vanuatu entity created successfully'
    });
  } catch (error: any) {
    console.error('Error creating Vanuatu entity:', error);
    return res.status(500).json({ message: 'Error creating Vanuatu entity', error: error.message });
  }
});

/**
 * @route GET /api/v1/vanuatu/licenses/:entityId
 * @desc Get licenses associated with an entity
 * @access Private
 */
router.get('/licenses/:entityId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const entityId = parseInt(req.params.entityId);
    if (isNaN(entityId)) {
      return res.status(400).json({ message: 'Invalid entity ID' });
    }
    
    // Get the entity and credential to check ownership
    const entity = await storage.getVanuatuEntity(entityId);
    if (!entity) {
      return res.status(404).json({ message: 'Entity not found' });
    }
    
    const credential = await storage.getComplianceCredential(entity.credentialId);
    if (!credential) {
      return res.status(404).json({ message: 'Associated credential not found' });
    }
    
    // Check if requesting user has access to this entity
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (credential.userId !== requestingUser.id && !req.user.permissions?.includes('read:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const licenses = await storage.getVanuatuLicensesByEntityId(entityId);
    return res.json(licenses);
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    return res.status(500).json({ message: 'Error fetching licenses', error: error.message });
  }
});

/**
 * @route POST /api/v1/vanuatu/licenses
 * @desc Create a new Vanuatu license
 * @access Private
 */
router.post('/licenses', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const {
      credentialId,
      entityId = null,
      licenseType,
      licenseNumber,
      issuanceDate,
      expiryDate = null,
      activityScope = null,
      restrictions = null,
      renewalRequirements = null,
      annualFee = null,
      lastFeePaymentDate = null
    } = req.body;
    
    if (!credentialId || !licenseType || !licenseNumber || !issuanceDate) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['credentialId', 'licenseType', 'licenseNumber', 'issuanceDate'] 
      });
    }
    
    // Get the credential to check ownership
    const credential = await storage.getComplianceCredential(credentialId);
    if (!credential) {
      return res.status(404).json({ message: 'Compliance credential not found' });
    }
    
    // Check if requesting user has access to this credential
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (credential.userId !== requestingUser.id && !req.user.permissions?.includes('create:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Convert issuanceDate string to Date if needed
    const parsedIssuanceDate = typeof issuanceDate === 'string' 
      ? new Date(issuanceDate) 
      : issuanceDate;
    
    // Convert expiryDate string to Date if needed
    const parsedExpiryDate = expiryDate && typeof expiryDate === 'string'
      ? new Date(expiryDate)
      : expiryDate;
    
    const now = new Date();
    const license = await storage.createVanuatuLicense({
      credentialId,
      entityId,
      licenseType,
      licenseNumber,
      issuanceDate: parsedIssuanceDate,
      expiryDate: parsedExpiryDate,
      activityScope,
      restrictions,
      renewalRequirements,
      annualFee,
      lastFeePaymentDate,
      createdAt: now,
      updatedAt: now
    });
    
    return res.status(201).json({
      license,
      message: 'Vanuatu license created successfully'
    });
  } catch (error: any) {
    console.error('Error creating Vanuatu license:', error);
    return res.status(500).json({ message: 'Error creating Vanuatu license', error: error.message });
  }
});

/**
 * @route GET /api/v1/vanuatu/reports/:credentialId
 * @desc Get compliance reports for a credential
 * @access Private
 */
router.get('/reports/:credentialId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const credentialId = parseInt(req.params.credentialId);
    if (isNaN(credentialId)) {
      return res.status(400).json({ message: 'Invalid credential ID' });
    }
    
    // Get the credential to check ownership
    const credential = await storage.getComplianceCredential(credentialId);
    if (!credential) {
      return res.status(404).json({ message: 'Compliance credential not found' });
    }
    
    // Check if requesting user has access to this credential
    const requestingUser = await storage.getUserByExternalId(req.user.sub);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }
    
    if (credential.userId !== requestingUser.id && !req.user.permissions?.includes('read:vanuatu')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // In a real system, we would query by credentialId
    // For now, let's collect reports by entity and license
    const entities = await storage.getVanuatuEntitiesByCredentialId(credentialId);
    const entityReports = [];
    
    for (const entity of entities) {
      const reports = await storage.getComplianceReportsByEntityId(entity.id);
      entityReports.push(...reports);
    }
    
    const licenses = await storage.getVanuatuLicensesByCredentialId(credentialId);
    const licenseReports = [];
    
    for (const license of licenses) {
      const reports = await storage.getComplianceReportsByLicenseId(license.id);
      licenseReports.push(...reports);
    }
    
    // Combine and deduplicate reports
    const allReports = [...entityReports, ...licenseReports];
    const uniqueReports = Array.from(
      new Map(allReports.map(report => [report.id, report])).values()
    );
    
    return res.json(uniqueReports);
  } catch (error: any) {
    console.error('Error fetching compliance reports:', error);
    return res.status(500).json({ message: 'Error fetching compliance reports', error: error.message });
  }
});

/**
 * @route POST /api/v1/vanuatu/callback
 * @desc Callback endpoint for Vanuatu Compliance Service
 * @access Public
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('Received Vanuatu callback:', JSON.stringify(req.body));
    
    const { 
      event, 
      eventId, 
      entityId, 
      credentialId, 
      licenseId, 
      timestamp, 
      status, 
      data 
    } = req.body;
    
    if (!event || !eventId || !timestamp) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['event', 'eventId', 'timestamp'] 
      });
    }
    
    // Process the callback based on the event type
    let result;
    switch (event) {
      case 'credential_updated':
        if (!credentialId) {
          return res.status(400).json({ message: 'Missing credentialId for credential_updated event' });
        }
        
        const parsedCredentialId = parseInt(credentialId);
        if (isNaN(parsedCredentialId)) {
          return res.status(400).json({ message: 'Invalid credential ID format' });
        }
        
        const credential = await storage.getComplianceCredential(parsedCredentialId);
        if (!credential) {
          return res.status(404).json({ message: 'Credential not found' });
        }
        
        // Update the credential with the new data
        result = await storage.updateComplianceCredential(parsedCredentialId, {
          status: status || credential.status,
          ...data,
          updatedAt: new Date()
        });
        
        // Trigger any necessary webhook notifications
        await webhookService.processEvent('vanuatu.credential_updated', {
          credential: result,
          eventId,
          timestamp
        });
        
        break;
        
      case 'entity_updated':
        if (!entityId) {
          return res.status(400).json({ message: 'Missing entityId for entity_updated event' });
        }
        
        const parsedEntityId = parseInt(entityId);
        if (isNaN(parsedEntityId)) {
          return res.status(400).json({ message: 'Invalid entity ID format' });
        }
        
        const entity = await storage.getVanuatuEntity(parsedEntityId);
        if (!entity) {
          return res.status(404).json({ message: 'Entity not found' });
        }
        
        // Update the entity with the new data
        result = await storage.updateVanuatuEntity(parsedEntityId, {
          ...data,
          updatedAt: new Date()
        });
        
        // Trigger any necessary webhook notifications
        await webhookService.processEvent('vanuatu.entity_updated', {
          entity: result,
          eventId,
          timestamp
        });
        
        break;
        
      case 'license_updated':
        if (!licenseId) {
          return res.status(400).json({ message: 'Missing licenseId for license_updated event' });
        }
        
        const parsedLicenseId = parseInt(licenseId);
        if (isNaN(parsedLicenseId)) {
          return res.status(400).json({ message: 'Invalid license ID format' });
        }
        
        const license = await storage.getVanuatuLicense(parsedLicenseId);
        if (!license) {
          return res.status(404).json({ message: 'License not found' });
        }
        
        // Update the license with the new data
        result = await storage.updateVanuatuLicense(parsedLicenseId, {
          ...data,
          updatedAt: new Date()
        });
        
        // Trigger any necessary webhook notifications
        await webhookService.processEvent('vanuatu.license_updated', {
          license: result,
          eventId,
          timestamp
        });
        
        break;
        
      default:
        // For unsupported events, log and store for future processing
        console.log(`Received unsupported Vanuatu event type: ${event}`);
        
        // Store the event for later processing or auditing
        await storage.createWebhookPayload({
          id: uuidv4(),
          webhookId: 'vanuatu-callback',
          event: event,
          payload: req.body,
          status: 'RECEIVED',
          createdAt: new Date(),
          updatedAt: new Date(),
          processedAt: null,
          retryCount: 0,
          responseCode: null,
          responseBody: null,
          notionEntryId: null
        });
        
        result = { processed: true, event };
    }
    
    return res.status(200).json({
      success: true,
      message: `Processed Vanuatu callback for event: ${event}`,
      result
    });
  } catch (error: any) {
    console.error('Error processing Vanuatu callback:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error processing Vanuatu callback', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/v1/vanuatu/webhook
 * @desc Webhook endpoint for Vanuatu Compliance Service
 * @access Public
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log('Received Vanuatu webhook:', JSON.stringify(req.body));
    
    // Store the webhook payload
    const webhookPayload = await storage.createWebhookPayload({
      id: uuidv4(),
      webhookId: 'vanuatu-webhook',
      event: req.body.event || 'vanuatu.webhook',
      payload: req.body,
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
        // Process the webhook based on the event type
        const { event, data } = req.body;
        
        if (event) {
          // Notify any subscribers to this event
          await webhookService.processEvent(`vanuatu.${event}`, data);
          
          // Update the webhook payload status
          await storage.updateWebhookPayloadStatus(
            webhookPayload.id, 
            'PROCESSED', 
            200, 
            'Successfully processed webhook'
          );
        }
      } catch (error) {
        console.error('Error processing Vanuatu webhook asynchronously:', error);
        
        // Update the webhook payload status
        await storage.updateWebhookPayloadStatus(
          webhookPayload.id, 
          'FAILED', 
          500, 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    });
    
    // Immediately acknowledge receipt of the webhook
    return res.status(200).json({
      success: true,
      message: 'Webhook received and queued for processing',
      payloadId: webhookPayload.id
    });
  } catch (error: any) {
    console.error('Error handling Vanuatu webhook:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error handling Vanuatu webhook', 
      error: error.message 
    });
  }
});

export default router;