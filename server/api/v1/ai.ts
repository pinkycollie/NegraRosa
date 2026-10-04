/**
 * AI Proxy API Routes
 * 
 * Endpoints for AI proxy service with pathway-based magicians
 */

import { Router, Request, Response } from 'express';
import { aiProxyService, PathwayType, AIProvider } from '../../services/AIProxyService';

const router = Router();

// ==================== Types ====================

interface AIRequestBody {
  pathway: PathwayType;
  message: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    responseFormat?: 'text' | 'json' | 'visual';
  };
  accessibilityPreferences?: {
    highContrast?: boolean;
    signLanguageOverlay?: boolean;
    captionsEnabled?: boolean;
    hapticFeedback?: boolean;
    visualDescriptions?: boolean;
  };
}

// ==================== Routes ====================

/**
 * GET /api/v1/ai/status
 * Check AI proxy service status
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ai-proxy',
    version: '1.0.0',
    providers: ['openai', 'vertex', 'anthropic', 'ollama'],
    pathways: ['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'],
    deafFirst: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/ai/magicians
 * List all available pathway magicians
 */
router.get('/magicians', (_req: Request, res: Response) => {
  const magicians = aiProxyService.listMagicians();
  
  res.json({
    success: true,
    magicians: magicians.map(m => ({
      type: m.type,
      name: m.name,
      description: m.description,
      provider: m.preferredProvider,
      model: m.preferredModel,
      maxGenerativeUnits: m.maxGenerativeUnits,
      capabilities: m.capabilities,
    })),
    accessibility: {
      visualDescriptions: true,
      captionsEnabled: true,
      highContrastSupported: true,
    },
  });
});

/**
 * GET /api/v1/ai/magicians/:pathway
 * Get details for a specific pathway magician
 */
router.get('/magicians/:pathway', (req: Request, res: Response) => {
  const pathway = req.params.pathway?.toUpperCase() as PathwayType;
  
  if (!['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'].includes(pathway)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid pathway',
      validPathways: ['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'],
    });
  }

  const magician = aiProxyService.getMagician(pathway);
  
  res.json({
    success: true,
    magician: {
      type: magician.type,
      name: magician.name,
      description: magician.description,
      systemPrompt: magician.systemPrompt,
      provider: magician.preferredProvider,
      model: magician.preferredModel,
      maxGenerativeUnits: magician.maxGenerativeUnits,
      capabilities: magician.capabilities,
    },
  });
});

/**
 * POST /api/v1/ai/request
 * Create and process an AI request
 */
router.post('/request', async (req: Request, res: Response) => {
  try {
    const body = req.body as AIRequestBody;
    
    // Validate pathway
    if (!body.pathway || !['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'].includes(body.pathway)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing pathway',
        validPathways: ['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'],
      });
    }

    // Validate message
    if (!body.message || body.message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get user ID from auth (or use placeholder for now)
    const userId = (req as any).userId || 'anonymous';

    // Create request
    const aiRequest = await aiProxyService.createRequest(
      userId,
      body.pathway,
      body.message,
      body.options,
      body.accessibilityPreferences ? {
        highContrast: body.accessibilityPreferences.highContrast ?? false,
        signLanguageOverlay: body.accessibilityPreferences.signLanguageOverlay ?? false,
        captionsEnabled: body.accessibilityPreferences.captionsEnabled ?? true,
        hapticFeedback: body.accessibilityPreferences.hapticFeedback ?? false,
        visualDescriptions: body.accessibilityPreferences.visualDescriptions ?? true,
      } : undefined
    );

    // Process request
    const response = await aiProxyService.processRequest(aiRequest);

    res.json({
      success: true,
      response: {
        id: response.id,
        requestId: response.requestId,
        provider: response.provider,
        model: response.model,
        content: response.content,
        visualContent: response.visualContent,
        accessibilityMetadata: response.accessibilityMetadata,
        usage: response.usage,
        cost: response.cost,
        timestamp: response.timestamp,
      },
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
 * GET /api/v1/ai/usage
 * Get usage statistics for current user
 */
router.get('/usage', (req: Request, res: Response) => {
  const userId = (req as any).userId || 'anonymous';
  const stats = aiProxyService.getUsageStats(userId);

  res.json({
    success: true,
    userId,
    usage: stats,
  });
});

/**
 * GET /api/v1/ai/providers
 * List available AI providers
 */
router.get('/providers', (_req: Request, res: Response) => {
  const providers: AIProvider[] = ['openai', 'vertex', 'anthropic', 'ollama'];
  
  res.json({
    success: true,
    providers: providers.map(p => ({
      name: p,
      config: aiProxyService.getProviderConfig(p),
    })),
  });
});

/**
 * GET /api/v1/ai/sdk/:provider/:pathway
 * Generate SDK integration code for a provider and pathway
 */
router.get('/sdk/:provider/:pathway', (req: Request, res: Response) => {
  const provider = req.params.provider?.toLowerCase() as AIProvider;
  const pathway = req.params.pathway?.toUpperCase() as PathwayType;

  if (!['openai', 'vertex', 'anthropic', 'ollama'].includes(provider)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider',
      validProviders: ['openai', 'vertex', 'anthropic', 'ollama'],
    });
  }

  if (!['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'].includes(pathway)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid pathway',
      validPathways: ['JOB', 'BUSINESS', 'DEVELOPER', 'CREATIVE'],
    });
  }

  const code = aiProxyService.generateSDKCode(provider, pathway);

  res.json({
    success: true,
    provider,
    pathway,
    code,
  });
});

/**
 * POST /api/v1/ai/auto-select
 * Auto-select the best provider for a request
 */
router.post('/auto-select', (req: Request, res: Response) => {
  const { message, pathway } = req.body;

  const selectedProvider = aiProxyService.autoSelectProvider({
    pathway,
    messages: message ? [{ role: 'user', content: message }] : [],
  });

  res.json({
    success: true,
    selectedProvider,
    reason: pathway 
      ? `Based on ${pathway} pathway preference`
      : 'Based on message content analysis',
  });
});

export default router;
