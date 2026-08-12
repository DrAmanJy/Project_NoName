import { z } from 'zod';

export const SubmissionStatusSchema = z.enum([
  'draft',
  'in_review',
  'approved',
  'rejected',
  'payment_pending',
  'paid',
]);

export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const SubmissionTimelineStepKeySchema = z.enum([
  'video_uploaded',
  'under_review',
  'payment',
]);

export const SubmissionTimelineStepStatusSchema = z.enum([
  'pending',
  'current',
  'completed',
  'rejected',
]);

export const SubmissionTimelineStepSchema = z.object({
  key: SubmissionTimelineStepKeySchema,
  status: SubmissionTimelineStepStatusSchema,
  completedAt: z.string().datetime().optional(),
  message: z.string().optional(),
});

export type SubmissionTimelineStep = z.infer<typeof SubmissionTimelineStepSchema>;

export const SubmissionResponseSchema = z.object({
  id: z.string(),
  status: SubmissionStatusSchema,
  timeline: z.array(SubmissionTimelineStepSchema),
  createdAt: z.string().datetime(),
});

export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

export const SubmissionListResponseSchema = z.object({
  data: z.array(SubmissionResponseSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type SubmissionListResponse = z.infer<typeof SubmissionListResponseSchema>;

export const CreateSubmissionRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().refine(val => val.startsWith('video/'), { message: 'Must be a video content type' }),
  fileSize: z.number().int().positive(),
  totalParts: z.number().int().positive().max(10000), // S3 max is 10k
  country: z.string().min(2),
});

export type CreateSubmissionRequest = z.infer<typeof CreateSubmissionRequestSchema>;

export const CreateSubmissionResponseSchema = z.object({
  submissionId: z.string(),
  uploadId: z.string(),
});

export type CreateSubmissionResponse = z.infer<typeof CreateSubmissionResponseSchema>;

// ─── Staff Schemas ──────────────────────────────────────────────

import { UserSchema } from './auth.js';
import { VideoVerificationStatusSchema } from './video.js';

export const StaffSubmissionResponseSchema = SubmissionResponseSchema.extend({
  user: UserSchema,
});
export type StaffSubmissionResponse = z.infer<typeof StaffSubmissionResponseSchema>;

export const StaffSubmissionListResponseSchema = z.object({
  data: z.array(StaffSubmissionResponseSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});
export type StaffSubmissionListResponse = z.infer<typeof StaffSubmissionListResponseSchema>;

export const StaffSubmissionDetailResponseSchema = StaffSubmissionResponseSchema.extend({
  verification: VideoVerificationStatusSchema.nullable().optional(),
  reviewedBy: UserSchema.nullable().optional(),
  reviewedAt: z.string().datetime().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
});
export type StaffSubmissionDetailResponse = z.infer<typeof StaffSubmissionDetailResponseSchema>;

export const UpdateSubmissionStatusRequestSchema = z.object({
  status: SubmissionStatusSchema,
  rejectionReason: z.string().optional(),
});
export type UpdateSubmissionStatusRequest = z.infer<typeof UpdateSubmissionStatusRequestSchema>;
