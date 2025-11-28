/**
 * Cache API Routes
 * 
 * Endpoints for cache management and statistics
 */

import { Router, Request, Response } from 'express';
import { cacheService, FIBONACCI_TTL, FIBONACCI_CACHE_TIERS } from '../../services/CacheService';

const router = Router();

/**
 * GET /api/v1/cache/status
 * Get cache service status
 */
router.get('/status', (_req: Request, res: Response) => {
  const stats = cacheService.getStats();
  
  res.json({
    status: 'healthy',
    service: 'cache',
    version: '1.0.0',
    stats: {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: (stats.hitRate * 100).toFixed(2) + '%',
      size: stats.size,
      memoryUsage: Math.round(stats.memoryUsage / 1024 / 1024) + 'MB',
    },
    fibonacciTTL: FIBONACCI_TTL,
    fibonacciCacheTiers: FIBONACCI_CACHE_TIERS,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/cache/stats
 * Get detailed cache statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  const stats = cacheService.getStats();
  
  res.json({
    success: true,
    stats: {
      total: {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hitRate,
      },
      memory: {
        hits: stats.memoryHits,
        misses: stats.memoryMisses,
        size: stats.size,
        usage: stats.memoryUsage,
      },
      redis: {
        hits: stats.redisHits,
        misses: stats.redisMisses,
      },
    },
  });
});

/**
 * DELETE /api/v1/cache/clear
 * Clear all cache (admin only)
 */
router.delete('/clear', async (_req: Request, res: Response) => {
  try {
    await cacheService.clear();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * DELETE /api/v1/cache/:key
 * Delete specific cache key
 */
router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const deleted = await cacheService.delete(req.params.key);
    
    res.json({
      success: deleted,
      key: req.params.key,
      message: deleted ? 'Key deleted' : 'Key not found',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/v1/cache/ttl
 * Get available TTL tiers
 */
router.get('/ttl', (_req: Request, res: Response) => {
  res.json({
    success: true,
    ttl: Object.entries(FIBONACCI_TTL).map(([name, seconds]) => ({
      name,
      seconds,
      description: `${seconds} seconds (~${Math.round(seconds / 60 * 10) / 10} min)`,
    })),
  });
});

/**
 * GET /api/v1/cache/tiers
 * Get available cache size tiers
 */
router.get('/tiers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    tiers: Object.entries(FIBONACCI_CACHE_TIERS).map(([name, size]) => ({
      name,
      size,
      description: `${size} items max`,
    })),
  });
});

export default router;
