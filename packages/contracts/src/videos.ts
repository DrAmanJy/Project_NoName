import { z } from 'zod';

// ─── Video Status ────────────────────────────────────────────

export const VideoStatusSchema = z.enum([
  'UPLOADING',
  'PROCESSING',
  'UNDER_REVIEW',
  'SELECTED',
  'REJECTED',
  'PAID',
]);

export type VideoStatus = z.infer<typeof VideoStatusSchema>;

// ─── Video Schemas ───────────────────────────────────────────

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: VideoStatusSchema,
  userId: z.string(),
  fileKey: z.string(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  duration: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Video = z.infer<typeof VideoSchema>;

export const CreateVideoRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  fileName: z.string(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
});

export type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>;

export const UploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  fileKey: z.string(),
});

export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;

export const VideoListResponseSchema = z.object({
  videos: z.array(VideoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type VideoListResponse = z.infer<typeof VideoListResponseSchema>;
