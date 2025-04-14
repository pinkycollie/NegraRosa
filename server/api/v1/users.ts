import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

const router = Router();

/**
 * @route GET /api/v1/users/me
 * @desc Get current user's profile (alternative to /auth/me)
 * @access Private
 */
router.get('/me', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/reputation
 * @desc Get user's reputation
 * @access Private
 */
router.get('/:userId/reputation', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      return res.status(404).json({ message: 'Reputation not found' });
    }

    return res.json(reputation);
  } catch (error: any) {
    console.error('Error fetching reputation:', error);
    return res.status(500).json({ message: 'Error fetching reputation', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/verifications
 * @desc Get user's verifications
 * @access Private
 */
router.get('/:userId/verifications', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const verifications = await storage.getVerificationsByUserId(userId);
    return res.json({
      verifications,
      status: {
        verified: verifications.some(v => v.status === 'VERIFIED'),
        verificationCount: verifications.length,
        methods: verifications.map(v => v.type)
      }
    });
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    return res.status(500).json({ message: 'Error fetching verifications', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/transactions
 * @desc Get user's transactions
 * @access Private
 */
router.get('/:userId/transactions', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const transactions = await storage.getTransactionsByUserId(userId);
    return res.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/why-submissions
 * @desc Get user's WHY submissions
 * @access Private
 */
router.get('/:userId/why-submissions', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const submissions = await storage.getWhySubmissionsByUserId(userId);
    return res.json(submissions);
  } catch (error: any) {
    console.error('Error fetching WHY submissions:', error);
    return res.status(500).json({ message: 'Error fetching WHY submissions', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/why-notifications
 * @desc Get user's WHY notifications
 * @access Private
 */
router.get('/:userId/why-notifications', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const notifications = await storage.getWhyNotificationsByUserId(userId);
    return res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching WHY notifications:', error);
    return res.status(500).json({ message: 'Error fetching WHY notifications', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/webhooks
 * @desc Get user's webhooks
 * @access Private
 */
router.get('/:userId/webhooks', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const webhooks = await storage.getWebhooksByUserId(userId);
    return res.json(webhooks);
  } catch (error: any) {
    console.error('Error fetching webhooks:', error);
    return res.status(500).json({ message: 'Error fetching webhooks', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/compliance-credentials
 * @desc Get user's Vanuatu compliance credentials
 * @access Private
 */
router.get('/:userId/compliance-credentials', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const credentials = await storage.getComplianceCredentialsByUserId(userId);
    return res.json(credentials);
  } catch (error: any) {
    console.error('Error fetching compliance credentials:', error);
    return res.status(500).json({ message: 'Error fetching compliance credentials', error: error.message });
  }
});

/**
 * @route GET /api/v1/users/:userId/business-credit-profile
 * @desc Get user's business credit profile
 * @access Private
 */
router.get('/:userId/business-credit-profile', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const profile = await storage.getBusinessCreditProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ message: 'Business credit profile not found' });
    }

    return res.json(profile);
  } catch (error: any) {
    console.error('Error fetching business credit profile:', error);
    return res.status(500).json({ message: 'Error fetching business credit profile', error: error.message });
  }
});

export default router;