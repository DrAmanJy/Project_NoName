import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { 
  CreateVideoUploadSchema, 
  MultipartSignRequestSchema, 
  MultipartCompleteRequestSchema 
} from '@repo/contracts';
import { VideoUpload } from './models/video-upload.model.js';
import { VideoVerificationJob } from './models/video-job.model.js';
import { VideoVerification } from './models/video-verification.model.js';
import { s3Service } from './storage/s3.service.js';
import { env } from '../../config/env.js';

export class VideoController {
  
  public async createUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = CreateVideoUploadSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid payload', details: parsed.error });
        return;
      }

      const { fileName, contentType, fileSize, totalParts } = parsed.data;

      if (fileSize > env.VIDEO_MAX_SIZE_BYTES) {
        res.status(400).json({ error: 'UPLOAD_TOO_LARGE' });
        return;
      }

      // Generate a secure object key
      const uploadId = crypto.randomBytes(16).toString('hex');
      const objectKey = `videos/${auth.userId}/${uploadId}/original`;

      // Create R2 multipart upload
      const multipartUploadId = await s3Service.createMultipartUpload(objectKey, contentType);

      // Create database record
      await VideoUpload.create({
        userId: new Types.ObjectId(auth.userId),
        objectKey,
        originalFileName: fileName,
        contentType,
        fileSize,
        uploadId,
        multipartUploadId,
        status: 'created',
        totalParts,
      });

      res.status(201).json({
        uploadId,
        objectKey,
        multipartUploadId,
      });
    } catch (error) {
      next(error);
    }
  }

  public async signParts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { uploadId } = req.params;
      const parsed = MultipartSignRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid payload', details: parsed.error });
        return;
      }

      const upload = await VideoUpload.findOne({ uploadId }).lean();
      if (!upload) {
        res.status(404).json({ error: 'UPLOAD_NOT_FOUND' });
        return;
      }

      if (upload.userId.toString() !== auth.userId) {
        res.status(403).json({ error: 'UPLOAD_NOT_OWNED' });
        return;
      }

      if (upload.status !== 'created' && upload.status !== 'uploading') {
        res.status(400).json({ error: 'Upload is not in a valid state to sign parts' });
        return;
      }

      // Transition state if first time
      if (upload.status === 'created') {
        await VideoUpload.updateOne({ uploadId }, { $set: { status: 'uploading' } });
      }

      const presignedUrls = await Promise.all(
        parsed.data.partNumbers.map(async (partNumber) => {
          const url = await s3Service.signPart(upload.objectKey, upload.multipartUploadId, partNumber);
          return { partNumber, url };
        })
      );

      res.json({ presignedUrls });
    } catch (error) {
      next(error);
    }
  }

  public async completeUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { uploadId } = req.params;
      const parsed = MultipartCompleteRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid payload', details: parsed.error });
        return;
      }

      const upload = await VideoUpload.findOne({ uploadId });
      if (!upload) {
        res.status(404).json({ error: 'UPLOAD_NOT_FOUND' });
        return;
      }

      if (upload.userId.toString() !== auth.userId) {
        res.status(403).json({ error: 'UPLOAD_NOT_OWNED' });
        return;
      }

      // Idempotency check
      if (upload.status === 'uploaded' || upload.status === 'processing') {
        res.json({ status: upload.status });
        return;
      }

      if (upload.status !== 'uploading' && upload.status !== 'created') {
        res.status(400).json({ error: 'UPLOAD_ALREADY_COMPLETED or cancelled' });
        return;
      }

      // Complete in R2
      await s3Service.completeMultipartUpload(upload.objectKey, upload.multipartUploadId, parsed.data.parts);

      // Atomic update
      const updated = await VideoUpload.findOneAndUpdate(
        { _id: upload._id, status: { $in: ['created', 'uploading'] } },
        { 
          $set: { 
            status: 'uploaded', 
            completedAt: new Date(),
            completedParts: parsed.data.parts.length
          } 
        },
        { new: true }
      );

      if (!updated) {
        // Someone else completed it
        res.json({ status: 'uploaded' });
        return;
      }

      // Enqueue job atomically - use upsert to prevent duplicates if retried
      await VideoVerificationJob.updateOne(
        { videoUploadId: upload._id },
        {
          $setOnInsert: {
            userId: upload.userId,
            status: 'queued',
            attempts: 0,
          }
        },
        { upsert: true }
      );

      res.json({ status: 'uploaded' });
    } catch (error) {
      next(error);
    }
  }

  public async getUploadStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { uploadId } = req.params;
      const upload = await VideoUpload.findOne({ uploadId }).lean();
      
      if (!upload) {
        res.status(404).json({ error: 'UPLOAD_NOT_FOUND' });
        return;
      }

      if (upload.userId.toString() !== auth.userId) {
        res.status(403).json({ error: 'UPLOAD_NOT_OWNED' });
        return;
      }

      res.json({
        id: upload.uploadId,
        status: upload.status,
        createdAt: upload.createdAt,
        updatedAt: upload.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { uploadId } = req.params;
      const upload = await VideoUpload.findOne({ uploadId }).lean();
      
      if (!upload) {
        res.status(404).json({ error: 'UPLOAD_NOT_FOUND' });
        return;
      }

      if (upload.userId.toString() !== auth.userId) {
        res.status(403).json({ error: 'UPLOAD_NOT_OWNED' });
        return;
      }

      const verification = await VideoVerification.findOne({ videoUploadId: upload._id }).lean();
      if (!verification) {
        res.status(404).json({ error: 'VERIFICATION_NOT_READY' });
        return;
      }

      res.json({
        status: verification.overallStatus,
        script: verification.scriptVerification,
        document: verification.documentVerification,
        authenticity: verification.videoAuthenticity,
      });
    } catch (error) {
      next(error);
    }
  }

  public async cancelUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { uploadId } = req.params;
      const upload = await VideoUpload.findOne({ uploadId });
      
      if (!upload) {
        res.status(404).json({ error: 'UPLOAD_NOT_FOUND' });
        return;
      }

      if (upload.userId.toString() !== auth.userId) {
        res.status(403).json({ error: 'UPLOAD_NOT_OWNED' });
        return;
      }

      if (upload.status === 'cancelled') {
        res.json({ status: 'cancelled' });
        return;
      }

      if (upload.status === 'uploaded' || upload.status === 'processing') {
        res.status(400).json({ error: 'UPLOAD_ALREADY_COMPLETED' });
        return;
      }

      await s3Service.abortMultipartUpload(upload.objectKey, upload.multipartUploadId);

      await VideoUpload.updateOne(
        { _id: upload._id },
        { $set: { status: 'cancelled', cancelledAt: new Date() } }
      );

      res.json({ status: 'cancelled' });
    } catch (error) {
      next(error);
    }
  }
}

export const videoController = new VideoController();
