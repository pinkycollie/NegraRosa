import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

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

export default router;