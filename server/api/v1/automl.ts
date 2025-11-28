/**
 * AutoML API Routes - MBTQ Ecosystem
 * 
 * AI-powered code generation, optimization, and full-stack maintenance.
 * Uses Fibonacci-based cost tracking and caching.
 */

import { Router, Request, Response } from 'express';
import { autoMLService, TaskType, AutoMLPhase, TaskInput } from '../services/AutoMLService';

const router = Router();

/**
 * POST /api/v1/automl/tasks
 * Create a new AutoML task
 */
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { type, phase, input } = req.body as {
      type: TaskType;
      phase: AutoMLPhase;
      input: TaskInput;
    };

    if (!type || !phase || !input) {
      return res.status(400).json({
        error: 'Missing required fields: type, phase, input',
        visualFeedback: {
          icon: '⚠️',
          status: 'warning',
          message: 'Invalid request parameters',
        },
      });
    }

    const task = await autoMLService.createTask(type, phase, input);
    
    res.status(201).json({
      success: true,
      task,
      visualFeedback: {
        icon: '✅',
        status: 'success',
        message: `Task ${task.id} created`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create task',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Task creation failed',
      },
    });
  }
});

/**
 * POST /api/v1/automl/tasks/:taskId/execute
 * Execute an AutoML task
 */
router.post('/tasks/:taskId/execute', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await autoMLService.executeTask(taskId);
    
    res.json({
      success: true,
      task,
      visualFeedback: task.output?.visualFeedback || {
        icon: '✅',
        status: 'success',
        message: 'Task executed',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to execute task',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Task execution failed',
      },
    });
  }
});

/**
 * GET /api/v1/automl/tasks/:taskId
 * Get task status and result
 */
router.get('/tasks/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = autoMLService.getTask(taskId);
  
  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
      visualFeedback: {
        icon: '🔍',
        status: 'warning',
        message: `Task ${taskId} not found`,
      },
    });
  }
  
  res.json({
    success: true,
    task,
    visualFeedback: {
      icon: task.status === 'completed' ? '✅' : task.status === 'failed' ? '❌' : '⏳',
      status: task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : 'info',
      message: `Task status: ${task.status}`,
    },
  });
});

/**
 * GET /api/v1/automl/stats
 * Get AutoML service statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  const stats = autoMLService.getStats();
  
  res.json({
    success: true,
    stats,
    visualFeedback: {
      icon: '📊',
      status: 'info',
      message: `${stats.completedTasks} tasks completed, ${stats.savedCost} units saved`,
    },
  });
});

/**
 * POST /api/v1/automl/generate-code
 * Quick code generation endpoint
 */
router.post('/generate-code', async (req: Request, res: Response) => {
  try {
    const { description, language, framework } = req.body;

    const task = await autoMLService.createTask('code-generation', 'BUILD', {
      description,
      language: language || 'typescript',
      framework: framework || 'node',
      constraints: { quality: 'quality' },
    });

    const result = await autoMLService.executeTask(task.id);
    
    res.json({
      success: true,
      code: result.output?.result,
      files: result.output?.files,
      metrics: result.output?.metrics,
      visualFeedback: result.output?.visualFeedback,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Code generation failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Code generation failed',
      },
    });
  }
});

/**
 * POST /api/v1/automl/review-code
 * Quick code review endpoint
 */
router.post('/review-code', async (req: Request, res: Response) => {
  try {
    const { code, language, description } = req.body;

    const task = await autoMLService.createTask('code-review', 'SERVE', {
      description: description || 'Review this code',
      language,
      files: [{ path: 'review.ts', content: code, language: language || 'typescript' }],
    });

    const result = await autoMLService.executeTask(task.id);
    
    res.json({
      success: true,
      review: result.output?.result,
      suggestions: result.output?.suggestions,
      metrics: result.output?.metrics,
      visualFeedback: result.output?.visualFeedback,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Code review failed',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Code review failed',
      },
    });
  }
});

export default router;
