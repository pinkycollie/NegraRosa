import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

/**
 * @route POST /api/v1/verification/submit
 * @desc Submit a new verification
 * @access Private
 */
router.post('/submit', auth0Service.checkJwt, upload.single('document'), async (req: Request, res: Response) => {
  try {
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { type, explanation } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Verification type is required' });
    }
    
    // Prepare the data object
    const data: any = {
      type,
      explanation: explanation || null,
    };
    
    // If a file was uploaded, add it to the data
    if (req.file) {
      data.documentPath = req.file.path;
      data.documentType = req.file.mimetype;
      data.documentName = req.file.originalname;
    }
    
    // Create the verification record
    const verification = await storage.createVerification({
      id: null, // Will be assigned by the database
      userId: user.id,
      type,
      status: 'pending',
      data,
      createdAt: new Date(),
      verifiedAt: null
    });
    
    return res.status(201).json(verification);
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    return res.status(500).json({ message: 'Error submitting verification', error: error.message });
  }
});

/**
 * @route GET /api/v1/verification/:id
 * @desc Get a verification by ID
 * @access Private
 */
router.get('/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const verificationId = parseInt(req.params.id);
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Check if the verification belongs to the user or the user is an admin
    if (verification.userId !== user.id && !req.user.permissions?.includes('read:verifications')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(verification);
  } catch (error: any) {
    console.error('Error fetching verification:', error);
    return res.status(500).json({ message: 'Error fetching verification', error: error.message });
  }
});

/**
 * @route GET /api/v1/verification
 * @desc Get all verifications for the authenticated user
 * @access Private
 */
router.get('/', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all verifications for the user
    const verifications = await storage.getVerificationsByUserId(user.id);
    
    return res.json(verifications);
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    return res.status(500).json({ message: 'Error fetching verifications', error: error.message });
  }
});

/**
 * @route PUT /api/v1/verification/:id
 * @desc Update a verification status (admin only)
 * @access Private/Admin
 */
router.put('/:id', auth0Service.checkJwt, auth0Service.checkPermissions(['update:verifications']), async (req: Request, res: Response) => {
  try {
    const verificationId = parseInt(req.params.id);
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    const { status, adminNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Check if status is valid
    const validStatuses = ['pending', 'approved', 'rejected', 'needs_more_info'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses
      });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Update the verification
    const updates: any = { status };
    if (adminNotes) {
      const data = { ...verification.data, adminNotes };
      updates.data = data;
    }
    
    // If status is changing to approved, update verifiedAt
    if (status === 'approved' && verification.status !== 'approved') {
      updates.verifiedAt = new Date();
    } else if (status !== 'approved' && verification.status === 'approved') {
      updates.verifiedAt = null;
    }
    
    const updatedVerification = await storage.updateVerification(verificationId, updates);
    
    return res.json(updatedVerification);
  } catch (error: any) {
    console.error('Error updating verification:', error);
    return res.status(500).json({ message: 'Error updating verification', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/:id/document
 * @desc Add or update document for a verification
 * @access Private
 */
router.post('/:id/document', auth0Service.checkJwt, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const verificationId = parseInt(req.params.id);
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Document file is required' });
    }
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Check if the verification belongs to the user
    if (verification.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if verification can be updated
    if (verification.status === 'approved') {
      return res.status(400).json({ message: 'Cannot update an approved verification' });
    }
    
    // Update the data object with new document
    const data = {
      ...verification.data,
      documentPath: req.file.path,
      documentType: req.file.mimetype,
      documentName: req.file.originalname,
      documentUpdatedAt: new Date()
    };
    
    // Update the verification
    const updatedVerification = await storage.updateVerification(verificationId, {
      data,
      status: verification.status === 'rejected' ? 'pending' : verification.status
    });
    
    return res.json(updatedVerification);
  } catch (error: any) {
    console.error('Error updating verification document:', error);
    return res.status(500).json({ message: 'Error updating verification document', error: error.message });
  }
});

/**
 * @route GET /api/v1/verification/:id/document
 * @desc Get document for a verification
 * @access Private
 */
router.get('/:id/document', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const verificationId = parseInt(req.params.id);
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Check if the verification belongs to the user or the user is an admin
    if (verification.userId !== user.id && !req.user.permissions?.includes('read:verifications')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if document exists
    const data = verification.data as any;
    if (!data.documentPath) {
      return res.status(404).json({ message: 'No document found for this verification' });
    }
    
    // Check if file exists
    if (!fs.existsSync(data.documentPath)) {
      return res.status(404).json({ message: 'Document file not found' });
    }
    
    // Send the file
    res.setHeader('Content-Type', data.documentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${data.documentName}"`);
    
    return res.sendFile(data.documentPath);
  } catch (error: any) {
    console.error('Error fetching verification document:', error);
    return res.status(500).json({ message: 'Error fetching verification document', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/biometric
 * @desc Submit a biometric verification
 * @access Private
 */
router.post('/biometric', auth0Service.checkJwt, upload.single('image'), async (req: Request, res: Response) => {
  try {
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Biometric image is required' });
    }
    
    // In a real system, this would process the biometric data
    // For this example, we'll just create a verification record
    
    const verification = await storage.createVerification({
      id: null, // Will be assigned by the database
      userId: user.id,
      type: 'biometric',
      status: 'pending',
      data: {
        imagePath: req.file.path,
        imageType: req.file.mimetype,
        confidence: 0.85, // Example confidence score
        processedAt: new Date()
      },
      createdAt: new Date(),
      verifiedAt: null
    });
    
    return res.status(201).json(verification);
  } catch (error: any) {
    console.error('Error submitting biometric verification:', error);
    return res.status(500).json({ message: 'Error submitting biometric verification', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/nft
 * @desc Submit an NFT-based verification
 * @access Private
 */
router.post('/nft', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    // Get the user based on the auth token
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { walletAddress, tokenId, contractAddress, chainId } = req.body;
    
    if (!walletAddress || !tokenId || !contractAddress) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['walletAddress', 'tokenId', 'contractAddress'] 
      });
    }
    
    // In a real system, this would verify NFT ownership
    // For this example, we'll just create a verification record
    
    const verification = await storage.createVerification({
      id: null, // Will be assigned by the database
      userId: user.id,
      type: 'nft',
      status: 'pending',
      data: {
        walletAddress,
        tokenId,
        contractAddress,
        chainId: chainId || 1, // Default to Ethereum mainnet
        verificationId: uuidv4(),
        submittedAt: new Date()
      },
      createdAt: new Date(),
      verifiedAt: null
    });
    
    return res.status(201).json(verification);
  } catch (error: any) {
    console.error('Error submitting NFT verification:', error);
    return res.status(500).json({ message: 'Error submitting NFT verification', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/recovery
 * @desc Submit a recovery code verification
 * @access Public
 */
router.post('/recovery', async (req: Request, res: Response) => {
  try {
    const { email, recoveryCode } = req.body;
    
    if (!email || !recoveryCode) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['email', 'recoveryCode'] 
      });
    }
    
    // In a real system, this would verify the recovery code
    // For this example, we'll just check if the user exists
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: 'If the email exists, a verification process has been initiated',
        success: false
      });
    }
    
    // Create a verification record for the recovery attempt
    await storage.createVerification({
      id: null, // Will be assigned by the database
      userId: user.id,
      type: 'recovery',
      status: 'pending',
      data: {
        recoveryCodeProvided: recoveryCode,
        attemptedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      },
      createdAt: new Date(),
      verifiedAt: null
    });
    
    // In a real system, we would send an email with a link to verify
    
    return res.status(200).json({
      message: 'If the email exists, a verification process has been initiated',
      success: true
    });
  } catch (error: any) {
    console.error('Error submitting recovery verification:', error);
    return res.status(500).json({ message: 'Error processing recovery request', error: error.message });
  }
});

export default router;