import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import stream from 'stream';

import { s3Service } from '../storage/s3.service.js';
import { FFmpegWrapper } from './ffmpeg.js';
import { OpenAIVideoProcessor } from './openai.provider.js';
import { VideoVerification } from '../models/video-verification.model.js';
import { logger } from '../../../infrastructure/logger.js';

const pipeline = promisify(stream.pipeline);

import type { IVideoUpload } from '../models/video-upload.model.js';

export class VideoProcessor {
  static async process(upload: IVideoUpload): Promise<void> {
    const tmpDir = path.join(os.tmpdir(), `video-processing-${upload._id.toString()}`);
    await fs.promises.mkdir(tmpDir, { recursive: true });

    const originalPath = path.join(tmpDir, 'original.mp4');
    const audioPath = path.join(tmpDir, 'audio.mp3');
    const framesPattern = path.join(tmpDir, 'frame_%03d.jpg');
    
    try {
      // 1. Download video from R2
      logger.info({ uploadId: upload._id }, 'Downloading video from R2');
      const bodyStream = await s3Service.getObjectStream(upload.objectKey);
      await pipeline(bodyStream, fs.createWriteStream(originalPath));

      // 2. FFprobe
      logger.info({ uploadId: upload._id }, 'Probing video');
      const probeResult = await FFmpegWrapper.probe(originalPath);
      logger.info({ uploadId: upload._id, probeResult }, 'Probe result');

      // 3. Extract Audio
      let transcript = '';
      const aiProvider = new OpenAIVideoProcessor();
      
      if (probeResult.hasAudio) {
        logger.info({ uploadId: upload._id }, 'Extracting audio');
        await FFmpegWrapper.extractAudio(originalPath, audioPath);
        
        logger.info({ uploadId: upload._id }, 'Transcribing audio');
        transcript = await aiProvider.transcribe(audioPath);
      }

      // 4. Extract Frames
      logger.info({ uploadId: upload._id }, 'Extracting frames');
      // Extract ~5 frames
      await FFmpegWrapper.extractFrames(originalPath, framesPattern, probeResult.duration, 5);

      const frames = (await fs.promises.readdir(tmpDir))
        .filter(f => f.startsWith('frame_') && f.endsWith('.jpg'))
        .map(f => path.join(tmpDir, f));

      // 5. Run AI Verification
      logger.info({ uploadId: upload._id }, 'Running AI verification');
      const expectedScript = 'I am verifying my account.'; // Mock script for now
      
      const scriptResult = await aiProvider.verifyScript(expectedScript, transcript);
      const docResult = await aiProvider.verifyDocument(frames);
      const authResult = await aiProvider.verifyAuthenticity(originalPath);

      // Overall status
      let overallStatus: 'pass' | 'fail' | 'uncertain' | 'not_run' = 'pass';
      if (scriptResult.status === 'fail' || docResult.status === 'fail') {
        overallStatus = 'fail';
      } else if (scriptResult.status === 'uncertain' || docResult.status === 'uncertain' || authResult.status === 'uncertain') {
        overallStatus = 'uncertain';
      }

      // 6. Save Verification Result
      await VideoVerification.updateOne(
        { videoUploadId: upload._id },
        {
          $set: {
            userId: upload.userId,
            scriptVerification: scriptResult,
            documentVerification: docResult,
            videoAuthenticity: authResult,
            overallStatus,
            verificationVersion: 1,
          }
        },
        { upsert: true }
      );

      logger.info({ uploadId: upload._id, overallStatus }, 'Verification complete');

    } finally {
      // 7. Cleanup
      try {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
        logger.info({ uploadId: upload._id }, 'Cleanup complete');
      } catch (err) {
        logger.error({ err, uploadId: upload._id }, 'Failed to cleanup tmp directory');
      }
    }
  }
}
