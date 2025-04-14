import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

const router = Router();

/**
 * @route POST /api/v1/verification/verify-user
 * @desc Initiate a user verification
 * @access Private
 */
router.post('/verify-user', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    if (!type) {
      return res.status(400).json({ message: 'Verification type is required' });
    }
    
    // Get user from Auth0 ID
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create verification record
    const verification = await storage.createVerification({
      userId: user.id,
      type,
      status: 'PENDING',
      data: data || {},
    });
    
    // In a real system, this would trigger a verification workflow
    // For now, we'll simulate an automatic approval for testing
    
    return res.status(201).json({
      verification,
      message: 'Verification initiated successfully',
      nextSteps: 'Your verification is being processed'
    });
  } catch (error: any) {
    console.error('Error initiating verification:', error);
    return res.status(500).json({ message: 'Error initiating verification', error: error.message });
  }
});

/**
 * @route GET /api/v1/verification/status/:id
 * @desc Get verification status
 * @access Private
 */
router.get('/status/:id', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const verificationId = parseInt(req.params.id);
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Get user from Auth0 ID
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user has permission to view this verification
    if (!req.user.permissions?.includes('read:verifications') && verification.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(verification);
  } catch (error: any) {
    console.error('Error getting verification status:', error);
    return res.status(500).json({ message: 'Error getting verification status', error: error.message });
  }
});

/**
 * @route PUT /api/v1/verification/approve/:id
 * @desc Approve a verification (admin only)
 * @access Private/Admin
 */
router.put('/approve/:id', auth0Service.checkJwt, auth0Service.checkPermissions(['update:verifications']), async (req: Request, res: Response) => {
  try {
    const verificationId = parseInt(req.params.id);
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Update verification status
    const updatedVerification = await storage.updateVerification(verificationId, 'VERIFIED', new Date());
    
    return res.json({
      verification: updatedVerification,
      message: 'Verification approved successfully'
    });
  } catch (error: any) {
    console.error('Error approving verification:', error);
    return res.status(500).json({ message: 'Error approving verification', error: error.message });
  }
});

/**
 * @route PUT /api/v1/verification/reject/:id
 * @desc Reject a verification (admin only)
 * @access Private/Admin
 */
router.put('/reject/:id', auth0Service.checkJwt, auth0Service.checkPermissions(['update:verifications']), async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const verificationId = parseInt(req.params.id);
    
    if (isNaN(verificationId)) {
      return res.status(400).json({ message: 'Invalid verification ID' });
    }
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    // Get the verification
    const verification = await storage.getVerification(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    // Update verification status
    const updatedVerification = await storage.updateVerification(verificationId, 'REJECTED');
    
    // In a real system, this would trigger a notification to the user
    
    return res.json({
      verification: updatedVerification,
      message: 'Verification rejected successfully'
    });
  } catch (error: any) {
    console.error('Error rejecting verification:', error);
    return res.status(500).json({ message: 'Error rejecting verification', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/biometric
 * @desc Submit biometric verification
 * @access Private
 */
router.post('/biometric', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { selfieImage, idImage, idType } = req.body;
    
    if (!selfieImage || !idImage || !idType) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['selfieImage', 'idImage', 'idType'] 
      });
    }
    
    // Get user from Auth0 ID
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create verification record
    const verification = await storage.createVerification({
      userId: user.id,
      type: 'BIOMETRIC',
      status: 'PENDING',
      data: {
        idType,
        selfieProvided: true,
        idProvided: true,
        timestamp: new Date()
      },
    });
    
    // In a real system, this would trigger a verification workflow
    // For now, we'll return the verification ID for status checking
    
    return res.status(201).json({
      verificationId: verification.id,
      message: 'Biometric verification submitted successfully',
      status: 'PENDING',
      estimatedCompletionTime: '24-48 hours'
    });
  } catch (error: any) {
    console.error('Error submitting biometric verification:', error);
    return res.status(500).json({ message: 'Error submitting biometric verification', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/nft
 * @desc Submit NFT-based verification
 * @access Private
 */
router.post('/nft', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const { walletAddress, tokenId, contractAddress, chain } = req.body;
    
    if (!walletAddress || !tokenId || !contractAddress || !chain) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['walletAddress', 'tokenId', 'contractAddress', 'chain'] 
      });
    }
    
    // Get user from Auth0 ID
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create verification record
    const verification = await storage.createVerification({
      userId: user.id,
      type: 'NFT',
      status: 'PENDING',
      data: {
        walletAddress,
        tokenId,
        contractAddress,
        chain,
        timestamp: new Date()
      },
    });
    
    // In a real system, this would verify NFT ownership on-chain
    // For now, we'll return the verification ID for status checking
    
    return res.status(201).json({
      verificationId: verification.id,
      message: 'NFT verification submitted successfully',
      status: 'PENDING',
      estimatedCompletionTime: 'a few minutes'
    });
  } catch (error: any) {
    console.error('Error submitting NFT verification:', error);
    return res.status(500).json({ message: 'Error submitting NFT verification', error: error.message });
  }
});

/**
 * @route POST /api/v1/verification/recovery
 * @desc Submit recovery code verification
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
    
    // In a real system, this would validate the recovery code
    // For now, we'll always return a success message for testing
    
    return res.json({
      message: 'Recovery code validated successfully',
      nextSteps: 'You can now reset your password'
    });
  } catch (error: any) {
    console.error('Error validating recovery code:', error);
    return res.status(500).json({ message: 'Error validating recovery code', error: error.message });
  }
});

export default router;