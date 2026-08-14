import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { CreateSubmissionRequestSchema } from '@repo/contracts';
import type { SubmissionTimelineStep } from '@repo/contracts';
import { Submission } from './models/submission.model.js';
import { VideoUpload } from '../video/models/video-upload.model.js';
import { VideoVerification } from '../video/models/video-verification.model.js';
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

      const { fileName, contentType, fileSize, totalParts, durationSeconds, width, height } = parsed.data;

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

      try {
        // Create submission and video upload logically together
        const submission = await Submission.create({
          userId,
          status: 'draft',
          expectedEarning: env.EXPECTED_EARNING_AMOUNT,
          earning: 0,
          idempotencyKey,
          timeline: [{ status: 'draft', timestamp: new Date(), userId }],
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
          durationSeconds,
          width,
          height,
        });

        res.status(201).json({
          submissionId: submission._id.toString(),
          uploadId,
        });
      } catch (dbError: unknown) {
        if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === 11000) {
          // Idempotency race condition occurred
          const existingSubmission = await Submission.findOne({ userId, idempotencyKey });
          if (existingSubmission) {
            const existingUpload = await VideoUpload.findOne({ submissionId: existingSubmission._id }).sort({ createdAt: -1 });
            if (existingUpload) {
              // Abort the newly created R2 multipart upload to prevent dangling resources
              await s3Service.abortMultipartUpload(objectKey, multipartUploadId).catch(console.error);
              
              res.json({
                submissionId: existingSubmission._id.toString(),
                uploadId: existingUpload.uploadId,
              });
              return;
            }
          }
        }
        
        // If it's a real failure, abort the multipart upload to prevent dangling resources
        await s3Service.abortMultipartUpload(objectKey, multipartUploadId).catch(console.error);
        throw dbError;
      }
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

      const [submissions, total, totals] = await Promise.all([
        Submission.find({ userId })
          .select('status createdAt expectedEarning earning rejectionReason')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Submission.countDocuments({ userId }),
        Submission.aggregate([
          { $match: { userId } },
          { 
            $group: { 
              _id: null, 
              totalExpectedEarning: { $sum: { $ifNull: ["$expectedEarning", 0] } }, 
              totalEarning: { $sum: { $ifNull: ["$earning", 0] } } 
            } 
          }
        ]),
      ]);

      const totalExpectedEarning = totals[0]?.totalExpectedEarning || 0;
      const totalEarning = totals[0]?.totalEarning || 0;

      const submissionIds = submissions.map(sub => sub._id);
      const videos = await VideoUpload.find({ submissionId: { $in: submissionIds } })
        .select('_id submissionId originalFileName contentType fileSize durationSeconds width height status completedAt objectKey')
        .sort({ createdAt: -1 })
        .lean();

      const videosBySubId = new Map(videos.map(v => [v.submissionId.toString(), v]));

      const data = await Promise.all(submissions.map(async sub => {
        const subIdStr = sub._id.toString();
        const video = videosBySubId.get(subIdStr);
        let previewUrl: string | null = null;
        
        if (video) {
          if (video.status === 'uploaded' || video.status === 'processing' || video.status === 'verified') {
            previewUrl = await s3Service.getSignedDownloadUrl(video.objectKey, 900).catch(() => null);
          }
        }

        return {
          id: subIdStr,
          status: sub.status,
          timeline: [], // Short list doesn't necessarily need full timeline, but we return empty array for schema
          createdAt: sub.createdAt.toISOString(),
          video: video ? {
            id: video._id.toString(),
            originalFilename: video.originalFileName,
            mimeType: video.contentType,
            sizeBytes: video.fileSize,
            durationSeconds: video.durationSeconds || null,
            width: video.width || null,
            height: video.height || null,
            uploadStatus: video.status,
            uploadedAt: video.completedAt ? video.completedAt.toISOString() : null,
            previewUrl,
          } : null,
          expectedEarning: sub.expectedEarning ?? 0,
          earning: sub.earning ?? 0,
        };
      }));

      res.json({
        data,
        page,
        limit,
        total,
        totalExpectedEarning,
        totalEarning,
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

      // Fetch the active upload to build the timeline and return metadata
      const upload = await VideoUpload.findOne({ submissionId: submission._id })
        .select('_id originalFileName contentType fileSize durationSeconds width height status completedAt objectKey')
        .sort({ createdAt: -1 })
        .lean();

      let verification = null;
      if (upload) {
        verification = await VideoVerification.findOne({ videoUploadId: upload._id }).lean();
      }

      const baseUploadedStep: SubmissionTimelineStep = {
        key: 'video_uploaded',
        status: upload?.status === 'uploaded' ? 'completed' : 'current',
        completedAt: upload?.completedAt?.toISOString(),
      };

      const timelineMap: Record<string, SubmissionTimelineStep[]> = {
        draft: [
          baseUploadedStep,
          { key: 'under_review', status: 'pending' },
          { key: 'payment', status: 'pending' },
        ],
        in_review: [
          { ...baseUploadedStep, status: 'completed' },
          { key: 'under_review', status: 'current', message: 'Usually takes 24-48 hours' },
          { key: 'payment', status: 'pending' },
        ],
        approved: [
          { ...baseUploadedStep, status: 'completed' },
          { key: 'under_review', status: 'completed' },
          { key: 'payment', status: 'pending', message: 'Pending payment' },
        ],
        rejected: [
          { ...baseUploadedStep, status: 'completed' },
          { key: 'under_review', status: 'rejected' },
        ],
        payment_pending: [
          { ...baseUploadedStep, status: 'completed' },
          { key: 'under_review', status: 'completed' },
          { key: 'payment', status: 'current', message: 'Payment is being processed' },
        ],
        paid: [
          { ...baseUploadedStep, status: 'completed' },
          { key: 'under_review', status: 'completed' },
          { key: 'payment', status: 'completed' },
        ],
      };

      const timeline = timelineMap[submission.status] || timelineMap.draft;

      let previewUrl: string | null = null;
      if (upload) {
        if (upload.status === 'uploaded' || upload.status === 'processing' || upload.status === 'verified') {
          previewUrl = await s3Service.getSignedDownloadUrl(upload.objectKey, 900).catch(() => null);
        }
      }

      res.json({
        id: submission._id.toString(),
        status: submission.status,
        timeline,
        createdAt: submission.createdAt.toISOString(),
        video: upload ? {
          id: upload._id.toString(),
          originalFilename: upload.originalFileName,
          mimeType: upload.contentType,
          sizeBytes: upload.fileSize,
          durationSeconds: upload.durationSeconds || null,
          width: upload.width || null,
          height: upload.height || null,
          uploadStatus: upload.status,
          uploadedAt: upload.completedAt ? upload.completedAt.toISOString() : null,
          previewUrl,
        } : null,
        verification: verification ? {
          overallStatus: verification.overallStatus,
        } : null,
        expectedEarning: submission.expectedEarning ?? 0,
        earning: submission.earning ?? 0,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const submissionsController = new SubmissionsController();
