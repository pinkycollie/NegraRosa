/**
 * Video Processing Service - MBTQ Ecosystem
 * 
 * FFmpeg-based video processing with AI-powered compression
 * optimized for Deaf-first content (focus on visual quality).
 * 
 * Features:
 * - FFmpeg video compression with visual quality priority
 * - Subtitle/caption extraction and embedding
 * - Sign language overlay support
 * - Thumbnail generation
 * - Cost-optimized storage
 * - Pagination for video libraries
 */

import crypto from 'crypto';
import { spawn } from 'child_process';
import path from 'path';

// ==================== Types ====================

export interface VideoMetadata {
  id: string;
  filename: string;
  originalSize: number;
  compressedSize?: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  hasAudio: boolean;
  hasCaptions: boolean;
  hasSignLanguage: boolean;
  createdAt: Date;
  processedAt?: Date;
}

export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high' | 'visual-first';
  maxWidth?: number;
  maxHeight?: number;
  targetBitrate?: number;
  fps?: number;
  removeAudio?: boolean;
  preserveSubtitles?: boolean;
  outputFormat?: 'mp4' | 'webm' | 'hls';
}

export interface CaptionTrack {
  id: string;
  language: string;
  label: string;
  format: 'vtt' | 'srt' | 'ass';
  content: string;
  isDefault: boolean;
}

export interface SignLanguageOverlay {
  id: string;
  language: 'ASL' | 'BSL' | 'Auslan' | 'Other';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: number; // Percentage of video width
  videoPath: string;
}

export interface VideoJob {
  id: string;
  type: 'compress' | 'extract-captions' | 'add-captions' | 'add-overlay' | 'thumbnail';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputPath: string;
  outputPath?: string;
  options: Record<string, unknown>;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface PaginatedVideos {
  videos: VideoMetadata[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ==================== Compression Presets ====================

const COMPRESSION_PRESETS: Record<CompressionOptions['quality'], {
  crf: number;
  preset: string;
  maxBitrate: string;
  audioCodec: string;
  audioBitrate: string;
}> = {
  low: {
    crf: 28,
    preset: 'faster',
    maxBitrate: '1000k',
    audioCodec: 'aac',
    audioBitrate: '64k',
  },
  medium: {
    crf: 23,
    preset: 'medium',
    maxBitrate: '2500k',
    audioCodec: 'aac',
    audioBitrate: '128k',
  },
  high: {
    crf: 18,
    preset: 'slow',
    maxBitrate: '5000k',
    audioCodec: 'aac',
    audioBitrate: '192k',
  },
  // Visual-first: Prioritize visual quality, minimize audio
  'visual-first': {
    crf: 17,
    preset: 'slow',
    maxBitrate: '6000k',
    audioCodec: 'aac',
    audioBitrate: '48k', // Minimal audio for Deaf users who may have some hearing
  },
};

// ==================== Video Processing Service ====================

export class VideoProcessingService {
  private videos: Map<string, VideoMetadata> = new Map();
  private jobs: Map<string, VideoJob> = new Map();
  private ffmpegPath: string;

  constructor(ffmpegPath?: string) {
    this.ffmpegPath = ffmpegPath || 'ffmpeg';
  }

  /**
   * Register a video in the library
   */
  registerVideo(metadata: Omit<VideoMetadata, 'id' | 'createdAt'>): VideoMetadata {
    const video: VideoMetadata = {
      id: this.generateId('vid'),
      ...metadata,
      createdAt: new Date(),
    };

    this.videos.set(video.id, video);
    return video;
  }

  /**
   * Get paginated video list
   */
  getVideos(page: number = 1, pageSize: number = 21): PaginatedVideos {
    // Use Fibonacci number (21) as default page size
    const allVideos = Array.from(this.videos.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalCount = allVideos.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;
    const videos = allVideos.slice(offset, offset + pageSize);

    return {
      videos,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Create compression job
   */
  createCompressionJob(
    inputPath: string,
    outputPath: string,
    options: CompressionOptions
  ): VideoJob {
    const job: VideoJob = {
      id: this.generateId('job'),
      type: 'compress',
      status: 'pending',
      inputPath,
      outputPath,
      options,
      progress: 0,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Generate FFmpeg compression command
   */
  generateCompressionCommand(
    inputPath: string,
    outputPath: string,
    options: CompressionOptions
  ): string[] {
    const preset = COMPRESSION_PRESETS[options.quality];
    const args: string[] = [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', preset.preset,
      '-crf', String(preset.crf),
      '-maxrate', preset.maxBitrate,
      '-bufsize', `${parseInt(preset.maxBitrate) * 2}k`,
    ];

    // Video scaling
    if (options.maxWidth || options.maxHeight) {
      const scale = `scale='min(${options.maxWidth || 'iw'},iw)':'min(${options.maxHeight || 'ih'},ih)':force_original_aspect_ratio=decrease`;
      args.push('-vf', scale);
    }

    // Frame rate
    if (options.fps) {
      args.push('-r', String(options.fps));
    }

    // Audio handling
    if (options.removeAudio) {
      args.push('-an');
    } else {
      args.push('-c:a', preset.audioCodec, '-b:a', preset.audioBitrate);
    }

    // Subtitles
    if (options.preserveSubtitles) {
      args.push('-c:s', 'mov_text');
    }

    // Output format
    args.push('-f', options.outputFormat || 'mp4');
    args.push('-movflags', '+faststart'); // Web optimization
    args.push('-y'); // Overwrite output
    args.push(outputPath);

    return args;
  }

  /**
   * Execute compression job (async)
   */
  async executeCompressionJob(jobId: string): Promise<VideoJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    job.status = 'processing';
    job.startedAt = new Date();

    const options = job.options as CompressionOptions;
    const args = this.generateCompressionCommand(
      job.inputPath,
      job.outputPath!,
      options
    );

    return new Promise((resolve, reject) => {
      const process = spawn(this.ffmpegPath, args);
      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        // Parse progress from stderr
        const timeMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          // Update progress estimation
          job.progress = Math.min(99, job.progress + 1);
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          job.status = 'completed';
          job.progress = 100;
          job.completedAt = new Date();
          resolve(job);
        } else {
          job.status = 'failed';
          job.error = `FFmpeg exited with code ${code}`;
          reject(new Error(job.error));
        }
      });

      process.on('error', (error) => {
        job.status = 'failed';
        job.error = error.message;
        reject(error);
      });
    });
  }

  /**
   * Generate thumbnail for video
   */
  generateThumbnailCommand(
    inputPath: string,
    outputPath: string,
    options?: {
      timestamp?: string;
      width?: number;
      height?: number;
    }
  ): string[] {
    const timestamp = options?.timestamp || '00:00:01';
    const width = options?.width || 320;
    const height = options?.height || 180;

    return [
      '-i', inputPath,
      '-ss', timestamp,
      '-vframes', '1',
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
      '-y',
      outputPath,
    ];
  }

  /**
   * Extract captions from video
   */
  extractCaptionsCommand(
    inputPath: string,
    outputPath: string,
    format: CaptionTrack['format'] = 'vtt'
  ): string[] {
    return [
      '-i', inputPath,
      '-map', '0:s:0',
      '-f', format === 'vtt' ? 'webvtt' : format,
      '-y',
      outputPath,
    ];
  }

  /**
   * Add captions to video
   */
  addCaptionsCommand(
    videoPath: string,
    captionPath: string,
    outputPath: string,
    options?: {
      language?: string;
      label?: string;
    }
  ): string[] {
    return [
      '-i', videoPath,
      '-i', captionPath,
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-c:s', 'mov_text',
      '-metadata:s:s:0', `language=${options?.language || 'eng'}`,
      '-metadata:s:s:0', `handler_name=${options?.label || 'English Captions'}`,
      '-y',
      outputPath,
    ];
  }

  /**
   * Add sign language overlay (picture-in-picture)
   */
  addSignLanguageOverlayCommand(
    mainVideoPath: string,
    overlayVideoPath: string,
    outputPath: string,
    overlay: Omit<SignLanguageOverlay, 'id' | 'videoPath'>
  ): string[] {
    const position = overlay.position || 'bottom-right';
    const size = overlay.size || 25;

    // Calculate overlay position
    const positionMap: Record<string, string> = {
      'bottom-right': `main_w-overlay_w-10:main_h-overlay_h-10`,
      'bottom-left': `10:main_h-overlay_h-10`,
      'top-right': `main_w-overlay_w-10:10`,
      'top-left': `10:10`,
    };

    return [
      '-i', mainVideoPath,
      '-i', overlayVideoPath,
      '-filter_complex', `[1:v]scale=iw*${size}/100:-1[pip];[0:v][pip]overlay=${positionMap[position]}`,
      '-c:a', 'copy',
      '-y',
      outputPath,
    ];
  }

  /**
   * Calculate storage savings
   */
  calculateStorageSavings(
    originalSize: number,
    compressedSize: number
  ): {
    savedBytes: number;
    savedPercentage: number;
    compressionRatio: number;
  } {
    const savedBytes = originalSize - compressedSize;
    const savedPercentage = (savedBytes / originalSize) * 100;
    const compressionRatio = originalSize / compressedSize;

    return {
      savedBytes,
      savedPercentage: Math.round(savedPercentage * 100) / 100,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
    };
  }

  /**
   * Get job status
   */
  getJob(jobId: string): VideoJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs with pagination
   */
  getJobs(page: number = 1, pageSize: number = 13): {
    jobs: VideoJob[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } {
    const allJobs = Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalCount = allJobs.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;
    const jobs = allJobs.slice(offset, offset + pageSize);

    return {
      jobs,
      page,
      pageSize,
      totalCount,
      totalPages,
    };
  }

  /**
   * Estimate compression output size
   */
  estimateOutputSize(
    inputSize: number,
    quality: CompressionOptions['quality']
  ): {
    estimatedSize: number;
    estimatedSavings: number;
    estimatedRatio: number;
  } {
    // Compression ratio estimates
    const ratios: Record<CompressionOptions['quality'], number> = {
      low: 0.25,
      medium: 0.40,
      high: 0.60,
      'visual-first': 0.65,
    };

    const ratio = ratios[quality];
    const estimatedSize = Math.round(inputSize * ratio);
    const estimatedSavings = inputSize - estimatedSize;
    const estimatedRatio = 1 / ratio;

    return {
      estimatedSize,
      estimatedSavings,
      estimatedRatio: Math.round(estimatedRatio * 100) / 100,
    };
  }

  // ==================== Helper Methods ====================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
}

// ==================== Export Singleton ====================

export const videoProcessingService = new VideoProcessingService();
