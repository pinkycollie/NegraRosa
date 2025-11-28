/**
 * Video Processing API Routes - MBTQ Ecosystem
 * 
 * FFmpeg-based video processing optimized for Deaf-first content.
 * Prioritizes visual quality over audio.
 */

import { Router, Request, Response } from 'express';
import { 
  videoProcessingService, 
  CompressionOptions 
} from '../services/VideoProcessingService';

const router = Router();

/**
 * POST /api/v1/video/register
 * Register a video in the library
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { 
      filename, 
      originalSize, 
      duration, 
      width, 
      height, 
      fps, 
      codec, 
      bitrate,
      hasAudio,
      hasCaptions,
      hasSignLanguage 
    } = req.body;

    const video = videoProcessingService.registerVideo({
      filename,
      originalSize,
      duration,
      width,
      height,
      fps,
      codec,
      bitrate,
      hasAudio: hasAudio ?? true,
      hasCaptions: hasCaptions ?? false,
      hasSignLanguage: hasSignLanguage ?? false,
    });

    res.status(201).json({
      success: true,
      video,
      visualFeedback: {
        icon: '🎬',
        status: 'success',
        message: `Video ${video.id} registered`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to register video',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Video registration failed',
      },
    });
  }
});

/**
 * GET /api/v1/video/library
 * Get paginated video library
 */
router.get('/library', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 21; // Fibonacci

  const result = videoProcessingService.getVideos(page, pageSize);

  res.json({
    success: true,
    ...result,
    visualFeedback: {
      icon: '📚',
      status: 'info',
      message: `Page ${result.page} of ${result.totalPages}`,
    },
  });
});

/**
 * POST /api/v1/video/compress
 * Create compression job
 */
router.post('/compress', (req: Request, res: Response) => {
  try {
    const { inputPath, outputPath, options } = req.body as {
      inputPath: string;
      outputPath: string;
      options: CompressionOptions;
    };

    const job = videoProcessingService.createCompressionJob(
      inputPath,
      outputPath,
      options
    );

    res.status(201).json({
      success: true,
      job,
      visualFeedback: {
        icon: '🎞️',
        status: 'success',
        message: `Compression job ${job.id} created`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create compression job',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Job creation failed',
      },
    });
  }
});

/**
 * GET /api/v1/video/jobs/:jobId
 * Get job status
 */
router.get('/jobs/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = videoProcessingService.getJob(jobId);

  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
      visualFeedback: {
        icon: '🔍',
        status: 'warning',
        message: `Job ${jobId} not found`,
      },
    });
  }

  res.json({
    success: true,
    job,
    visualFeedback: {
      icon: job.status === 'completed' ? '✅' : 
            job.status === 'failed' ? '❌' : 
            job.status === 'processing' ? '⏳' : '📋',
      status: job.status === 'completed' ? 'success' : 
              job.status === 'failed' ? 'error' : 'info',
      message: `Job status: ${job.status} (${job.progress}%)`,
    },
  });
});

/**
 * GET /api/v1/video/jobs
 * Get paginated job list
 */
router.get('/jobs', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 13; // Fibonacci

  const result = videoProcessingService.getJobs(page, pageSize);

  res.json({
    success: true,
    ...result,
    visualFeedback: {
      icon: '📋',
      status: 'info',
      message: `${result.totalCount} jobs total`,
    },
  });
});

/**
 * POST /api/v1/video/estimate
 * Estimate compression output
 */
router.post('/estimate', (req: Request, res: Response) => {
  try {
    const { inputSize, quality } = req.body as {
      inputSize: number;
      quality: CompressionOptions['quality'];
    };

    const estimate = videoProcessingService.estimateOutputSize(inputSize, quality);

    res.json({
      success: true,
      ...estimate,
      visualFeedback: {
        icon: '📊',
        status: 'info',
        message: `Estimated savings: ${Math.round((estimate.estimatedSavings / inputSize) * 100)}%`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to estimate',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Estimation failed',
      },
    });
  }
});

/**
 * POST /api/v1/video/command/compress
 * Generate FFmpeg compression command
 */
router.post('/command/compress', (req: Request, res: Response) => {
  try {
    const { inputPath, outputPath, options } = req.body as {
      inputPath: string;
      outputPath: string;
      options: CompressionOptions;
    };

    const command = videoProcessingService.generateCompressionCommand(
      inputPath,
      outputPath,
      options
    );

    res.json({
      success: true,
      command: `ffmpeg ${command.join(' ')}`,
      args: command,
      visualFeedback: {
        icon: '🔧',
        status: 'success',
        message: 'FFmpeg command generated',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate command',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Command generation failed',
      },
    });
  }
});

/**
 * POST /api/v1/video/command/thumbnail
 * Generate thumbnail command
 */
router.post('/command/thumbnail', (req: Request, res: Response) => {
  try {
    const { inputPath, outputPath, timestamp, width, height } = req.body;

    const command = videoProcessingService.generateThumbnailCommand(
      inputPath,
      outputPath,
      { timestamp, width, height }
    );

    res.json({
      success: true,
      command: `ffmpeg ${command.join(' ')}`,
      args: command,
      visualFeedback: {
        icon: '🖼️',
        status: 'success',
        message: 'Thumbnail command generated',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate command',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Command generation failed',
      },
    });
  }
});

/**
 * POST /api/v1/video/command/captions
 * Generate add captions command
 */
router.post('/command/captions', (req: Request, res: Response) => {
  try {
    const { videoPath, captionPath, outputPath, language, label } = req.body;

    const command = videoProcessingService.addCaptionsCommand(
      videoPath,
      captionPath,
      outputPath,
      { language, label }
    );

    res.json({
      success: true,
      command: `ffmpeg ${command.join(' ')}`,
      args: command,
      visualFeedback: {
        icon: '📝',
        status: 'success',
        message: 'Captions command generated (Deaf-first)',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate command',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Command generation failed',
      },
    });
  }
});

/**
 * POST /api/v1/video/command/signlanguage
 * Generate sign language overlay command
 */
router.post('/command/signlanguage', (req: Request, res: Response) => {
  try {
    const { mainVideoPath, overlayVideoPath, outputPath, position, size, language } = req.body;

    const command = videoProcessingService.addSignLanguageOverlayCommand(
      mainVideoPath,
      overlayVideoPath,
      outputPath,
      { position, size, language }
    );

    res.json({
      success: true,
      command: `ffmpeg ${command.join(' ')}`,
      args: command,
      visualFeedback: {
        icon: '🤟',
        status: 'success',
        message: `Sign language overlay (${language || 'ASL'}) command generated`,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate command',
      visualFeedback: {
        icon: '❌',
        status: 'error',
        message: 'Command generation failed',
      },
    });
  }
});

export default router;
