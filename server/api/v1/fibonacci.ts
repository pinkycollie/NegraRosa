import { Router, Request, Response } from 'express';
import { 
  fibonacciSecurityService, 
  PathwayType, 
  EntityType,
  SecurityBadge 
} from '../../services/FibonacciSecurityService';

const router = Router();

// ==================== Fibonacci Calculations ====================

/**
 * @route GET /api/v1/fibonacci/sequence
 * @desc Get Fibonacci sequence and ratios
 */
router.get('/sequence', (_req: Request, res: Response) => {
  const sequence: number[] = [];
  for (let i = 0; i < 20; i++) {
    sequence.push(fibonacciSecurityService.getFibonacciNumber(i));
  }

  res.json({
    success: true,
    sequence,
    ratios: {
      retracement: {
        '23.6%': 0.236,
        '38.2%': 0.382,
        '50.0%': 0.500,
        '61.8%': 0.618,
        '78.6%': 0.786
      },
      extension: {
        '100%': 1.000,
        '161.8%': 1.618,
        '261.8%': 2.618,
        '423.6%': 4.236
      },
      goldenRatio: 1.618
    }
  });
});

/**
 * @route POST /api/v1/fibonacci/retracement
 * @desc Calculate Fibonacci retracement levels
 */
router.post('/retracement', (req: Request, res: Response) => {
  try {
    const { high, low } = req.body;

    if (typeof high !== 'number' || typeof low !== 'number') {
      return res.status(400).json({ success: false, error: 'High and low values required' });
    }

    const levels = fibonacciSecurityService.calculateRetracementLevels(high, low);

    res.json({
      success: true,
      levels,
      interpretation: {
        '23.6%': 'Early support/resistance',
        '38.2%': 'Moderate support/resistance',
        '50.0%': 'Psychological midpoint',
        '61.8%': 'Golden Ratio - Key decision point',
        '78.6%': 'Deep retracement - Critical level'
      }
    });
  } catch (error) {
    console.error('Retracement calculation error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/fibonacci/extension
 * @desc Calculate Fibonacci extension levels
 */
router.post('/extension', (req: Request, res: Response) => {
  try {
    const { start, end } = req.body;

    if (typeof start !== 'number' || typeof end !== 'number') {
      return res.status(400).json({ success: false, error: 'Start and end values required' });
    }

    const levels = fibonacciSecurityService.calculateExtensionLevels(start, end);

    res.json({
      success: true,
      levels,
      interpretation: {
        '100%': 'Current achievement',
        '161.8%': 'Golden Ratio target - Optimal growth',
        '261.8%': 'Extended potential',
        '423.6%': 'Maximum projection'
      }
    });
  } catch (error) {
    console.error('Extension calculation error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== GENERATIVE UNITS ====================

/**
 * @route POST /api/v1/fibonacci/units
 * @desc Create GENERATIVE UNITS for an entity
 */
router.post('/units', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType, pathway, initialUnits } = req.body;

    if (!entityId || !entityType || !pathway || typeof initialUnits !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'entityId, entityType, pathway, and initialUnits required' 
      });
    }

    // Validate pathway
    const validPathways: PathwayType[] = ['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'];
    if (!validPathways.includes(pathway)) {
      return res.status(400).json({
        success: false,
        error: `Invalid pathway. Must be one of: ${validPathways.join(', ')}`
      });
    }

    // Validate entity type
    const validEntityTypes: EntityType[] = ['USER', 'ORGANIZATION', 'PROJECT', 'DEVICE', 'API_CLIENT', 'WORKFLOW', 'RESOURCE'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }

    const unit = await fibonacciSecurityService.createGenerativeUnits(
      entityId,
      entityType,
      pathway,
      initialUnits
    );

    res.status(201).json({
      success: true,
      unit,
      message: `GENERATIVE UNITS created for ${pathway} pathway`
    });
  } catch (error) {
    console.error('Create units error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/fibonacci/units/:unitId/consume
 * @desc Consume GENERATIVE UNITS with overspending protection
 */
router.post('/units/:unitId/consume', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const { amount, reason } = req.body;

    if (typeof amount !== 'number' || !reason) {
      return res.status(400).json({ success: false, error: 'Amount and reason required' });
    }

    const result = await fibonacciSecurityService.consumeUnits(unitId, amount, reason);

    if (result.blocked) {
      return res.status(403).json({
        success: false,
        blocked: true,
        blockReason: result.blockReason,
        warnings: result.warnings,
        remaining: result.remaining,
        message: 'Consumption blocked to prevent overspending'
      });
    }

    res.json({
      success: true,
      consumed: result.consumed,
      remaining: result.remaining,
      warnings: result.warnings,
      message: result.warnings.length > 0 
        ? 'Units consumed with warnings' 
        : 'Units consumed successfully'
    });
  } catch (error) {
    console.error('Consume units error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/fibonacci/units/:unitId/progress
 * @desc Update pathway progress
 */
router.post('/units/:unitId/progress', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const { milestone, progress } = req.body;

    if (!milestone || typeof progress !== 'number') {
      return res.status(400).json({ success: false, error: 'Milestone and progress required' });
    }

    const result = await fibonacciSecurityService.updatePathwayProgress(
      unitId,
      milestone,
      progress
    );

    res.json({
      success: result.success,
      fibonacciReward: result.fibonacciReward,
      goldenRatioScore: result.goldenRatioScore,
      visualFeedback: result.visualFeedback
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== SECURITY IDENTITY ====================

/**
 * @route POST /api/v1/fibonacci/identity
 * @desc Create security identity for an entity
 */
router.post('/identity', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.body;

    if (!entityId || !entityType) {
      return res.status(400).json({ success: false, error: 'entityId and entityType required' });
    }

    const identity = await fibonacciSecurityService.createSecurityIdentity(entityId, entityType);

    res.status(201).json({
      success: true,
      identity,
      message: 'Security identity created with Deaf-first compliance'
    });
  } catch (error) {
    console.error('Create identity error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route PUT /api/v1/fibonacci/identity/:identityId
 * @desc Update security identity
 */
router.put('/identity/:identityId', async (req: Request, res: Response) => {
  try {
    const { identityId } = req.params;
    const { verificationAdded, interactionType } = req.body;

    const identity = await fibonacciSecurityService.updateSecurityIdentity(identityId, {
      verificationAdded,
      interactionType
    });

    if (!identity) {
      return res.status(404).json({ success: false, error: 'Identity not found' });
    }

    res.json({
      success: true,
      identity,
      message: 'Security identity updated'
    });
  } catch (error) {
    console.error('Update identity error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route POST /api/v1/fibonacci/identity/:identityId/badge
 * @desc Award security badge
 */
router.post('/identity/:identityId/badge', async (req: Request, res: Response) => {
  try {
    const { identityId } = req.params;
    const badgeConfig = req.body as Omit<SecurityBadge, 'id' | 'earnedAt'>;

    if (!badgeConfig.name || !badgeConfig.type || !badgeConfig.issuer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Badge name, type, and issuer required' 
      });
    }

    const badge = await fibonacciSecurityService.awardBadge(identityId, badgeConfig);

    if (!badge) {
      return res.status(404).json({ success: false, error: 'Identity not found' });
    }

    res.status(201).json({
      success: true,
      badge,
      message: `Badge "${badge.name}" awarded successfully`
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== BADGES & CERTIFICATIONS ====================

/**
 * @route GET /api/v1/fibonacci/badges
 * @desc Get available security badges
 */
router.get('/badges', (_req: Request, res: Response) => {
  const badges = fibonacciSecurityService.getAvailableBadges();

  res.json({
    success: true,
    badges,
    categories: {
      NATIONAL: 'Country-specific compliance badges',
      GLOBAL: 'International standard badges',
      OFFICIAL: 'MBTQ ecosystem verified badges',
      COMMUNITY: 'Community-driven recognition'
    },
    levels: {
      BRONZE: 'Entry level achievement',
      SILVER: 'Established compliance',
      GOLD: 'Strong security posture',
      PLATINUM: 'Excellence in security',
      DIAMOND: 'Highest level of trust'
    }
  });
});

/**
 * @route GET /api/v1/fibonacci/pathways
 * @desc Get available pathways with descriptions
 */
router.get('/pathways', (_req: Request, res: Response) => {
  res.json({
    success: true,
    pathways: {
      JOB: {
        name: 'Job Seeker Pathway',
        description: 'For those seeking employment opportunities',
        milestones: [
          'resume_ready',
          'skills_verified',
          'applications_sent',
          'interviews_completed',
          'offers_received',
          'employment_secured'
        ],
        visualIndicator: '💼',
        note: 'Traditional vocational rehabilitation focuses here exclusively'
      },
      BUSINESS: {
        name: 'Business Owner Pathway',
        description: 'For entrepreneurs building their own ventures',
        milestones: [
          'idea_validated',
          'business_plan',
          'legal_setup',
          'funding_secured',
          'first_customer',
          'sustainable_revenue'
        ],
        visualIndicator: '🏢',
        note: 'Often underserved by traditional vocational programs'
      },
      DEVELOPER: {
        name: 'Developer Pathway',
        description: 'For technical builders creating software and systems',
        milestones: [
          'skills_assessed',
          'portfolio_built',
          'contributions_made',
          'projects_deployed',
          'community_engaged',
          'expertise_recognized'
        ],
        visualIndicator: '💻',
        note: 'Requires accessible development tools and documentation'
      },
      CREATIVE: {
        name: 'Creative Professional Pathway',
        description: 'For artists, designers, and content creators',
        milestones: [
          'vision_defined',
          'skills_developed',
          'portfolio_created',
          'audience_built',
          'work_monetized',
          'sustainable_practice'
        ],
        visualIndicator: '🎨',
        note: 'Often overlooked in traditional employment services'
      }
    },
    deafFirstNote: 'All pathways designed with Deaf accessibility as the foundation, not an afterthought'
  });
});

// ==================== MBTQ ECOSYSTEM ====================

/**
 * @route GET /api/v1/fibonacci/ecosystem
 * @desc Get MBTQ ecosystem overview
 */
router.get('/ecosystem', (_req: Request, res: Response) => {
  res.json({
    success: true,
    ecosystem: {
      core: {
        NegraRosa: {
          description: 'Inclusive security framework',
          url: 'https://github.com/pinkycollie/NegraRosa',
          role: 'Security foundation',
          visualIndicator: '🌹'
        },
        DeafAUTH: {
          description: 'Deaf-first authentication system',
          role: 'Authentication layer',
          visualIndicator: '👐'
        },
        PinkSync: {
          description: 'Offline/Online synchronization',
          role: 'Data sync layer',
          visualIndicator: '🔄'
        },
        FibonRose: {
          description: 'Fibonacci-based trust system',
          url: 'https://github.com/fibonroseTrust',
          role: 'Trust measurement',
          visualIndicator: '🌹'
        }
      },
      platforms: {
        'mbtquniverse.com': {
          description: 'Main MBTQ platform',
          role: 'User portal'
        },
        'mbtq.dev': {
          description: 'Developer resources',
          role: 'API and tools'
        },
        'vr4deaf.org': {
          description: 'VR accessibility for Deaf users',
          role: 'Immersive accessibility'
        }
      }
    },
    principles: {
      deafFirst: 'Design for Deaf users first, benefiting all users',
      fibonacciSecurity: 'Use natural patterns for security measurement',
      overspendingProtection: 'Prevent users from overcommitting resources',
      pathwayFlexibility: 'Support multiple career paths, not just "job" seeking',
      openSource: 'Transparent, community-driven development'
    }
  });
});

// ==================== STATUS ====================

/**
 * @route GET /api/v1/fibonacci/status
 * @desc Get Fibonacci Security Service status
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = fibonacciSecurityService.getStatus();

  res.json({
    success: true,
    status,
    version: '1.0.0',
    features: [
      'Fibonacci-based security levels',
      'GENERATIVE UNITS management',
      'Overspending protection',
      'Pathway progression tracking',
      'Security badges and certifications',
      'Deaf-first accessibility',
      'Visual and haptic feedback'
    ]
  });
});

export default router;
