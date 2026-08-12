import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { CreateSubmissionRequestSchema } from '@repo/contracts';
import type { SubmissionTimelineStep } from '@repo/contracts';
import { Submission } from './models/submission.model.js';
import { VideoUpload } from '../video/models/video-upload.model.js';
import { s3Service } from '../video/storage/s3.service.js';
import { env } from '../../config/env.js';

export class SubmissionsController {
  public async createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const idempotencyKey = req.headers['x-idempotency-key'];
      if (!idempotencyKey || typeof idempotencyKey !== 'string') {
        res.status(400).json({ error: 'x-idempotency-key header is required as string' });
        return;
      }

      const parsed = CreateSubmissionRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid payload', details: parsed.error });
        return;
      }

      const { fileName, contentType, fileSize, totalParts } = parsed.data;

      if (fileSize > env.VIDEO_MAX_SIZE_BYTES) {
        res.status(400).json({ error: 'UPLOAD_TOO_LARGE' });
        return;
      }

      const userId = new Types.ObjectId(auth.userId);

      // Idempotency check: see if submission already exists
      const existingSubmission = await Submission.findOne({ userId, idempotencyKey });
      if (existingSubmission) {
        const existingUpload = await VideoUpload.findOne({ submissionId: existingSubmission._id }).sort({ createdAt: -1 });
        if (existingUpload) {
          res.json({
            submissionId: existingSubmission._id.toString(),
            uploadId: existingUpload.uploadId,
          });
          return;
        }
      }

      const uploadId = crypto.randomBytes(16).toString('hex');
      const objectKey = `videos/${auth.userId}/${uploadId}/original`;

      // Create R2 multipart upload
      const multipartUploadId = await s3Service.createMultipartUpload(objectKey, contentType);

      // Create submission and video upload logically together
      const submission = await Submission.create({
        userId,
        status: 'draft',
        idempotencyKey,
      });

      await VideoUpload.create({
        userId,
        submissionId: submission._id,
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
        submissionId: submission._id.toString(),
        uploadId,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const userId = new Types.ObjectId(auth.userId);

      const [submissions, total] = await Promise.all([
        Submission.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Submission.countDocuments({ userId }),
      ]);

      const data = submissions.map(sub => ({
        id: sub._id.toString(),
        status: sub.status,
        timeline: [], // Short list doesn't necessarily need full timeline, but we return empty array for schema
        createdAt: sub.createdAt.toISOString(),
      }));

      res.json({
        data,
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getSubmissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      const submission = await Submission.findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(auth.userId),
      }).lean();

      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      // Fetch the active upload to build the timeline
      const upload = await VideoUpload.findOne({ submissionId: submission._id })
        .sort({ createdAt: -1 })
        .lean();

      const timeline: SubmissionTimelineStep[] = [];

      // Timeline mapping logic based on submission status
      if (submission.status === 'draft') {
        timeline.push({
          key: 'video_uploaded',
          status: upload?.status === 'uploaded' ? 'completed' : 'current',
          completedAt: upload?.completedAt?.toISOString(),
        });
        timeline.push({
          key: 'under_review',
          status: 'pending',
        });
        timeline.push({
          key: 'payment',
          status: 'pending',
        });
      } else if (submission.status === 'in_review') {
        timeline.push({
          key: 'video_uploaded',
          status: 'completed',
          completedAt: upload?.completedAt?.toISOString(),
        });
        timeline.push({
          key: 'under_review',
          status: 'current',
          message: 'Usually takes 24-48 hours',
        });
        timeline.push({
          key: 'payment',
          status: 'pending',
        });
      } else if (submission.status === 'approved') {
        timeline.push({
          key: 'video_uploaded',
          status: 'completed',
          completedAt: upload?.completedAt?.toISOString(),
        });
        timeline.push({
          key: 'under_review',
          status: 'completed',
        });
        timeline.push({
          key: 'payment',
          status: 'pending',
          message: 'Pending payment',
        });
      } else if (submission.status === 'rejected') {
        timeline.push({
          key: 'video_uploaded',
          status: 'completed',
          completedAt: upload?.completedAt?.toISOString(),
        });
        timeline.push({
          key: 'under_review',
          status: 'rejected',
        });
      } else if (submission.status === 'payment_pending') {
        timeline.push({
          key: 'video_uploaded',
          status: 'completed',
          completedAt: upload?.completedAt?.toISOString(),
        });
        timeline.push({
          key: 'under_review',
          status: 'completed',
        });
        timeline.push({
          key: 'payment',
          status: 'current',
          message: 'Payment is being processed',
        });
      } else if (submission.status === 'paid') {
        timeline.push({
          key: 'video_uploaded',
          status: 'completed',
          completedAt: upload?.completedAt?.toISOString(),
        });
        timeline.push({
          key: 'under_review',
          status: 'completed',
        });
        timeline.push({
          key: 'payment',
          status: 'completed',
        });
      }

      res.json({
        id: submission._id.toString(),
        status: submission.status,
        timeline,
        createdAt: submission.createdAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const submissionsController = new SubmissionsController();
