/**
 * HTTPS Proxy API Routes - MBTQ Ecosystem
 * 
 * HTTP(s) proxy implementation using CONNECT method
 * for tunneled connections through proxy servers.
 * 
 * Features:
 * - Multi-repo sync across MBTQ ecosystem
 * - Async/await with Promise.all for parallel requests
 * - POST incoming request handling
 * - Visual feedback for Deaf-first accessibility
 */

import { Router, Request, Response } from 'express';
import { 
  httpsProxyService, 
  multiRepoProxyService,
  MBTQ_REPOS,
} from '../services/HttpsProxyService';

const router = Router();

/**
 * POST /api/v1/proxy/agent
 * Create a proxy agent
 */
router.post('/agent', (req: Request, res: Response) => {
  try {
    const { proxyUrl } = req.body;

    if (!proxyUrl) {
      return res.status(400).json({
        error: 'proxyUrl is required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'Proxy URL not provided',
        },
      });
    }

    const agent = httpsProxyService.createAgent(proxyUrl);
    
    res.status(201).json({
      success: true,
      message: 'Proxy agent created',
      stats: agent.getStats(),
      visualFeedback: {
        icon: '🔀',
        status: 'success',
        message: 'Proxy agent ready',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create proxy agent',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Proxy agent creation failed',
      },
    });
  }
});

/**
 * GET /api/v1/proxy/stats
 * Get all proxy agent statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  const stats = httpsProxyService.getAllStats();

  res.json({
    success: true,
    stats,
    visualFeedback: {
      icon: '📊',
      status: 'info',
      message: `${Object.keys(stats).length} proxy agents active`,
    },
  });
});

/**
 * POST /api/v1/proxy/request
 * Make a request through the default proxy
 */
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { url, method, headers, body } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'url is required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'URL not provided',
        },
      });
    }

    const result = await httpsProxyService.request(url, {
      method: method || 'GET',
      headers,
      body,
    } as any);

    res.json({
      success: true,
      statusCode: result.statusCode,
      headers: result.headers,
      body: result.body.substring(0, 1000), // Truncate for safety
      visualFeedback: {
        icon: '✅',
        status: 'success',
        message: `Response: ${result.statusCode}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Proxy request failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Proxy request failed',
      },
    });
  }
});

// ==================== Multi-Repo Endpoints ====================

/**
 * GET /api/v1/proxy/repos
 * List all configured MBTQ repos
 */
router.get('/repos', (_req: Request, res: Response) => {
  const repos = multiRepoProxyService.getRepos();

  res.json({
    success: true,
    repos: repos.map(r => ({
      name: r.name,
      url: r.url,
      branch: r.branch,
      type: r.type,
      hasApiEndpoint: !!r.apiEndpoint,
    })),
    count: repos.length,
    visualFeedback: {
      icon: '📦',
      status: 'info',
      message: `${repos.length} MBTQ repos configured`,
    },
  });
});

/**
 * POST /api/v1/proxy/repos
 * Add a new repo to sync
 */
router.post('/repos', (req: Request, res: Response) => {
  try {
    const { name, url, branch, type, apiEndpoint, webhookSecret } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        error: 'name and url are required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'Missing required fields',
        },
      });
    }

    multiRepoProxyService.addRepo({
      name,
      url,
      branch: branch || 'main',
      type: type || 'github',
      apiEndpoint,
      webhookSecret,
    });

    res.status(201).json({
      success: true,
      message: `Repo ${name} added`,
      visualFeedback: {
        icon: '✅',
        status: 'success',
        message: `Repo ${name} configured`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add repo',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Repo addition failed',
      },
    });
  }
});

/**
 * POST /api/v1/proxy/incoming
 * Queue an incoming request for processing
 */
router.post('/incoming', async (req: Request, res: Response) => {
  try {
    const { source, method, url, headers, body } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'url is required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'URL not provided',
        },
      });
    }

    const incoming = await multiRepoProxyService.queueIncoming({
      source: source || 'api',
      method: method || 'POST',
      url,
      headers: headers || {},
      body,
    });

    res.status(202).json({
      success: true,
      request: incoming,
      visualFeedback: {
        icon: '📥',
        status: 'info',
        message: `Request ${incoming.id} queued`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to queue request',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Queue failed',
      },
    });
  }
});

/**
 * GET /api/v1/proxy/incoming
 * Get all incoming requests in queue
 */
router.get('/incoming', (_req: Request, res: Response) => {
  const queue = multiRepoProxyService.getIncomingQueue();
  const pending = multiRepoProxyService.getPendingRequests();

  res.json({
    success: true,
    queue,
    pendingCount: pending.length,
    totalCount: queue.length,
    visualFeedback: {
      icon: '📋',
      status: 'info',
      message: `${pending.length} pending, ${queue.length} total`,
    },
  });
});

/**
 * POST /api/v1/proxy/incoming/:id/process
 * Process a specific incoming request
 */
router.post('/incoming/:id/process', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await multiRepoProxyService.processIncoming(id);

    res.json({
      success: true,
      request: result,
      visualFeedback: {
        icon: result.status === 'completed' ? '✅' : '❌',
        status: result.status === 'completed' ? 'success' : 'error',
        message: `Request ${id}: ${result.status}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Processing failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Processing failed',
      },
    });
  }
});

/**
 * POST /api/v1/proxy/incoming/process-all
 * Process all pending incoming requests with Promise.all
 */
router.post('/incoming/process-all', async (_req: Request, res: Response) => {
  try {
    const results = await multiRepoProxyService.processAllPending();
    const completed = results.filter(r => r.status === 'completed').length;

    res.json({
      success: true,
      results,
      stats: {
        total: results.length,
        completed,
        failed: results.length - completed,
      },
      visualFeedback: {
        icon: '🚀',
        status: 'success',
        message: `${completed}/${results.length} processed`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Batch processing failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Batch processing failed',
      },
    });
  }
});

/**
 * POST /api/v1/proxy/sync
 * Sync data to specific repos
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { repos, path, body, headers } = req.body;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({
        error: 'repos array is required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'No repos specified',
        },
      });
    }

    if (!path) {
      return res.status(400).json({
        error: 'path is required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'Path not provided',
        },
      });
    }

    const results = await multiRepoProxyService.postToRepos(repos, path, body, headers);
    const successful = results.filter(r => r.success).length;

    res.json({
      success: true,
      results,
      stats: {
        total: results.length,
        successful,
        failed: results.length - successful,
      },
      visualFeedback: {
        icon: successful === results.length ? '✅' : '⚠️',
        status: successful === results.length ? 'success' : 'warning',
        message: `${successful}/${results.length} repos synced`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Sync failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Sync failed',
      },
    });
  }
});

/**
 * POST /api/v1/proxy/sync-all
 * Sync data to all MBTQ repos with API endpoints
 */
router.post('/sync-all', async (req: Request, res: Response) => {
  try {
    const { path, body } = req.body;

    if (!path) {
      return res.status(400).json({
        error: 'path is required',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'Path not provided',
        },
      });
    }

    const results = await multiRepoProxyService.syncAll(path, body);
    const successful = results.filter(r => r.success).length;

    res.json({
      success: true,
      results,
      stats: {
        total: results.length,
        successful,
        failed: results.length - successful,
      },
      visualFeedback: {
        icon: successful === results.length ? '✅' : '⚠️',
        status: successful === results.length ? 'success' : 'warning',
        message: `All MBTQ repos: ${successful}/${results.length} synced`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Sync all failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Sync all failed',
      },
    });
  }
});

/**
 * GET /api/v1/proxy/health
 * Check proxy service health
 */
router.get('/health', (_req: Request, res: Response) => {
  const defaultProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  const repos = multiRepoProxyService.getRepos();
  const queue = multiRepoProxyService.getIncomingQueue();

  res.json({
    success: true,
    proxyConfigured: !!defaultProxy,
    proxyUrl: defaultProxy ? '***configured***' : null,
    reposConfigured: repos.length,
    pendingRequests: queue.filter(r => r.status === 'pending').length,
    mbtqEcosystem: MBTQ_REPOS.map(r => r.name),
    visualFeedback: {
      icon: defaultProxy ? '✅' : '⚠️',
      status: defaultProxy ? 'success' : 'warning',
      message: `${repos.length} repos, ${defaultProxy ? 'proxy active' : 'no proxy'}`,
    },
  });
});

export default router;
