import type { Request, Response } from 'express';
import { Submission } from './models/submission.model.js';
import { User } from '../auth/models/user.model.js';
import { VideoUpload } from '../video/models/video-upload.model.js';
import { VideoVerification } from '../video/models/video-verification.model.js';
import { UpdateSubmissionStatusRequestSchema } from '@repo/contracts';
import mongoose from 'mongoose';

export class StaffSubmissionsController {
  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = {};
      if (req.query.status) {
        query.status = req.query.status;
      }

      const [submissions, total] = await Promise.all([
        Submission.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'id name email avatarUrl isActive role createdAt updatedAt')
          .lean(),
        Submission.countDocuments(query),
      ]);

      const data = submissions.map((sub) => ({
        id: sub._id.toString(),
        status: sub.status,
        timeline: [], // Ideally map timeline, but omitted from SubmissionSchema for now
        createdAt: sub.createdAt.toISOString(),
        user: {
          id: (sub.userId as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
          name: (sub.userId as unknown as { name: string }).name,
          email: (sub.userId as unknown as { email: string }).email,
          avatarUrl: (sub.userId as unknown as { avatarUrl?: string }).avatarUrl,
          isActive: (sub.userId as unknown as { isActive: boolean }).isActive,
          role: (sub.userId as unknown as { role: string }).role,
          createdAt: (sub.userId as unknown as { createdAt: Date }).createdAt.toISOString(),
          updatedAt: (sub.userId as unknown as { updatedAt: Date }).updatedAt.toISOString(),
        }
      }));

      res.json({
        data,
        page,
        limit,
        total,
      });
    } catch (error) {
      console.error('List staff submissions error:', error);
      res.status(500).json({ error: 'Failed to list submissions' });
    }
  };

  public get = async (req: Request, res: Response): Promise<void> => {
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
      if (video) {
        verification = await VideoVerification.findOne({ videoUploadId: video._id }).lean();
      }

      const userObj = submission.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatarUrl?: string; isActive: boolean; role: string; createdAt: Date; updatedAt: Date };
      const reviewerObj = submission.reviewedBy as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatarUrl?: string; isActive: boolean; role: string; createdAt: Date; updatedAt: Date } | undefined;

      res.json({
        id: submission._id.toString(),
        status: submission.status,
        timeline: [], // omit timeline
        createdAt: submission.createdAt.toISOString(),
        user: {
          id: userObj._id.toString(),
          name: userObj.name,
          email: userObj.email,
          avatarUrl: userObj.avatarUrl,
          isActive: userObj.isActive,
          role: userObj.role,
          createdAt: userObj.createdAt.toISOString(),
          updatedAt: userObj.updatedAt.toISOString(),
        },
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
      res.status(500).json({ error: 'Failed to get submission' });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
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

      // Validate transitions
      if (role === 'employee') {
        if (submission.status !== 'in_review') {
          res.status(400).json({ error: 'Employee can only review submissions currently in_review' });
          return;
        }
        if (status !== 'approved' && status !== 'rejected') {
          res.status(400).json({ error: 'Employee can only set status to approved or rejected' });
          return;
        }
      }

      // Admins might have broader transitions but for now let's enforce similar rules unless specified.
      // But admins can definitely reject or approve.
      if (status === 'rejected' && !rejectionReason) {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      submission.status = status;
      if (status === 'approved' || status === 'rejected') {
        submission.reviewedBy = new mongoose.Types.ObjectId(req.auth!.userId);
        submission.reviewedAt = new Date();
      }
      if (status === 'rejected') {
        submission.rejectionReason = rejectionReason;
      }

      await submission.save();

      res.json({ success: true });
    } catch (error) {
      console.error('Update staff submission error:', error);
      res.status(500).json({ error: 'Failed to update submission' });
    }
  };
}

export const staffSubmissionsController = new StaffSubmissionsController();
