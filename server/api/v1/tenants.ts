import { Router, Request, Response } from 'express';
import { auth0Service } from '../../services/Auth0Service';
import { storage } from '../../storage';

const router = Router();

/**
 * @route GET /api/v1/tenants
 * @desc Get all tenants (admin only)
 * @access Private/Admin
 */
router.get('/', auth0Service.checkJwt, auth0Service.checkPermissions(['read:tenants']), async (req: Request, res: Response) => {
  try {
    // In a real system, we would fetch from a tenants table
    // For now, we'll return a mock list of all available tenants
    return res.json([
      {
        id: "tenant-1",
        name: "NegraRosa Security",
        description: "Comprehensive security framework for inclusive verification",
        createdAt: new Date("2023-01-15T00:00:00Z"),
        owner: {
          id: 1,
          username: "admin"
        }
      },
      {
        id: "tenant-2",
        name: "FibonRoseTRUST",
        description: "Progressive trust building system with Fibonacci scoring",
        createdAt: new Date("2023-02-20T00:00:00Z"),
        owner: {
          id: 1,
          username: "admin"
        }
      },
      {
        id: "tenant-3",
        name: "CIVIC Bridge",
        description: "CIVIC integration for extended identity verification",
        createdAt: new Date("2023-03-10T00:00:00Z"),
        owner: {
          id: 1,
          username: "admin"
        }
      }
    ]);
  } catch (error: any) {
    console.error('Error fetching tenants:', error);
    return res.status(500).json({ message: 'Error fetching tenants', error: error.message });
  }
});

/**
 * @route GET /api/v1/tenants/my
 * @desc Get tenants for the current user
 * @access Private
 */
router.get('/my', auth0Service.checkJwt, async (req: Request, res: Response) => {
  try {
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tenants = await storage.getUserTenants(user.id);
    return res.json(tenants);
  } catch (error: any) {
    console.error('Error fetching user tenants:', error);
    return res.status(500).json({ message: 'Error fetching user tenants', error: error.message });
  }
});

/**
 * @route GET /api/v1/tenants/:id
 * @desc Get tenant by ID
 * @access Private
 */
router.get('/:id', auth0Service.checkJwt, auth0Service.checkTenantAccess(), async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;
    
    // In a real system, we would fetch from a tenants table
    // For now, we'll return a mock tenant based on the ID
    const mockTenants = {
      "tenant-1": {
        id: "tenant-1",
        name: "NegraRosa Security",
        description: "Comprehensive security framework for inclusive verification",
        createdAt: new Date("2023-01-15T00:00:00Z"),
        features: ["biometric-verification", "nft-verification", "recovery-verification", "zkp-proofs"],
        modules: [
          { id: "verification", name: "Verification Module", active: true },
          { id: "webhooks", name: "Webhook Management", active: true },
          { id: "compliance", name: "Compliance Reporting", active: true }
        ],
        branding: {
          primaryColor: "#8B5CF6",
          logo: "https://example.com/logos/negrarosa.png",
          companyName: "NegraRosa Security"
        }
      },
      "tenant-2": {
        id: "tenant-2",
        name: "FibonRoseTRUST",
        description: "Progressive trust building system with Fibonacci scoring",
        createdAt: new Date("2023-02-20T00:00:00Z"),
        features: ["trust-scoring", "progressive-access", "verification-integration"],
        modules: [
          { id: "trust-scoring", name: "Trust Scoring Engine", active: true },
          { id: "access-tiers", name: "Access Tier Management", active: true },
          { id: "transaction-limits", name: "Transaction Limits", active: true }
        ],
        branding: {
          primaryColor: "#EC4899",
          logo: "https://example.com/logos/fibonrose.png",
          companyName: "FibonRoseTRUST"
        }
      },
      "tenant-3": {
        id: "tenant-3",
        name: "CIVIC Bridge",
        description: "CIVIC integration for extended identity verification",
        createdAt: new Date("2023-03-10T00:00:00Z"),
        features: ["civic-integration", "blockchain-identity", "cross-platform-verification"],
        modules: [
          { id: "civic-connect", name: "CIVIC Connection", active: true },
          { id: "identity-bridge", name: "Identity Bridge", active: true },
          { id: "verification-sync", name: "Verification Sync", active: true }
        ],
        branding: {
          primaryColor: "#3B82F6",
          logo: "https://example.com/logos/civic-bridge.png",
          companyName: "CIVIC Bridge"
        }
      }
    };
    
    const tenant = mockTenants[tenantId];
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    return res.json(tenant);
  } catch (error: any) {
    console.error('Error fetching tenant:', error);
    return res.status(500).json({ message: 'Error fetching tenant', error: error.message });
  }
});

/**
 * @route GET /api/v1/tenants/:id/users
 * @desc Get users for a tenant (admin or tenant admin only)
 * @access Private/Admin
 */
router.get('/:id/users', auth0Service.checkJwt, auth0Service.checkTenantAccess(), async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has admin access to this tenant
    const membership = await storage.getUserTenantMembership(user.id, tenantId);
    if (!membership || (membership.role !== 'admin' && !req.user.permissions?.includes('read:tenant_users'))) {
      return res.status(403).json({ message: 'Access denied: requires tenant admin role' });
    }
    
    // In a real system, we would fetch users belonging to this tenant
    // For now, we'll return mock users
    return res.json([
      {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        joinedAt: new Date("2023-01-15T00:00:00Z"),
        lastActive: new Date()
      },
      {
        id: 2,
        username: "manager",
        email: "manager@example.com",
        role: "manager",
        joinedAt: new Date("2023-02-01T00:00:00Z"),
        lastActive: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 3,
        username: "viewer",
        email: "viewer@example.com",
        role: "viewer",
        joinedAt: new Date("2023-03-01T00:00:00Z"),
        lastActive: new Date(Date.now() - 259200000) // 3 days ago
      }
    ]);
  } catch (error: any) {
    console.error('Error fetching tenant users:', error);
    return res.status(500).json({ message: 'Error fetching tenant users', error: error.message });
  }
});

/**
 * @route GET /api/v1/tenants/:id/config
 * @desc Get configuration for a tenant
 * @access Private
 */
router.get('/:id/config', auth0Service.checkJwt, auth0Service.checkTenantAccess(), async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;
    
    // In a real system, we would fetch tenant config from a database
    // For now, we'll return mock configurations based on the tenant ID
    const mockConfigs = {
      "tenant-1": {
        verification: {
          requireBiometric: true,
          allowNft: true,
          allowRecovery: true,
          verificationExpiry: 365, // days
          minVerificationsRequired: 1
        },
        webhooks: {
          enabled: true,
          maxWebhooksPerUser: 10,
          retryStrategy: {
            maxRetries: 5,
            backoffMultiplier: 1.5
          }
        },
        branding: {
          primaryColor: "#8B5CF6",
          companyName: "NegraRosa Security",
          customDomain: "security.negrarosa.com"
        }
      },
      "tenant-2": {
        trustScoring: {
          baseScoreNew: 10,
          verificationBonus: 15,
          transactionBonus: 5,
          maxScore: 100,
          scoringAlgorithm: "fibonacci"
        },
        accessTiers: {
          tiers: [
            { name: "BASIC", minScore: 0, maxScore: 29 },
            { name: "STANDARD", minScore: 30, maxScore: 59 },
            { name: "ADVANCED", minScore: 60, maxScore: 84 },
            { name: "PREMIUM", minScore: 85, maxScore: 100 }
          ]
        },
        branding: {
          primaryColor: "#EC4899",
          companyName: "FibonRoseTRUST",
          customDomain: "trust.fibonrose.com"
        }
      },
      "tenant-3": {
        civicIntegration: {
          enabled: true,
          autosyncVerifications: true,
          allowExternalLogin: true
        },
        blockchainVerification: {
          enabled: true,
          supportedChains: ["ethereum", "solana", "polygon"],
          requiredConfirmations: 6
        },
        branding: {
          primaryColor: "#3B82F6",
          companyName: "CIVIC Bridge",
          customDomain: "bridge.civic-connect.com"
        }
      }
    };
    
    const config = mockConfigs[tenantId];
    if (!config) {
      return res.status(404).json({ message: 'Tenant configuration not found' });
    }
    
    return res.json(config);
  } catch (error: any) {
    console.error('Error fetching tenant configuration:', error);
    return res.status(500).json({ message: 'Error fetching tenant configuration', error: error.message });
  }
});

/**
 * @route GET /api/v1/tenants/:id/metrics
 * @desc Get metrics for a tenant (admin or tenant admin only)
 * @access Private/Admin
 */
router.get('/:id/metrics', auth0Service.checkJwt, auth0Service.checkTenantAccess(), async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;
    const user = await storage.getUserByExternalId(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has admin access to this tenant
    const membership = await storage.getUserTenantMembership(user.id, tenantId);
    if (!membership || (membership.role !== 'admin' && !req.user.permissions?.includes('read:tenant_metrics'))) {
      return res.status(403).json({ message: 'Access denied: requires tenant admin role' });
    }
    
    // In a real system, we would calculate metrics from actual data
    // For now, we'll return mock metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return res.json({
      timeframe: {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString()
      },
      users: {
        total: 156,
        active: 89,
        new: 27
      },
      verifications: {
        total: 203,
        successful: 176,
        failed: 27,
        byType: {
          biometric: 98,
          nft: 45,
          recovery: 33,
          other: 27
        }
      },
      transactions: {
        total: 467,
        value: 239850.75,
        successful: 452,
        flagged: 15,
        averageValue: 513.6
      },
      webhooks: {
        total: 1245,
        successful: 1198,
        failed: 47,
        avgResponseTime: 0.87 // seconds
      }
    });
  } catch (error: any) {
    console.error('Error fetching tenant metrics:', error);
    return res.status(500).json({ message: 'Error fetching tenant metrics', error: error.message });
  }
});

export default router;