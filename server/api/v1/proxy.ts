/**
 * HTTPS Proxy API Routes - MBTQ Ecosystem
 * 
 * HTTP(s) proxy implementation using CONNECT method
 * for tunneled connections through proxy servers.
 */

import { Router, Request, Response } from 'express';
import { httpsProxyService, HttpsProxyAgent } from '../services/HttpsProxyService';

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

/**
 * GET /api/v1/proxy/health
 * Check proxy service health
 */
router.get('/health', (_req: Request, res: Response) => {
  const defaultProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  res.json({
    success: true,
    proxyConfigured: !!defaultProxy,
    proxyUrl: defaultProxy ? '***configured***' : null,
    visualFeedback: {
      icon: defaultProxy ? '✅' : '⚠️',
      status: defaultProxy ? 'success' : 'warning',
      message: defaultProxy ? 'Proxy configured' : 'No proxy configured',
    },
  });
});

export default router;
