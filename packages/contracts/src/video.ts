import { z } from 'zod';

export const AllowedVideoContentTypes = [
  'video/mp4',
  'video/quicktime', // MOV
  'video/webm',
] as const;

export const CreateVideoUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().refine(val => AllowedVideoContentTypes.includes(val as any), { 
    message: `Must be a supported video format: ${AllowedVideoContentTypes.join(', ')}` 
  }),
  fileSize: z.number().int().positive(),
  totalParts: z.number().int().positive().max(10000), // S3 max is 10k
});
export type CreateVideoUploadInput = z.infer<typeof CreateVideoUploadSchema>;

export const CreateVideoUploadResponseSchema = z.object({
  uploadId: z.string(),
  objectKey: z.string(),
  multipartUploadId: z.string(),
});
export type CreateVideoUploadResponse = z.infer<typeof CreateVideoUploadResponseSchema>;

export const MultipartSignRequestSchema = z.object({
  partNumbers: z.array(z.number().int().positive().max(10000)).min(1).max(100),
});
export type MultipartSignRequestInput = z.infer<typeof MultipartSignRequestSchema>;

export const MultipartSignResponseSchema = z.object({
  presignedUrls: z.array(z.object({
    partNumber: z.number(),
    url: z.string().url(),
  })),
});
export type MultipartSignResponse = z.infer<typeof MultipartSignResponseSchema>;

export const MultipartCompleteRequestSchema = z.object({
  parts: z.array(z.object({
    partNumber: z.number().int().positive(),
    eTag: z.string().min(1),
  })).min(1),
});
export type MultipartCompleteRequestInput = z.infer<typeof MultipartCompleteRequestSchema>;

export const VideoUploadStatusSchema = z.object({
  id: z.string(),
  status: z.enum([
    'created',
    'uploading',
    'uploaded',
    'processing',
    'verified',
    'rejected',
    'failed',
    'cancelled'
  ]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VideoUploadStatus = z.infer<typeof VideoUploadStatusSchema>;

export const VideoVerificationStatusSchema = z.object({
  status: z.enum(['pass', 'fail', 'uncertain', 'not_run']),
  script: z.object({
    status: z.enum(['pass', 'fail', 'uncertain', 'not_run']),
    transcript: z.string().optional(),
    confidence: z.number().optional(),
    missingSegments: z.array(z.string()).optional(),
    extraContent: z.array(z.string()).optional(),
  }),
  document: z.object({
    status: z.enum(['pass', 'fail', 'uncertain', 'not_run']),
    documentType: z.enum(['passport', 'other', 'uncertain']).optional(),
    heldByPerson: z.boolean().optional(),
    confidence: z.number().optional(),
    evidence: z.array(z.string()).optional(),
  }),
  authenticity: z.object({
    status: z.enum(['likely_real', 'likely_ai_generated', 'uncertain', 'not_run']),
    confidence: z.number().optional(),
    signals: z.array(z.string()).optional(),
  }),
});
export type VideoVerificationStatus = z.infer<typeof VideoVerificationStatusSchema>;

export const ScriptVerificationResultSchema = z.object({
  status: z.enum(['pass', 'fail', 'uncertain']),
  confidence: z.number().min(0).max(1),
  missingSegments: z.array(z.string()),
  extraContent: z.array(z.string()),
});
export type ScriptVerificationResultInput = z.infer<typeof ScriptVerificationResultSchema>;

export const DocumentVerificationResultSchema = z.object({
  status: z.enum(['pass', 'fail', 'uncertain']),
  documentType: z.enum(['passport', 'other', 'uncertain']),
  heldByPerson: z.boolean(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});
export type DocumentVerificationResultInput = z.infer<typeof DocumentVerificationResultSchema>;
