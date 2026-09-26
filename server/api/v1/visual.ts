/**
 * Visual Protocol API Routes - MBTQ Ecosystem
 * 
 * Synchronous Visual Protocol: Bypass audio dependency and create meaning
 * through spatial and visual logic. DeafAUTH philosophy: making invisible visible.
 * 
 * Architecture:
 * - Client: IDEA → BUILD → GROW → MANAGED
 * - Server: BUILD → SERVE → EVENT
 */

import { Router, Request, Response } from 'express';
import { 
  visualProtocolService, 
  ClientPhase, 
  ServerPhase 
} from '../services/VisualProtocolService';

const router = Router();

/**
 * POST /api/v1/visual/state
 * Create a new visual state
 */
router.post('/state', (req: Request, res: Response) => {
  try {
    const { clientPhase, serverPhase } = req.body as {
      clientPhase: ClientPhase;
      serverPhase: ServerPhase;
    };

    const state = visualProtocolService.createState(
      clientPhase || 'IDEA',
      serverPhase || 'BUILD'
    );

    res.status(201).json({
      success: true,
      state,
      visualFeedback: {
        icon: '📊',
        status: 'success',
        message: `Visual state ${state.id} created`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create visual state',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'State creation failed',
      },
    });
  }
});

/**
 * GET /api/v1/visual/state/:stateId
 * Get visual state by ID
 */
router.get('/state/:stateId', (req: Request, res: Response) => {
  const { stateId } = req.params;
  const state = visualProtocolService.getState(stateId);

  if (!state) {
    return res.status(404).json({
      error: 'Visual state not found',
      visualFeedback: {
        icon: '🔍',
        status: 'warning',
        message: `State ${stateId} not found`,
      },
    });
  }

  res.json({
    success: true,
    state,
    visualFeedback: {
      icon: '✅',
      status: 'success',
      message: `State retrieved: ${state.clientPhase} / ${state.serverPhase}`,
    },
  });
});

/**
 * POST /api/v1/visual/state/:stateId/element
 * Add element to visual state
 */
router.post('/state/:stateId/element', (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const { type, position, content, style, metadata } = req.body;

    const element = visualProtocolService.addElement(
      stateId,
      type,
      position,
      content,
      { style, metadata }
    );

    if (!element) {
      return res.status(404).json({
        error: 'State not found',
        visualFeedback: {
          icon: '❌',
          status: 'error',
          message: 'Cannot add element to non-existent state',
        },
      });
    }

    res.status(201).json({
      success: true,
      element,
      visualFeedback: {
        icon: '➕',
        status: 'success',
        message: `Element ${element.id} added`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add element',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Element creation failed',
      },
    });
  }
});

/**
 * POST /api/v1/visual/state/:stateId/annotation
 * Add floating annotation (DeafAUTH: making invisible visible)
 */
router.post('/state/:stateId/annotation', (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const { content, position, targetId, icon, floating, visibility } = req.body;

    const annotation = visualProtocolService.addAnnotation(
      stateId,
      content,
      position,
      { targetId, icon, floating, visibility }
    );

    if (!annotation) {
      return res.status(404).json({
        error: 'State not found',
        visualFeedback: {
          icon: '❌',
          status: 'error',
          message: 'Cannot add annotation to non-existent state',
        },
      });
    }

    res.status(201).json({
      success: true,
      annotation,
      visualFeedback: {
        icon: '📌',
        status: 'success',
        message: `Annotation ${annotation.id} added (floating: ${annotation.floating})`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add annotation',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Annotation creation failed',
      },
    });
  }
});

/**
 * POST /api/v1/visual/state/:stateId/flow
 * Add visual flow between elements
 */
router.post('/state/:stateId/flow', (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const { sourceId, targetId, label, animated, direction } = req.body;

    const flow = visualProtocolService.addFlow(
      stateId,
      sourceId,
      targetId,
      { label, animated, direction }
    );

    if (!flow) {
      return res.status(404).json({
        error: 'State not found',
        visualFeedback: {
          icon: '❌',
          status: 'error',
          message: 'Cannot add flow to non-existent state',
        },
      });
    }

    res.status(201).json({
      success: true,
      flow,
      visualFeedback: {
        icon: '🔀',
        status: 'success',
        message: `Flow ${flow.id} created`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add flow',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Flow creation failed',
      },
    });
  }
});

/**
 * POST /api/v1/visual/state/:stateId/transition/client
 * Transition client phase (IDEA → BUILD → GROW → MANAGED)
 */
router.post('/state/:stateId/transition/client', (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const { phase } = req.body as { phase: ClientPhase };

    const success = visualProtocolService.transitionClientPhase(stateId, phase);

    if (!success) {
      return res.status(404).json({
        error: 'State not found',
        visualFeedback: {
          icon: '❌',
          status: 'error',
          message: 'Cannot transition non-existent state',
        },
      });
    }

    const phaseInfo = visualProtocolService.getClientPhaseInfo(phase);

    res.json({
      success: true,
      phase,
      phaseInfo,
      visualFeedback: {
        icon: phaseInfo.icon,
        status: 'success',
        message: `Transitioned to ${phase}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to transition',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Transition failed',
      },
    });
  }
});

/**
 * POST /api/v1/visual/state/:stateId/transition/server
 * Transition server phase (BUILD → SERVE → EVENT)
 */
router.post('/state/:stateId/transition/server', (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const { phase } = req.body as { phase: ServerPhase };

    const success = visualProtocolService.transitionServerPhase(stateId, phase);

    if (!success) {
      return res.status(404).json({
        error: 'State not found',
        visualFeedback: {
          icon: '❌',
          status: 'error',
          message: 'Cannot transition non-existent state',
        },
      });
    }

    const phaseInfo = visualProtocolService.getServerPhaseInfo(phase);

    res.json({
      success: true,
      phase,
      phaseInfo,
      visualFeedback: {
        icon: phaseInfo.icon,
        status: 'success',
        message: `Server transitioned to ${phase}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to transition',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Transition failed',
      },
    });
  }
});

/**
 * POST /api/v1/visual/state/:stateId/transparency
 * Create transparency view (making invisible systems visible)
 */
router.post('/state/:stateId/transparency', (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const { systemName, components } = req.body;

    const elements = visualProtocolService.createTransparencyView(
      stateId,
      systemName,
      components
    );

    if (elements.length === 0) {
      return res.status(404).json({
        error: 'State not found or no components provided',
        visualFeedback: {
          icon: '❌',
          status: 'error',
          message: 'Cannot create transparency view',
        },
      });
    }

    res.status(201).json({
      success: true,
      elements,
      visualFeedback: {
        icon: '🔍',
        status: 'success',
        message: `Transparency view created for ${systemName}`,
        details: [`${elements.length} elements visualized`],
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create transparency view',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Transparency view creation failed',
      },
    });
  }
});

/**
 * GET /api/v1/visual/phases/client
 * Get all client phases
 */
router.get('/phases/client', (_req: Request, res: Response) => {
  const phases: ClientPhase[] = ['IDEA', 'BUILD', 'GROW', 'MANAGED'];
  
  const phaseInfo = phases.map(phase => ({
    phase,
    ...visualProtocolService.getClientPhaseInfo(phase),
  }));

  res.json({
    success: true,
    phases: phaseInfo,
    visualFeedback: {
      icon: '📋',
      status: 'info',
      message: 'Client lifecycle: IDEA → BUILD → GROW → MANAGED',
    },
  });
});

/**
 * GET /api/v1/visual/phases/server
 * Get all server phases
 */
router.get('/phases/server', (_req: Request, res: Response) => {
  const phases: ServerPhase[] = ['BUILD', 'SERVE', 'EVENT'];
  
  const phaseInfo = phases.map(phase => ({
    phase,
    ...visualProtocolService.getServerPhaseInfo(phase),
  }));

  res.json({
    success: true,
    phases: phaseInfo,
    visualFeedback: {
      icon: '📋',
      status: 'info',
      message: 'Server lifecycle: BUILD → SERVE → EVENT',
    },
  });
});

export default router;
