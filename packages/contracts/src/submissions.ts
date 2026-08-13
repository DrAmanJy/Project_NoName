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

export const VideoMetadataSchema = z.object({
  id: z.string(),
  originalFilename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  durationSeconds: z.number().positive().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  uploadStatus: z.string(),
  uploadedAt: z.string().datetime().nullable(),
  previewUrl: z.string().url().nullable(),
  thumbnailUrl: z.string().url().nullable(),
});

export const UserSafeVerificationSchema = z.object({
  overallStatus: z.enum(['pass', 'fail', 'uncertain', 'not_run']),
});

export const SubmissionResponseSchema = z.object({
  id: z.string(),
  status: SubmissionStatusSchema,
  timeline: z.array(SubmissionTimelineStepSchema),
  createdAt: z.string().datetime(),
  video: VideoMetadataSchema.nullable().optional(),
  verification: UserSafeVerificationSchema.nullable().optional(),
  expectedEarning: z.number().int().nonnegative(),
  earning: z.number().int().nonnegative(),
});

export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

export const SubmissionListResponseSchema = z.object({
  data: z.array(SubmissionResponseSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type SubmissionListResponse = z.infer<typeof SubmissionListResponseSchema>;

export const AllowedVideoContentTypeSchema = z.enum([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
]);

export type AllowedVideoContentType = z.infer<typeof AllowedVideoContentTypeSchema>;

export const CreateSubmissionRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: AllowedVideoContentTypeSchema,
  fileSize: z.number().int().positive(),
  totalParts: z.number().int().positive().max(10000), // S3 max is 10k
  country: z.string().min(2),
  durationSeconds: z.number().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
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

export const StaffSubmissionDetailResponseSchema = StaffSubmissionResponseSchema.extend({
  verification: VideoVerificationStatusSchema.nullable().optional(),
  reviewedBy: UserSchema.nullable().optional(),
  reviewedAt: z.string().datetime().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
});
export type StaffSubmissionDetailResponse = z.infer<typeof StaffSubmissionDetailResponseSchema>;

export const StaffSubmissionListResponseSchema = z.object({
  data: z.array(StaffSubmissionResponseSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalExpectedEarning: z.number().int().nonnegative(),
  totalEarning: z.number().int().nonnegative(),
});
export type StaffSubmissionListResponse = z.infer<typeof StaffSubmissionListResponseSchema>;

export const UpdateSubmissionStatusRequestSchema = z.object({
  status: SubmissionStatusSchema,
  rejectionReason: z.string().optional(),
  earning: z.number().int().nonnegative().optional(),
});
export type UpdateSubmissionStatusRequest = z.infer<typeof UpdateSubmissionStatusRequestSchema>;
