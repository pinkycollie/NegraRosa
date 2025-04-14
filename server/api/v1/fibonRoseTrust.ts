import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

const router = Router();

/**
 * @route GET /api/v1/fibonrose/trust-score/:userId
 * @desc Get a user's FibonRose trust score
 * @access Private
 */
router.get('/trust-score/:userId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get the user's reputation (which includes the trust score)
    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      return res.status(404).json({ message: 'Reputation not found' });
    }
    
    // Get user verifications to enhance the score calculation
    const verifications = await storage.getVerificationsByUserId(userId);
    const verifiedTypes = verifications
      .filter(v => v.status === 'VERIFIED')
      .map(v => v.type);
    
    // Get recent transactions
    const transactions = await storage.getTransactionsByUserId(userId);
    const recentTransactions = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const nowDate = new Date();
        const diffTime = Math.abs(nowDate.getTime() - transactionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // Last 30 days
      });
    
    // Calculate Fibonacci-based trust score
    // This is a special scoring system that uses the Fibonacci sequence for progressive trust building
    const baseTrustScore = reputation.score || 0;
    const verificationBonus = verifiedTypes.length * 3; // 3 points per verification type
    const recentTransactionsBonus = Math.min(recentTransactions.length * 2, 10); // Max 10 points from recent transactions
    
    // Apply Fibonacci scaling (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...)
    // We'll map the combined score to a specific Fibonacci level
    const combinedScore = baseTrustScore + verificationBonus + recentTransactionsBonus;
    const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
    
    let fibLevel = 0;
    for (let i = 0; i < fibSequence.length; i++) {
      if (combinedScore >= fibSequence[i]) {
        fibLevel = i;
      } else {
        break;
      }
    }
    
    // FibLevel directly correlates to access level
    const accessTier = fibLevel <= 3 ? 'BASIC' : 
                       fibLevel <= 6 ? 'STANDARD' : 
                       fibLevel <= 9 ? 'ADVANCED' : 'PREMIUM';
    
    return res.json({
      userId,
      baseScore: baseTrustScore,
      verificationBonus,
      transactionBonus: recentTransactionsBonus,
      combinedScore,
      fibonacciLevel: fibLevel,
      accessTier,
      verifiedMethods: verifiedTypes,
      transactionCount: {
        total: transactions.length,
        recent: recentTransactions.length
      }
    });
  } catch (error: any) {
    console.error('Error calculating trust score:', error);
    return res.status(500).json({ message: 'Error calculating trust score', error: error.message });
  }
});

/**
 * @route GET /api/v1/fibonrose/access-tier/:userId
 * @desc Get a user's access tier based on FibonRose trust score
 * @access Private
 */
router.get('/access-tier/:userId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get the user's reputation
    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      return res.status(404).json({ message: 'Reputation not found' });
    }
    
    // Simple tier calculation based on score
    const score = reputation.score || 0;
    let tier = 'BASIC';
    
    if (score >= 85) {
      tier = 'PREMIUM';
    } else if (score >= 60) {
      tier = 'ADVANCED';
    } else if (score >= 30) {
      tier = 'STANDARD';
    }
    
    return res.json({ tier });
  } catch (error: any) {
    console.error('Error determining access tier:', error);
    return res.status(500).json({ message: 'Error determining access tier', error: error.message });
  }
});

/**
 * @route GET /api/v1/fibonrose/transaction-limits/:userId
 * @desc Get transaction limits based on FibonRose trust score
 * @access Private
 */
router.get('/transaction-limits/:userId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get the user's reputation
    const reputation = await storage.getReputation(userId);
    if (!reputation) {
      return res.status(404).json({ message: 'Reputation not found' });
    }
    
    // Calculate limits based on reputation score
    const score = reputation.score || 0;
    const tierLimits = {
      BASIC: {
        singleTransactionLimit: 100,
        dailyLimit: 500,
        monthlyLimit: 2000,
        requiresAdditionalVerification: true
      },
      STANDARD: {
        singleTransactionLimit: 1000,
        dailyLimit: 3000,
        monthlyLimit: 10000,
        requiresAdditionalVerification: score < 50
      },
      ADVANCED: {
        singleTransactionLimit: 10000,
        dailyLimit: 25000,
        monthlyLimit: 50000,
        requiresAdditionalVerification: score < 75
      },
      PREMIUM: {
        singleTransactionLimit: 50000,
        dailyLimit: 100000,
        monthlyLimit: 250000,
        requiresAdditionalVerification: false
      }
    };
    
    // Determine tier
    let tier = 'BASIC';
    if (score >= 85) {
      tier = 'PREMIUM';
    } else if (score >= 60) {
      tier = 'ADVANCED';
    } else if (score >= 30) {
      tier = 'STANDARD';
    }
    
    return res.json(tierLimits[tier]);
  } catch (error: any) {
    console.error('Error calculating transaction limits:', error);
    return res.status(500).json({ message: 'Error calculating transaction limits', error: error.message });
  }
});

/**
 * @route GET /api/v1/fibonrose/id/:userId
 * @desc Get FibonRoseID information for a user
 * @access Private
 */
router.get('/id/:userId', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the user's verifications
    const verifications = await storage.getVerificationsByUserId(userId);
    const hasVerifiedIdentity = verifications.some(v => 
      v.status === 'VERIFIED' && 
      (v.type === 'BIOMETRIC' || v.type === 'NFT' || v.type === 'GOVERNMENT_ID')
    );
    
    // Get reputation for trust level
    const reputation = await storage.getReputation(userId);
    
    // Generate FibonRoseID response
    return res.json({
      fibonRoseId: `FIB-${user.id.toString().padStart(8, '0')}`,
      userSince: user.createdAt,
      identityVerified: hasVerifiedIdentity,
      trustScore: reputation?.score || 0,
      verificationCount: verifications.filter(v => v.status === 'VERIFIED').length,
      statusBadges: [
        hasVerifiedIdentity ? 'VERIFIED_IDENTITY' : null,
        (reputation?.score || 0) >= 60 ? 'TRUSTED_MEMBER' : null,
        verifications.some(v => v.type === 'BIOMETRIC' && v.status === 'VERIFIED') ? 'BIOMETRIC_VERIFIED' : null
      ].filter(Boolean)
    });
  } catch (error: any) {
    console.error('Error fetching FibonRoseID:', error);
    return res.status(500).json({ message: 'Error fetching FibonRoseID', error: error.message });
  }
});

export default router;