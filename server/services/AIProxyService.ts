/**
 * AI Proxy Service - MBTQ Ecosystem
 * 
 * Routes AI requests to appropriate providers:
 * - OpenAI (GPT-4, DALL-E)
 * - Google Vertex AI (Gemini, PaLM)
 * - Anthropic Claude
 * - Local models (Ollama)
 * 
 * Features:
 * - Rate limiting per user/pathway
 * - Cost tracking with GENERATIVE UNITS
 * - Deaf-first: Visual responses, no audio-only
 * - Accessibility metadata in responses
 * - Response caching with Fibonacci-based TTL
 */

import crypto from 'crypto';
import { cacheService, CacheService, FIBONACCI_TTL } from './CacheService';

// ==================== Types ====================

export type AIProvider = 'openai' | 'vertex' | 'anthropic' | 'ollama' | 'auto';

export type PathwayType = 'JOB' | 'BUSINESS' | 'DEVELOPER' | 'CREATIVE';

export interface AIProxyConfig {
  defaultProvider: AIProvider;
  enableCostTracking: boolean;
  maxTokensPerRequest: number;
  enableAccessibilityMetadata: boolean;
  enableCaching: boolean;
  cacheTTL: number;
}

export interface AIRequest {
  id: string;
  userId: string;
  pathway: PathwayType;
  provider: AIProvider;
  model: string;
  messages: AIMessage[];
  options?: AIRequestOptions;
  accessibilityPreferences?: AccessibilityPreferences;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  visualContent?: string; // For deaf-first: visual description
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  responseFormat?: 'text' | 'json' | 'visual';
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  signLanguageOverlay: boolean;
  captionsEnabled: boolean;
  hapticFeedback: boolean;
  visualDescriptions: boolean;
}

export interface AIResponse {
  id: string;
  requestId: string;
  provider: AIProvider;
  model: string;
  content: string;
  visualContent?: string;
  accessibilityMetadata?: AccessibilityMetadata;
  usage: AIUsage;
  cost: AICost;
  timestamp: Date;
}

export interface AccessibilityMetadata {
  hasVisualDescription: boolean;
  hasSignLanguageReference: boolean;
  captionAvailable: boolean;
  contrastRatio?: number;
  readabilityScore?: number;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AICost {
  generativeUnits: number;
  estimatedUSD: number;
  pathway: PathwayType;
}

export interface ProviderConfig {
  name: AIProvider;
  endpoint: string;
  apiKey?: string;
  projectId?: string;
  region?: string;
  models: string[];
  costPerToken: number;
}

// ==================== Provider Configurations ====================

const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'openai',
    endpoint: 'https://api.openai.com/v1',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3'],
    costPerToken: 0.00003, // GPT-4 average
  },
  vertex: {
    name: 'vertex',
    endpoint: 'https://{region}-aiplatform.googleapis.com/v1',
    models: ['gemini-pro', 'gemini-pro-vision', 'text-bison', 'chat-bison'],
    costPerToken: 0.000025,
  },
  anthropic: {
    name: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    costPerToken: 0.000024,
  },
  ollama: {
    name: 'ollama',
    endpoint: 'http://localhost:11434/api',
    models: ['llama2', 'mistral', 'codellama', 'neural-chat'],
    costPerToken: 0, // Local, no cost
  },
  auto: {
    name: 'auto',
    endpoint: '',
    models: [],
    costPerToken: 0,
  },
};

// ==================== Pathway Magician Configurations ====================

export interface PathwayMagician {
  type: PathwayType;
  name: string;
  description: string;
  systemPrompt: string;
  preferredProvider: AIProvider;
  preferredModel: string;
  maxGenerativeUnits: number;
  capabilities: string[];
}

const PATHWAY_MAGICIANS: Record<PathwayType, PathwayMagician> = {
  JOB: {
    type: 'JOB',
    name: 'Job Magician',
    description: 'Career development, job search, interview preparation',
    systemPrompt: `You are the Job Magician, an AI assistant specialized in career development for Deaf and hard-of-hearing professionals. 
    
Your responsibilities:
- Help with job search strategies accessible to Deaf users
- Prepare for interviews (video relay, in-person accommodations)
- Resume and cover letter optimization
- Career path guidance with accessibility considerations
- Workplace accommodation requests

Always provide visual-friendly responses. Avoid audio-only suggestions. Include accommodation tips.`,
    preferredProvider: 'openai',
    preferredModel: 'gpt-4-turbo',
    maxGenerativeUnits: 1000,
    capabilities: ['resume_review', 'interview_prep', 'job_search', 'accommodation_advice'],
  },
  BUSINESS: {
    type: 'BUSINESS',
    name: 'Business Magician',
    description: 'Business automation, client management, Taskade integration',
    systemPrompt: `You are the Business Magician, an AI assistant for Deaf entrepreneurs and business specialists.

Your responsibilities:
- Business process automation strategies
- Client-facing communication templates (visual-first)
- Taskade workflow integration and optimization
- Proposal and contract drafting
- Marketing strategies for Deaf-owned businesses

Focus on automation that reduces communication barriers. Integrate with visual tools like Taskade.`,
    preferredProvider: 'openai',
    preferredModel: 'gpt-4-turbo',
    maxGenerativeUnits: 2000,
    capabilities: ['automation', 'client_management', 'taskade_integration', 'marketing'],
  },
  DEVELOPER: {
    type: 'DEVELOPER',
    name: 'Developer Magician',
    description: 'Code generation, debugging, architecture, AI SDK integration',
    systemPrompt: `You are the Developer Magician, an AI coding assistant optimized for the MBTQ ecosystem.

Your responsibilities:
- Code generation and review
- Debugging assistance with visual error explanations
- Architecture design for accessible applications
- Integration with OpenAI SDK, AI SDK, Vertex AI
- Best practices for Deaf-first development

Provide code with clear comments. Explain errors visually. Focus on accessibility in all code suggestions.`,
    preferredProvider: 'anthropic',
    preferredModel: 'claude-3-sonnet',
    maxGenerativeUnits: 5000,
    capabilities: ['code_generation', 'debugging', 'architecture', 'sdk_integration', 'accessibility_audit'],
  },
  CREATIVE: {
    type: 'CREATIVE',
    name: 'Creative Magician',
    description: 'Design, content creation, visual storytelling, VR experiences',
    systemPrompt: `You are the Creative Magician, an AI assistant for visual content and creative projects.

Your responsibilities:
- Visual design suggestions and feedback
- Content creation for Deaf audiences
- VR/AR experience design for vr4deaf.org
- ASL-friendly video script writing
- Accessible infographic and presentation design

Prioritize visual communication. All content should work without audio. Include ASL considerations.`,
    preferredProvider: 'openai',
    preferredModel: 'gpt-4-turbo',
    maxGenerativeUnits: 3000,
    capabilities: ['design_feedback', 'content_creation', 'vr_design', 'video_scripting', 'infographics'],
  },
};

// ==================== AI Proxy Service ====================

export class AIProxyService {
  private config: AIProxyConfig;
  private requestLog: Map<string, AIRequest[]> = new Map();
  private usageTracking: Map<string, number> = new Map();

  constructor(config?: Partial<AIProxyConfig>) {
    this.config = {
      defaultProvider: 'openai',
      enableCostTracking: true,
      maxTokensPerRequest: 4096,
      enableAccessibilityMetadata: true,
      enableCaching: true,
      cacheTTL: FIBONACCI_TTL.EXTENDED,
      ...config,
    };
  }

  /**
   * Get the appropriate magician for a pathway
   */
  getMagician(pathway: PathwayType): PathwayMagician {
    return PATHWAY_MAGICIANS[pathway];
  }

  /**
   * List all available magicians
   */
  listMagicians(): PathwayMagician[] {
    return Object.values(PATHWAY_MAGICIANS);
  }

  /**
   * Create an AI request with pathway context
   */
  async createRequest(
    userId: string,
    pathway: PathwayType,
    userMessage: string,
    options?: Partial<AIRequestOptions>,
    accessibilityPrefs?: AccessibilityPreferences
  ): Promise<AIRequest> {
    const magician = this.getMagician(pathway);
    const requestId = this.generateRequestId();

    const request: AIRequest = {
      id: requestId,
      userId,
      pathway,
      provider: magician.preferredProvider,
      model: magician.preferredModel,
      messages: [
        {
          role: 'system',
          content: magician.systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
          visualContent: this.generateVisualDescription(userMessage),
        },
      ],
      options: {
        temperature: 0.7,
        maxTokens: this.config.maxTokensPerRequest,
        stream: false,
        responseFormat: 'text',
        ...options,
      },
      accessibilityPreferences: accessibilityPrefs || {
        highContrast: false,
        signLanguageOverlay: false,
        captionsEnabled: true,
        hapticFeedback: false,
        visualDescriptions: true,
      },
    };

    // Log the request
    const userRequests = this.requestLog.get(userId) || [];
    userRequests.push(request);
    this.requestLog.set(userId, userRequests);

    return request;
  }

  /**
   * Process an AI request with caching
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    // Check usage limits
    const currentUsage = this.usageTracking.get(request.userId) || 0;
    const magician = this.getMagician(request.pathway);
    
    if (currentUsage >= magician.maxGenerativeUnits) {
      throw new Error(`Usage limit reached for ${request.pathway} pathway. Max: ${magician.maxGenerativeUnits} GENERATIVE UNITS`);
    }

    // Check cache first if enabled
    if (this.config.enableCaching) {
      const messageHash = CacheService.hashKey(
        request.messages.map(m => m.content).join('|')
      );
      const cachedResponse = await cacheService.getCachedAIResponse(
        request.pathway,
        messageHash
      );
      
      if (cachedResponse) {
        // Return cached response with updated metadata
        return {
          ...cachedResponse,
          id: this.generateRequestId(),
          requestId: request.id,
          timestamp: new Date(),
          cached: true,
        };
      }
    }

    // Simulate API call (in production, this would call the actual provider)
    const response = await this.simulateProviderCall(request);

    // Cache the response
    if (this.config.enableCaching) {
      const messageHash = CacheService.hashKey(
        request.messages.map(m => m.content).join('|')
      );
      await cacheService.cacheAIResponse(
        request.pathway,
        messageHash,
        response,
        this.config.cacheTTL
      );
    }

    // Track usage
    const newUsage = currentUsage + response.cost.generativeUnits;
    this.usageTracking.set(request.userId, newUsage);

    return response;
  }

  /**
   * Simulate provider API call (placeholder for actual implementation)
   */
  private async simulateProviderCall(request: AIRequest): Promise<AIResponse> {
    const providerConfig = PROVIDER_CONFIGS[request.provider];
    
    // Simulate token usage
    const promptTokens = this.estimateTokens(request.messages.map(m => m.content).join(' '));
    const completionTokens = Math.floor(promptTokens * 0.8);
    const totalTokens = promptTokens + completionTokens;

    // Calculate cost in GENERATIVE UNITS (1 GU = $0.001)
    const estimatedUSD = totalTokens * providerConfig.costPerToken;
    const generativeUnits = Math.ceil(estimatedUSD * 1000);

    const response: AIResponse = {
      id: this.generateRequestId(),
      requestId: request.id,
      provider: request.provider,
      model: request.model,
      content: `[Simulated response from ${request.provider}/${request.model}]\n\nThis is a placeholder response. In production, this would contain the actual AI-generated content based on the ${request.pathway} pathway context.`,
      visualContent: request.accessibilityPreferences?.visualDescriptions 
        ? 'Visual description: AI response displayed as text with high contrast formatting.'
        : undefined,
      accessibilityMetadata: this.config.enableAccessibilityMetadata ? {
        hasVisualDescription: true,
        hasSignLanguageReference: false,
        captionAvailable: true,
        contrastRatio: 7.5,
        readabilityScore: 85,
      } : undefined,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      cost: {
        generativeUnits,
        estimatedUSD,
        pathway: request.pathway,
      },
      timestamp: new Date(),
    };

    return response;
  }

  /**
   * Get provider configuration for direct SDK integration
   */
  getProviderConfig(provider: AIProvider): ProviderConfig {
    return PROVIDER_CONFIGS[provider];
  }

  /**
   * Auto-select best provider based on request type
   */
  autoSelectProvider(request: Partial<AIRequest>): AIProvider {
    // If pathway specified, use magician's preferred provider
    if (request.pathway) {
      return this.getMagician(request.pathway).preferredProvider;
    }

    // Check for code-related requests
    if (request.messages?.some(m => 
      m.content.toLowerCase().includes('code') || 
      m.content.toLowerCase().includes('debug') ||
      m.content.toLowerCase().includes('function')
    )) {
      return 'anthropic'; // Claude is great for code
    }

    // Check for creative/image requests
    if (request.messages?.some(m => 
      m.content.toLowerCase().includes('image') || 
      m.content.toLowerCase().includes('design') ||
      m.content.toLowerCase().includes('visual')
    )) {
      return 'openai'; // DALL-E for images
    }

    // Default to OpenAI
    return 'openai';
  }

  /**
   * Get usage statistics for a user
   */
  getUsageStats(userId: string): { 
    totalGenerativeUnits: number; 
    requestCount: number;
    byPathway: Record<PathwayType, number>;
  } {
    const requests = this.requestLog.get(userId) || [];
    const byPathway: Record<PathwayType, number> = {
      JOB: 0,
      BUSINESS: 0,
      DEVELOPER: 0,
      CREATIVE: 0,
    };

    requests.forEach(r => {
      byPathway[r.pathway]++;
    });

    return {
      totalGenerativeUnits: this.usageTracking.get(userId) || 0,
      requestCount: requests.length,
      byPathway,
    };
  }

  /**
   * Generate SDK integration code for a provider
   */
  generateSDKCode(provider: AIProvider, pathway: PathwayType): string {
    const magician = this.getMagician(pathway);
    const config = PROVIDER_CONFIGS[provider];

    switch (provider) {
      case 'openai':
        return `
// OpenAI SDK Integration for ${magician.name}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: '${magician.preferredModel}',
  messages: [
    { role: 'system', content: \`${magician.systemPrompt.substring(0, 100)}...\` },
    { role: 'user', content: userMessage }
  ],
  temperature: 0.7,
  max_tokens: 4096,
});
`;

      case 'vertex':
        return `
// Vertex AI SDK Integration for ${magician.name}
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: 'us-central1',
});

const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-pro',
});

const response = await model.generateContent({
  contents: [
    { role: 'user', parts: [{ text: userMessage }] }
  ],
  systemInstruction: { parts: [{ text: \`${magician.systemPrompt.substring(0, 100)}...\` }] },
});
`;

      case 'anthropic':
        return `
// Anthropic SDK Integration for ${magician.name}
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: '${magician.preferredModel}',
  max_tokens: 4096,
  system: \`${magician.systemPrompt.substring(0, 100)}...\`,
  messages: [
    { role: 'user', content: userMessage }
  ],
});
`;

      default:
        return `// No SDK code available for ${provider}`;
    }
  }

  // ==================== Helper Methods ====================

  private generateRequestId(): string {
    return `ai_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateVisualDescription(content: string): string {
    // Simple visual description generator
    return `Text content: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// ==================== Export Singleton ====================

export const aiProxyService = new AIProxyService();
