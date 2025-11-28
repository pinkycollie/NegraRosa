/**
 * HTTPS Proxy Service - MBTQ Ecosystem
 * 
 * Implements HTTP(s) proxy http.Agent for HTTPS connections
 * using the CONNECT HTTP method for tunneling.
 * 
 * Features:
 * - Proxy support for all MBTQ API calls
 * - WebSocket proxy through CONNECT
 * - Automatic proxy detection
 * - Connection pooling with Fibonacci-based limits
 * - Visual protocol for Deaf-first debugging
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';
import crypto from 'crypto';

// ==================== Types ====================

export interface ProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
  headers?: Record<string, string>;
  timeout?: number;
  keepAlive?: boolean;
  maxSockets?: number;
}

export interface ProxyConnection {
  id: string;
  targetHost: string;
  targetPort: number;
  proxyHost: string;
  proxyPort: number;
  status: 'connecting' | 'connected' | 'tunneled' | 'closed' | 'error';
  createdAt: Date;
  connectedAt?: Date;
  bytesTransferred: number;
  visualLog: VisualLogEntry[];
}

export interface VisualLogEntry {
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  icon: string; // Emoji for visual representation
  details?: Record<string, unknown>;
}

// ==================== Fibonacci Connection Limits ====================

const FIBONACCI_CONNECTION_LIMITS = {
  MIN_SOCKETS: 8,      // F(6)
  DEFAULT_SOCKETS: 13, // F(7)
  HIGH_SOCKETS: 21,    // F(8)
  MAX_SOCKETS: 34,     // F(9)
  TIMEOUT_MS: 55000,   // F(10) * 1000
};

// ==================== Visual Protocol Symbols ====================

const VISUAL_SYMBOLS = {
  CONNECTING: '🔌',
  CONNECTED: '✅',
  TUNNELING: '🚇',
  SENDING: '📤',
  RECEIVING: '📥',
  CLOSED: '🔒',
  ERROR: '❌',
  WARNING: '⚠️',
  PROXY: '🔀',
  SECURE: '🔐',
  WEBSOCKET: '🌐',
};

// ==================== HTTPS Proxy Agent ====================

export class HttpsProxyAgent extends https.Agent {
  private proxyConfig: ProxyConfig;
  private connections: Map<string, ProxyConnection> = new Map();
  private visualLog: VisualLogEntry[] = [];

  constructor(proxy: string | URL | ProxyConfig, options?: https.AgentOptions) {
    super({
      keepAlive: true,
      maxSockets: FIBONACCI_CONNECTION_LIMITS.DEFAULT_SOCKETS,
      ...options,
    });

    if (typeof proxy === 'string') {
      const url = new URL(proxy);
      this.proxyConfig = {
        host: url.hostname,
        port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        auth: url.username ? {
          username: url.username,
          password: url.password || '',
        } : undefined,
        timeout: FIBONACCI_CONNECTION_LIMITS.TIMEOUT_MS,
        keepAlive: true,
        maxSockets: FIBONACCI_CONNECTION_LIMITS.DEFAULT_SOCKETS,
      };
    } else if (proxy instanceof URL) {
      this.proxyConfig = {
        host: proxy.hostname,
        port: parseInt(proxy.port) || (proxy.protocol === 'https:' ? 443 : 80),
        auth: proxy.username ? {
          username: proxy.username,
          password: proxy.password || '',
        } : undefined,
        timeout: FIBONACCI_CONNECTION_LIMITS.TIMEOUT_MS,
        keepAlive: true,
        maxSockets: FIBONACCI_CONNECTION_LIMITS.DEFAULT_SOCKETS,
      };
    } else {
      this.proxyConfig = proxy;
    }

    this.logVisual('info', `${VISUAL_SYMBOLS.PROXY} Proxy agent initialized`, {
      host: this.proxyConfig.host,
      port: this.proxyConfig.port,
    });
  }

  /**
   * Create a connection through the proxy using CONNECT method
   */
  createConnection(
    options: https.RequestOptions,
    callback: (err: Error | null, socket?: import('net').Socket) => void
  ): void {
    const connectionId = this.generateConnectionId();
    const targetHost = options.hostname || options.host || 'localhost';
    const targetPort = options.port ? parseInt(String(options.port)) : 443;

    const connection: ProxyConnection = {
      id: connectionId,
      targetHost,
      targetPort,
      proxyHost: this.proxyConfig.host,
      proxyPort: this.proxyConfig.port,
      status: 'connecting',
      createdAt: new Date(),
      bytesTransferred: 0,
      visualLog: [],
    };
    this.connections.set(connectionId, connection);

    this.logVisual('info', `${VISUAL_SYMBOLS.CONNECTING} Opening tunnel to ${targetHost}:${targetPort}`, {
      connectionId,
      through: `${this.proxyConfig.host}:${this.proxyConfig.port}`,
    });

    // Build CONNECT request
    const connectRequest = [
      `CONNECT ${targetHost}:${targetPort} HTTP/1.1`,
      `Host: ${targetHost}:${targetPort}`,
    ];

    // Add proxy authentication if configured
    if (this.proxyConfig.auth) {
      const auth = Buffer.from(
        `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`
      ).toString('base64');
      connectRequest.push(`Proxy-Authorization: Basic ${auth}`);
    }

    // Add custom headers
    if (this.proxyConfig.headers) {
      for (const [key, value] of Object.entries(this.proxyConfig.headers)) {
        connectRequest.push(`${key}: ${value}`);
      }
    }

    connectRequest.push('', ''); // End with blank line

    // Create connection to proxy
    const proxyRequest = http.request({
      host: this.proxyConfig.host,
      port: this.proxyConfig.port,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
      headers: {
        Host: `${targetHost}:${targetPort}`,
        ...(this.proxyConfig.auth ? {
          'Proxy-Authorization': `Basic ${Buffer.from(
            `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`
          ).toString('base64')}`,
        } : {}),
        ...this.proxyConfig.headers,
      },
      timeout: this.proxyConfig.timeout || FIBONACCI_CONNECTION_LIMITS.TIMEOUT_MS,
    });

    proxyRequest.on('connect', (response, socket, head) => {
      if (response.statusCode === 200) {
        connection.status = 'tunneled';
        connection.connectedAt = new Date();

        this.logVisual('success', `${VISUAL_SYMBOLS.TUNNELING} Tunnel established`, {
          connectionId,
          target: `${targetHost}:${targetPort}`,
        });

        // Track data transfer
        socket.on('data', (chunk) => {
          connection.bytesTransferred += chunk.length;
        });

        socket.on('close', () => {
          connection.status = 'closed';
          this.logVisual('info', `${VISUAL_SYMBOLS.CLOSED} Tunnel closed`, {
            connectionId,
            bytesTransferred: connection.bytesTransferred,
          });
        });

        callback(null, socket);
      } else {
        const error = new Error(`Proxy CONNECT failed: ${response.statusCode} ${response.statusMessage}`);
        connection.status = 'error';
        
        this.logVisual('error', `${VISUAL_SYMBOLS.ERROR} Tunnel failed`, {
          connectionId,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
        });

        callback(error);
      }
    });

    proxyRequest.on('error', (error) => {
      connection.status = 'error';
      
      this.logVisual('error', `${VISUAL_SYMBOLS.ERROR} Proxy connection error`, {
        connectionId,
        error: error.message,
      });

      callback(error);
    });

    proxyRequest.on('timeout', () => {
      connection.status = 'error';
      proxyRequest.destroy();
      
      this.logVisual('warning', `${VISUAL_SYMBOLS.WARNING} Proxy connection timeout`, {
        connectionId,
        timeout: this.proxyConfig.timeout,
      });

      callback(new Error('Proxy connection timeout'));
    });

    proxyRequest.end();
  }

  /**
   * Get visual log for debugging (Deaf-first)
   */
  getVisualLog(): VisualLogEntry[] {
    return [...this.visualLog];
  }

  /**
   * Get active connections
   */
  getConnections(): ProxyConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    totalBytesTransferred: number;
    connectionsByStatus: Record<string, number>;
  } {
    const connections = Array.from(this.connections.values());
    const connectionsByStatus: Record<string, number> = {};
    
    connections.forEach(conn => {
      connectionsByStatus[conn.status] = (connectionsByStatus[conn.status] || 0) + 1;
    });

    return {
      totalConnections: connections.length,
      activeConnections: connections.filter(c => 
        c.status === 'connecting' || c.status === 'connected' || c.status === 'tunneled'
      ).length,
      totalBytesTransferred: connections.reduce((sum, c) => sum + c.bytesTransferred, 0),
      connectionsByStatus,
    };
  }

  // ==================== Helper Methods ====================

  private generateConnectionId(): string {
    return `proxy_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private logVisual(
    type: VisualLogEntry['type'],
    message: string,
    details?: Record<string, unknown>
  ): void {
    const icons: Record<VisualLogEntry['type'], string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };

    const entry: VisualLogEntry = {
      timestamp: new Date(),
      type,
      message,
      icon: icons[type],
      details,
    };

    this.visualLog.push(entry);

    // Keep log size manageable (Fibonacci: max 144 entries)
    if (this.visualLog.length > 144) {
      this.visualLog = this.visualLog.slice(-89); // F(11)
    }
  }
}

// ==================== Proxy Service ====================

export class HttpsProxyService {
  private agents: Map<string, HttpsProxyAgent> = new Map();
  private defaultProxy?: string;

  constructor(defaultProxy?: string) {
    this.defaultProxy = defaultProxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  }

  /**
   * Create a proxy agent for a specific proxy URL
   */
  createAgent(proxyUrl: string, options?: https.AgentOptions): HttpsProxyAgent {
    const key = proxyUrl;
    
    if (this.agents.has(key)) {
      return this.agents.get(key)!;
    }

    const agent = new HttpsProxyAgent(proxyUrl, options);
    this.agents.set(key, agent);
    return agent;
  }

  /**
   * Get the default proxy agent
   */
  getDefaultAgent(): HttpsProxyAgent | undefined {
    if (!this.defaultProxy) return undefined;
    return this.createAgent(this.defaultProxy);
  }

  /**
   * Make an HTTPS request through proxy
   */
  async request(
    url: string,
    options?: https.RequestOptions
  ): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
    const agent = this.getDefaultAgent();
    const parsedUrl = new URL(url);

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: options?.method || 'GET',
          headers: options?.headers,
          agent,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode || 0,
              headers: res.headers,
              body,
            });
          });
        }
      );

      req.on('error', reject);
      
      if (options?.method === 'POST' && (options as any).body) {
        req.write((options as any).body);
      }
      
      req.end();
    });
  }

  /**
   * WebSocket connection through proxy
   */
  createWebSocketAgent(proxyUrl?: string): HttpsProxyAgent {
    const proxy = proxyUrl || this.defaultProxy;
    if (!proxy) {
      throw new Error('No proxy URL provided for WebSocket connection');
    }
    return this.createAgent(proxy);
  }

  /**
   * Get all agent stats
   */
  getAllStats(): Record<string, ReturnType<HttpsProxyAgent['getStats']>> {
    const stats: Record<string, ReturnType<HttpsProxyAgent['getStats']>> = {};
    
    this.agents.forEach((agent, key) => {
      stats[key] = agent.getStats();
    });

    return stats;
  }
}

// ==================== Multi-Repo Sync ====================

export interface RepoConfig {
  name: string;
  url: string;
  branch: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'custom';
  apiEndpoint?: string;
  webhookSecret?: string;
}

export interface IncomingRequest {
  id: string;
  source: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: unknown;
}

export interface SyncResult {
  repoName: string;
  success: boolean;
  timestamp: Date;
  message: string;
  details?: Record<string, unknown>;
}

// MBTQ Ecosystem Repos Configuration
export const MBTQ_REPOS: RepoConfig[] = [
  {
    name: 'negrarosa',
    url: 'https://github.com/pinkycollie/NegraRosa',
    branch: 'main',
    type: 'github',
    apiEndpoint: 'https://api.mbtq.dev',
  },
  {
    name: 'mbtq-dev',
    url: 'https://github.com/pinkycollie/mbtq.dev',
    branch: 'main',
    type: 'github',
    apiEndpoint: 'https://mbtq.dev/api',
  },
  {
    name: 'pinksync',
    url: 'https://github.com/pinkycollie/pinksync',
    branch: 'main',
    type: 'github',
    apiEndpoint: 'https://pinksync.io/api',
  },
  {
    name: '360magicians',
    url: 'https://github.com/pinkycollie/360magicians',
    branch: 'main',
    type: 'github',
    apiEndpoint: 'https://360magicians.com/api',
  },
  {
    name: 'vr4deaf',
    url: 'https://github.com/pinkycollie/vr4deaf',
    branch: 'main',
    type: 'github',
    apiEndpoint: 'https://vr4deaf.org/api',
  },
  {
    name: 'fibonrose-trust',
    url: 'https://github.com/fibonroseTrust',
    branch: 'main',
    type: 'github',
  },
  {
    name: 'deafauth',
    url: 'https://github.com/pinkycollie/deafauth',
    branch: 'main',
    type: 'github',
  },
  {
    name: 'mbtquniverse',
    url: 'https://github.com/pinkycollie/mbtquniverse',
    branch: 'main',
    type: 'github',
  },
];

// ==================== Multi-Repo Proxy Service ====================

export class MultiRepoProxyService {
  private repos: Map<string, RepoConfig> = new Map();
  private incomingQueue: IncomingRequest[] = [];
  private proxyService: HttpsProxyService;
  private maxQueueSize = 89; // Fibonacci F(11)

  constructor(proxyService: HttpsProxyService) {
    this.proxyService = proxyService;
    
    // Initialize with MBTQ repos
    MBTQ_REPOS.forEach(repo => {
      this.repos.set(repo.name, repo);
    });
  }

  /**
   * Add a repo to sync
   */
  addRepo(config: RepoConfig): void {
    this.repos.set(config.name, config);
  }

  /**
   * Get all configured repos
   */
  getRepos(): RepoConfig[] {
    return Array.from(this.repos.values());
  }

  /**
   * Queue an incoming request for processing
   */
  async queueIncoming(request: Omit<IncomingRequest, 'id' | 'timestamp' | 'status'>): Promise<IncomingRequest> {
    const incoming: IncomingRequest = {
      ...request,
      id: `incoming_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date(),
      status: 'pending',
    };

    this.incomingQueue.push(incoming);

    // Trim queue if exceeds Fibonacci limit
    if (this.incomingQueue.length > this.maxQueueSize) {
      this.incomingQueue = this.incomingQueue.slice(-55); // F(10)
    }

    return incoming;
  }

  /**
   * Process incoming request with async/await
   */
  async processIncoming(requestId: string): Promise<IncomingRequest> {
    const request = this.incomingQueue.find(r => r.id === requestId);
    
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    request.status = 'processing';

    try {
      const result = await this.proxyService.request(request.url, {
        method: request.method,
        headers: request.headers as any,
        body: request.body ? JSON.stringify(request.body) : undefined,
      } as any);

      request.status = 'completed';
      request.response = result;
    } catch (error) {
      request.status = 'failed';
      request.response = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return request;
  }

  /**
   * POST to multiple repos with Promise.all
   */
  async postToRepos(
    repoNames: string[],
    path: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<SyncResult[]> {
    const promises = repoNames.map(async (repoName): Promise<SyncResult> => {
      const repo = this.repos.get(repoName);
      
      if (!repo) {
        return {
          repoName,
          success: false,
          timestamp: new Date(),
          message: `Repo ${repoName} not found`,
        };
      }

      if (!repo.apiEndpoint) {
        return {
          repoName,
          success: false,
          timestamp: new Date(),
          message: `Repo ${repoName} has no API endpoint configured`,
        };
      }

      try {
        const url = `${repo.apiEndpoint}${path}`;
        const result = await this.proxyService.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(body),
        } as any);

        return {
          repoName,
          success: result.statusCode >= 200 && result.statusCode < 300,
          timestamp: new Date(),
          message: `POST ${url}: ${result.statusCode}`,
          details: {
            statusCode: result.statusCode,
            headers: result.headers,
          },
        };
      } catch (error) {
        return {
          repoName,
          success: false,
          timestamp: new Date(),
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Sync across all MBTQ repos
   */
  async syncAll(path: string, body: unknown): Promise<SyncResult[]> {
    const repoNames = Array.from(this.repos.keys()).filter(
      name => this.repos.get(name)?.apiEndpoint
    );
    return this.postToRepos(repoNames, path, body);
  }

  /**
   * Get incoming queue
   */
  getIncomingQueue(): IncomingRequest[] {
    return [...this.incomingQueue];
  }

  /**
   * Get pending requests
   */
  getPendingRequests(): IncomingRequest[] {
    return this.incomingQueue.filter(r => r.status === 'pending');
  }

  /**
   * Process all pending requests
   */
  async processAllPending(): Promise<IncomingRequest[]> {
    const pending = this.getPendingRequests();
    const results = await Promise.all(
      pending.map(r => this.processIncoming(r.id))
    );
    return results;
  }
}

// ==================== Export Singleton ====================

export const httpsProxyService = new HttpsProxyService();
export const multiRepoProxyService = new MultiRepoProxyService(httpsProxyService);
