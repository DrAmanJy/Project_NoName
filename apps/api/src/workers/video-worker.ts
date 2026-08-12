import mongoose from 'mongoose';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../infrastructure/logger.js';
import { VideoVerificationJob } from '../modules/video/models/video-job.model.js';
import { VideoUpload } from '../modules/video/models/video-upload.model.js';
import { VideoProcessor } from '../modules/video/processing/processor.js';

const WORKER_ID = crypto.randomUUID();
const POLL_INTERVAL_MS = 5000;
const STALE_TIMEOUT_MS = env.VIDEO_PROCESSING_TIMEOUT_SECONDS * 1000 + 30000; // timeout + 30s buffer

async function claimJob() {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - STALE_TIMEOUT_MS);

  // Find a job that is queued, or processing but stale
  const job = await VideoVerificationJob.findOneAndUpdate(
    {
      $and: [
        {
          $or: [
            { status: 'queued' },
            { status: 'processing', lockedAt: { $lt: staleThreshold } },
          ],
        },
        {
          $or: [{ availableAt: { $lte: now } }, { availableAt: null }],
        },
      ]
    },
    {
      $set: {
        status: 'processing',
        lockedAt: now,
        lockedBy: WORKER_ID,
        startedAt: now,
      },
      $inc: { attempts: 1 },
    },
    { new: true, sort: { createdAt: 1 } }
  );

  return job;
}

import type { IVideoVerificationJob } from '../modules/video/models/video-job.model.js';

async function processJob(job: IVideoVerificationJob) {
  logger.info({ jobId: job._id, uploadId: job.videoUploadId }, 'Starting job processing');
  try {
    const upload = await VideoUpload.findById(job.videoUploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    if (upload.status !== 'uploaded') {
      logger.info({ jobId: job._id, status: upload.status }, 'Upload not ready or already processed');
      const cleanupAt = new Date(Date.now() + env.VIDEO_RETENTION_DAYS * 24 * 60 * 60 * 1000);
      await VideoVerificationJob.updateOne({ _id: job._id }, { $set: { status: 'completed', completedAt: new Date(), cleanupAt } });
      return;
    }

    // Mark upload as processing
    await VideoUpload.updateOne({ _id: upload._id }, { $set: { status: 'processing', processingStartedAt: new Date() } });

    // Run processing
    await VideoProcessor.process(upload);

    const resultStatus = 'verified'; // Depending on overallStatus we could update this

    const cleanupAt = new Date(Date.now() + env.VIDEO_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    await VideoUpload.updateOne({ _id: upload._id }, { $set: { status: resultStatus, processingCompletedAt: new Date() } });
    await VideoVerificationJob.updateOne({ _id: job._id }, { $set: { status: 'completed', completedAt: new Date(), cleanupAt } });

    logger.info({ jobId: job._id }, 'Job completed successfully');
  } catch (error) {
    logger.error({ jobId: job._id, err: error }, 'Job failed');
    
    // Retry logic
    const MAX_ATTEMPTS = 3;
    if (job.attempts < MAX_ATTEMPTS) {
      const delayMs = Math.pow(2, job.attempts) * 1000 * 60; // 2m, 4m, 8m
      await VideoVerificationJob.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'queued',
            availableAt: new Date(Date.now() + delayMs),
            lastErrorCode: error instanceof Error ? error.message : 'UnknownError',
          },
        }
      );
    } else {
      const cleanupAt = new Date(Date.now() + env.VIDEO_RETENTION_DAYS * 24 * 60 * 60 * 1000);
      await VideoVerificationJob.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'failed',
            lastErrorCode: error instanceof Error ? error.message : 'UnknownError',
            cleanupAt,
          },
        }
      );
      await VideoUpload.updateOne({ _id: job.videoUploadId }, { $set: { status: 'failed', processingCompletedAt: new Date() } });
    }
  }
}

async function startWorker() {
  logger.info({ workerId: WORKER_ID }, 'Starting Video Processing Worker');

  await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB');

  let activeJobs = 0;
  const maxConcurrency = env.VIDEO_WORKER_CONCURRENCY;

  // Heartbeat logging
  setInterval(() => {
    logger.debug({ workerId: WORKER_ID, activeJobs }, 'Worker heartbeat');
  }, 30000);

  const poll = async () => {
    if (activeJobs >= maxConcurrency) {
      setTimeout(poll, POLL_INTERVAL_MS);
      return;
    }

    try {
      const job = await claimJob();
      if (job) {
        activeJobs++;
        // Run processing async so we can continue polling up to concurrency limit
        processJob(job).finally(() => {
          activeJobs--;
        });
        
        // Immediately poll again to grab more jobs if we have capacity
        setImmediate(poll);
      } else {
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    } catch (error) {
      logger.error({ err: error }, 'Error polling for jobs');
      setTimeout(poll, POLL_INTERVAL_MS);
    }
  };

  poll();
}

// Handle shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker...');
  await mongoose.disconnect();
  process.exit(0);
});

startWorker().catch(err => {
  logger.fatal({ err }, 'Worker crashed');
  process.exit(1);
});
