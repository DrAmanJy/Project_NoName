import type { Request, Response } from 'express';
import { Submission } from './models/submission.model.js';
import { User } from '../auth/models/user.model.js';
import { VideoUpload } from '../video/models/video-upload.model.js';
import { VideoVerification } from '../video/models/video-verification.model.js';
import { s3Service } from '../video/storage/s3.service.js';
import { UpdateSubmissionStatusRequestSchema, SubmissionStatusSchema } from '@repo/contracts';
import mongoose from 'mongoose';

export class StaffSubmissionsController {
  public list = async (req: Request, res: Response, next: import('express').NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = {};
      if (req.query.status) {
        const parsedStatus = SubmissionStatusSchema.safeParse(req.query.status);
        if (!parsedStatus.success) {
          res.status(400).json({ error: 'Invalid status parameter' });
          return;
        }
        query.status = parsedStatus.data;
      }

      const [submissions, total] = await Promise.all([
        Submission.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'id name email avatarUrl isActive role createdAt updatedAt')
          .populate('reviewedBy', 'id name email avatarUrl isActive role createdAt updatedAt')
          .lean(),
        Submission.countDocuments(query),
      ]);

      const submissionIds = submissions.map(s => s._id);
      const videos = await VideoUpload.find({ submissionId: { $in: submissionIds } }).lean();
      const videoIds = videos.map(v => v._id);
      const verifications = await VideoVerification.find({ videoUploadId: { $in: videoIds } }).lean();

      const videosBySubId = new Map(videos.map(v => [v.submissionId.toString(), v]));
      const verificationsByVidId = new Map(verifications.map(v => [v.videoUploadId.toString(), v]));

      const data = await Promise.all(submissions.map(async (sub) => {
        const video = videosBySubId.get(sub._id.toString());
        let verification = null;
        let previewUrl: string | null = null;
        let thumbnailUrl: string | null = null;

        if (video) {
          verification = verificationsByVidId.get(video._id.toString()) || null;
          
          if (video.status === 'uploaded' || video.status === 'processing' || video.status === 'verified') {
            previewUrl = await s3Service.getSignedDownloadUrl(video.objectKey, 900).catch(() => null);
          }
          if (video.thumbnailKey) {
            thumbnailUrl = await s3Service.getSignedDownloadUrl(video.thumbnailKey, 900).catch(() => null);
          }
        }

        const userObj = sub.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatarUrl?: string; isActive: boolean; role: string; createdAt: Date; updatedAt: Date };
        const reviewerObj = sub.reviewedBy as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatarUrl?: string; isActive: boolean; role: string; createdAt: Date; updatedAt: Date } | undefined;

        return {
          id: sub._id.toString(),
          status: sub.status,
          timeline: [], // omit timeline
          createdAt: sub.createdAt.toISOString(),
          user: userObj ? {
            id: userObj._id.toString(),
            name: userObj.name,
            email: userObj.email,
            avatarUrl: userObj.avatarUrl,
            isActive: userObj.isActive,
            role: userObj.role,
            createdAt: userObj.createdAt.toISOString(),
            updatedAt: userObj.updatedAt.toISOString(),
          } : {
            id: 'unknown',
            name: 'Deleted User',
            email: 'deleted@example.com',
            isActive: false,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
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
            thumbnailUrl,
          } : null,
          reviewedBy: reviewerObj ? {
            id: reviewerObj._id.toString(),
            name: reviewerObj.name,
            email: reviewerObj.email,
            avatarUrl: reviewerObj.avatarUrl,
            isActive: reviewerObj.isActive,
            role: reviewerObj.role,
            createdAt: reviewerObj.createdAt.toISOString(),
            updatedAt: reviewerObj.updatedAt.toISOString(),
          } : null,
          reviewedAt: sub.reviewedAt ? sub.reviewedAt.toISOString() : null,
          rejectionReason: sub.rejectionReason || null,
          verification: verification ? {
            status: verification.overallStatus,
            script: {
              status: verification.scriptVerification?.status || 'pending',
            },
            document: {
              status: verification.documentVerification?.status || 'pending',
            },
            authenticity: {
              status: verification.videoAuthenticity?.status || 'pending',
            }
          } : null,
        };
      }));

      res.json({
        data,
        page,
        limit,
        total,
      });
    } catch (error) {
      console.error('List staff submissions error:', error);
      next(error);
    }
  };

  public get = async (req: Request, res: Response, next: import('express').NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid submission ID' });
        return;
      }

      const submission = await Submission.findById(id)
        .populate('userId', 'id name email avatarUrl isActive role createdAt updatedAt')
        .populate('reviewedBy', 'id name email avatarUrl isActive role createdAt updatedAt')
        .lean();

      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      // Fetch related video info and verification
      const video = await VideoUpload.findOne({ submissionId: submission._id }).lean();
      let verification = null;
      let previewUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (video) {
        verification = await VideoVerification.findOne({ videoUploadId: video._id }).lean();
        
        if (video.status === 'uploaded' || video.status === 'processing' || video.status === 'verified') {
          previewUrl = await s3Service.getSignedDownloadUrl(video.objectKey, 900).catch(() => null);
        }
        if (video.thumbnailKey) {
          thumbnailUrl = await s3Service.getSignedDownloadUrl(video.thumbnailKey, 900).catch(() => null);
        }
      }

      const userObj = submission.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatarUrl?: string; isActive: boolean; role: string; createdAt: Date; updatedAt: Date };
      const reviewerObj = submission.reviewedBy as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatarUrl?: string; isActive: boolean; role: string; createdAt: Date; updatedAt: Date } | undefined;

      res.json({
        id: submission._id.toString(),
        status: submission.status,
        timeline: [], // omit timeline
        createdAt: submission.createdAt.toISOString(),
        user: userObj ? {
          id: userObj._id.toString(),
          name: userObj.name,
          email: userObj.email,
          avatarUrl: userObj.avatarUrl,
          isActive: userObj.isActive,
          role: userObj.role,
          createdAt: userObj.createdAt.toISOString(),
          updatedAt: userObj.updatedAt.toISOString(),
        } : {
          id: 'unknown',
          name: 'Deleted User',
          email: 'deleted@example.com',
          isActive: false,
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
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
          thumbnailUrl,
        } : null,
        reviewedBy: reviewerObj ? {
          id: reviewerObj._id.toString(),
          name: reviewerObj.name,
          email: reviewerObj.email,
          avatarUrl: reviewerObj.avatarUrl,
          isActive: reviewerObj.isActive,
          role: reviewerObj.role,
          createdAt: reviewerObj.createdAt.toISOString(),
          updatedAt: reviewerObj.updatedAt.toISOString(),
        } : null,
        reviewedAt: submission.reviewedAt ? submission.reviewedAt.toISOString() : null,
        rejectionReason: submission.rejectionReason || null,
        verification: verification ? {
          status: verification.overallStatus,
          script: {
            status: verification.scriptVerification.status,
          },
          document: {
            status: verification.documentVerification.status,
          },
          authenticity: {
            status: verification.videoAuthenticity.status,
          }
        } : null,
      });
    } catch (error) {
      console.error('Get staff submission error:', error);
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: import('express').NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid submission ID' });
        return;
      }

      const bodyResult = UpdateSubmissionStatusRequestSchema.safeParse(req.body);
      if (!bodyResult.success) {
        res.status(400).json({ error: 'Invalid request', details: bodyResult.error.issues });
        return;
      }
      
      const { status, rejectionReason } = bodyResult.data;

      const submission = await Submission.findById(id);
      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      const user = await User.findById(req.auth!.userId).lean();
      const role = user?.role || 'user';
      const currentStatus = submission.status;

      // Define valid transitions map
      const VALID_TRANSITIONS: Record<string, string[]> = {
        'draft': ['in_review'], // System transitions normally, but documented
        'in_review': ['approved', 'rejected'],
        'approved': ['payment_pending'], // if payment logic exists
        'payment_pending': ['paid'],
        'rejected': [],
        'paid': []
      };

      const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
      
      if (!allowedNextStatuses.includes(status)) {
        res.status(400).json({ error: `Invalid status transition from ${currentStatus} to ${status}` });
        return;
      }

      // Enforce Role permissions
      if (role === 'employee') {
        if (currentStatus !== 'in_review') {
          res.status(403).json({ error: 'Employee can only transition submissions currently in_review' });
          return;
        }
        if (status !== 'approved' && status !== 'rejected') {
          res.status(403).json({ error: 'Employee can only set status to approved or rejected' });
          return;
        }
      } else if (role === 'admin') {
        // Admin can transition if it's in VALID_TRANSITIONS.
        // It's already validated against VALID_TRANSITIONS above.
      } else {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (status === 'rejected' && !rejectionReason) {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      submission.status = status;
      if (status === 'approved' || status === 'rejected') {
        submission.reviewedBy = new mongoose.Types.ObjectId(req.auth!.userId);
        submission.reviewedAt = new Date();
      }
      if (status !== 'rejected') {
        submission.rejectionReason = undefined;
      } else if (rejectionReason) {
        submission.rejectionReason = rejectionReason;
      }
      
      await submission.save();

      res.json({ success: true });
    } catch (error) {
      console.error('Update submission status error:', error);
      next(error);
    }
  };
}

export const staffSubmissionsController = new StaffSubmissionsController();
