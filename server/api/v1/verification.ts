import { Router } from 'express';
import { Request, Response } from 'express';
import { storage as appStorage } from '../../storage';
import { auth0Service } from '../../services/Auth0Service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, GIF and PDF files are allowed'));
    }
    cb(null, true);
  }
});

/**
 * @route POST /api/v1/verification/submit
 * @desc Submit a new verification
 * @access Private
 */
router.post('/submit', auth0Service.checkJwt, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const { type, status = 'PENDING', data } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Please provide verification type' });
    }
    
    let documentData = null;
    
    if (req.file) {
      documentData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    
    // Create verification record
    const verification = await appStorage.createVerification({
      userId: req.user.id,
      type,
      status,
      data: documentData || data || null
    });
    
    res.status(201).json(verification);
  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ message: 'Server error during verification submission' });
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
    
    const verification = await appStorage.getVerification(verificationId);
    
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Check if user has permission to see this verification
    if (verification.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this verification' });
    }
    
    res.json(verification);
  } catch (error) {
    console.error('Verification retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving verification' });
  }
});

/**
 * @route GET /api/v1/verification
 * @desc Get all verifications for the authenticated user
 * @access Private
 */
router.get('/', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const verifications = await appStorage.getVerificationsByUserId(req.user.id);
    
    res.json(verifications);
  } catch (error) {
    console.error('Verifications retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving verifications' });
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
    const { status, feedback } = req.body;
    
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }
    
    const verification = await appStorage.getVerification(verificationId);
    
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Update verification
    const updatedVerification = await appStorage.updateVerification(verificationId, {
      status,
      data: {
        ...verification.data,
        feedback,
        updatedBy: req.user.id,
        updatedAt: new Date()
      }
    });
    
    res.json(updatedVerification);
  } catch (error) {
    console.error('Verification update error:', error);
    res.status(500).json({ message: 'Server error updating verification' });
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
      return res.status(400).json({ message: 'No document uploaded' });
    }
    
    const verification = await appStorage.getVerification(verificationId);
    
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Check if user owns this verification
    if (verification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this verification' });
    }
    
    const documentData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };
    
    // Update verification with document
    const updatedVerification = await appStorage.updateVerification(verificationId, {
      data: documentData,
      status: "DOCUMENT_UPLOADED"
    });
    
    res.json(updatedVerification);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error uploading document' });
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
    
    const verification = await appStorage.getVerification(verificationId);
    
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Check if user has permission to see this document
    if (verification.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    // Check if document exists
    if (!verification.data || !verification.data.path) {
      return res.status(404).json({ message: 'No document found for this verification' });
    }
    
    // Send file
    res.sendFile(verification.data.path, { root: '/' });
  } catch (error) {
    console.error('Document retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving document' });
  }
});

/**
 * @route POST /api/v1/verification/biometric
 * @desc Submit a biometric verification
 * @access Private
 */
router.post('/biometric', auth0Service.checkJwt, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    
    let imageData = null;
    
    if (req.file) {
      imageData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    
    // Create verification record
    const verification = await appStorage.createVerification({
      userId: req.user.id,
      type: 'BIOMETRIC',
      status: 'PENDING',
      data: imageData || data || null
    });
    
    // In a real implementation, you'd likely call a biometric verification service here
    // For demo purposes, we'll just return the verification
    
    // If the biometric data contains both the file and additional data
    if (req.file && data) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      await appStorage.updateVerification(verification.id, {
        data: { ...imageData, ...parsedData }
      });
    }
    
    res.status(201).json(verification);
  } catch (error) {
    console.error('Biometric verification error:', error);
    res.status(500).json({ message: 'Server error during biometric verification' });
  }
});

/**
 * @route POST /api/v1/verification/nft
 * @desc Submit an NFT-based verification
 * @access Private
 */
router.post('/nft', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { walletAddress, nftTokenId, chainId, contractAddress } = req.body;
    
    if (!walletAddress || !nftTokenId) {
      return res.status(400).json({ message: 'Please provide wallet address and NFT token ID' });
    }
    
    // Create verification record
    const verification = await appStorage.createVerification({
      userId: req.user.id,
      type: 'NFT',
      status: 'PENDING',
      data: {
        walletAddress,
        nftTokenId,
        chainId: chainId || '1', // Default to Ethereum mainnet
        contractAddress,
        verifiedAt: null
      }
    });
    
    // In a real implementation, you'd validate the NFT ownership
    // For now, we'll simulate successful verification
    
    res.status(201).json(verification);
  } catch (error) {
    console.error('NFT verification error:', error);
    res.status(500).json({ message: 'Server error during NFT verification' });
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
      return res.status(400).json({ message: 'Please provide email and recovery code' });
    }
    
    // Find user by email
    const user = await appStorage.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create verification record
    const verification = await appStorage.createVerification({
      userId: user.id,
      type: 'RECOVERY_CODE',
      status: 'PENDING',
      data: {
        recoveryCode,
        email,
        verifiedAt: null
      }
    });
    
    // In a real implementation, you'd validate the recovery code
    // For now, we'll simulate successful verification
    
    res.status(201).json(verification);
  } catch (error) {
    console.error('Recovery code verification error:', error);
    res.status(500).json({ message: 'Server error during recovery code verification' });
  }
});

export default router;