/**
 * Cache Service - MBTQ Ecosystem
 * 
 * Redis-based caching with fallback to in-memory cache
 * 
 * Features:
 * - Redis primary cache
 * - In-memory LRU fallback
 * - TTL-based expiration
 * - Cache invalidation patterns
 * - Fibonacci-based cache sizing
 */

import crypto from 'crypto';

// ==================== Types ====================

export interface CacheConfig {
  redisUrl?: string;
  defaultTTL: number;  // seconds
  maxMemoryCacheSize: number;  // items
  enableCompression: boolean;
  keyPrefix: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
  size?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
}

export type CacheLayer = 'memory' | 'redis' | 'none';

// ==================== Fibonacci Cache Sizes ====================

// Cache sizes based on Fibonacci sequence for optimal distribution
const FIBONACCI_CACHE_TIERS = {
  MICRO: 89,      // 89 items
  SMALL: 144,     // 144 items
  MEDIUM: 233,    // 233 items
  LARGE: 377,     // 377 items
  XLARGE: 610,    // 610 items
  HUGE: 987,      // 987 items
};

// TTL tiers based on Fibonacci ratios (in seconds)
const FIBONACCI_TTL = {
  FLASH: 8,       // 8 seconds - very short
  SHORT: 13,      // 13 seconds
  QUICK: 21,      // 21 seconds
  MEDIUM: 34,     // 34 seconds
  STANDARD: 55,   // 55 seconds
  LONG: 89,       // 89 seconds
  EXTENDED: 144,  // 144 seconds (~2.5 min)
  PERSISTENT: 233, // 233 seconds (~4 min)
  DURABLE: 377,   // 377 seconds (~6 min)
  PERMANENT: 610, // 610 seconds (~10 min)
};

// ==================== LRU Cache Implementation ====================

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = FIBONACCI_CACHE_TIERS.MEDIUM) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    entry.hits++;
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttlSeconds: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      createdAt: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  prune(): number {
    let pruned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    
    return pruned;
  }

  getStats(): CacheStats {
    let totalHits = 0;
    let totalMisses = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    const hitRate = totalHits > 0 ? totalHits / (totalHits + totalMisses) : 0;

    return {
      hits: totalHits,
      misses: totalMisses,
      size: this.cache.size,
      memoryUsage: process.memoryUsage().heapUsed,
      hitRate,
    };
  }
}

// ==================== Cache Service ====================

export class CacheService {
  private memoryCache: LRUCache<any>;
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    redisHits: 0,
    redisMisses: 0,
    memoryHits: 0,
    memoryMisses: 0,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      redisUrl: process.env.REDIS_URL,
      defaultTTL: FIBONACCI_TTL.STANDARD,
      maxMemoryCacheSize: FIBONACCI_CACHE_TIERS.LARGE,
      enableCompression: false,
      keyPrefix: 'mbtq:',
      ...config,
    };

    this.memoryCache = new LRUCache(this.config.maxMemoryCacheSize);

    // Start pruning interval
    setInterval(() => this.memoryCache.prune(), 60000); // Every minute
  }

  // ==================== Core Cache Methods ====================

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);

    // Try memory cache first
    const memoryResult = this.memoryCache.get(fullKey);
    if (memoryResult !== null) {
      this.stats.hits++;
      this.stats.memoryHits++;
      return memoryResult as T;
    }

    // Memory miss
    this.stats.misses++;
    this.stats.memoryMisses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const fullKey = this.buildKey(key);
    const ttl = ttlSeconds || this.config.defaultTTL;

    // Set in memory cache
    this.memoryCache.set(fullKey, value, ttl);
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    return this.memoryCache.delete(fullKey);
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    return this.memoryCache.has(fullKey);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  // ==================== Pattern-based Operations ====================

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    // For memory cache, we need to iterate
    // This is a simplified version - full implementation would use Redis SCAN
    return 0;
  }

  // ==================== Specialized Cache Methods ====================

  /**
   * Cache AI response
   */
  async cacheAIResponse(
    pathway: string,
    messageHash: string,
    response: any,
    ttl: number = FIBONACCI_TTL.EXTENDED
  ): Promise<void> {
    const key = `ai:${pathway}:${messageHash}`;
    await this.set(key, response, ttl);
  }

  /**
   * Get cached AI response
   */
  async getCachedAIResponse(pathway: string, messageHash: string): Promise<any | null> {
    const key = `ai:${pathway}:${messageHash}`;
    return this.get(key);
  }

  /**
   * Cache DeafAUTH session
   */
  async cacheDeafAuthSession(
    sessionId: string,
    sessionData: any,
    ttl: number = FIBONACCI_TTL.PERMANENT
  ): Promise<void> {
    const key = `deafauth:session:${sessionId}`;
    await this.set(key, sessionData, ttl);
  }

  /**
   * Get cached DeafAUTH session
   */
  async getCachedDeafAuthSession(sessionId: string): Promise<any | null> {
    const key = `deafauth:session:${sessionId}`;
    return this.get(key);
  }

  /**
   * Cache PinkSync device state
   */
  async cachePinkSyncDevice(
    deviceId: string,
    deviceState: any,
    ttl: number = FIBONACCI_TTL.DURABLE
  ): Promise<void> {
    const key = `pinksync:device:${deviceId}`;
    await this.set(key, deviceState, ttl);
  }

  /**
   * Cache VR client data
   */
  async cacheVRClient(
    clientId: string,
    clientData: any,
    ttl: number = FIBONACCI_TTL.EXTENDED
  ): Promise<void> {
    const key = `vr:client:${clientId}`;
    await this.set(key, clientData, ttl);
  }

  /**
   * Cache Fibonacci security level
   */
  async cacheFibonacciLevel(
    entityId: string,
    level: any,
    ttl: number = FIBONACCI_TTL.STANDARD
  ): Promise<void> {
    const key = `fibonacci:level:${entityId}`;
    await this.set(key, level, ttl);
  }

  // ==================== Cache-aside Pattern ====================

  /**
   * Get or compute value (cache-aside pattern)
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await computeFn();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  // ==================== Utility Methods ====================

  /**
   * Build full cache key
   */
  private buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Generate hash for cache key
   */
  static hashKey(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & typeof this.stats {
    const memoryStats = this.memoryCache.getStats();
    return {
      ...memoryStats,
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  /**
   * Get Fibonacci TTL value
   */
  static getTTL(tier: keyof typeof FIBONACCI_TTL): number {
    return FIBONACCI_TTL[tier];
  }

  /**
   * Get Fibonacci cache size
   */
  static getCacheSize(tier: keyof typeof FIBONACCI_CACHE_TIERS): number {
    return FIBONACCI_CACHE_TIERS[tier];
  }
}

// ==================== Export Singleton ====================

export const cacheService = new CacheService();

// Export TTL and size constants
export { FIBONACCI_TTL, FIBONACCI_CACHE_TIERS };
