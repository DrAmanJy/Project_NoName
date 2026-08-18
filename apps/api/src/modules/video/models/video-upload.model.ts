import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IVideoUpload extends Document {
  userId: Types.ObjectId;
  submissionId: Types.ObjectId;
  objectKey: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  uploadId: string; // The multipart upload ID or unique session ID
  multipartUploadId: string; // The actual S3 multipart upload ID
  status:
    | 'created'
    | 'uploading'
    | 'uploaded'
    | 'processing'
    | 'verified'
    | 'rejected'
    | 'failed'
    | 'cancelled';
  totalParts: number;
  completedParts?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
}

const VideoUploadSchema = new Schema<IVideoUpload>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Submission',
      index: true,
    },
    objectKey: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    durationSeconds: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },

    uploadId: {
      type: String,
      required: true,
      unique: true,
    },
    multipartUploadId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'created',
        'uploading',
        'uploaded',
        'processing',
        'verified',
        'rejected',
        'failed',
        'cancelled',
      ],
      default: 'created',
      required: true,
      index: true,
    },
    totalParts: {
      type: Number,
      required: true,
    },
    completedParts: {
      type: Number,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    processingStartedAt: {
      type: Date,
    },
    processingCompletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for time-based cleanup queries
VideoUploadSchema.index({ createdAt: 1 });
// TTL index: auto-delete cancelled upload documents after VIDEO_RETENTION_DAYS days.
// This only removes the DB record; the aborted S3 multipart is already cleaned up at cancel time.
VideoUploadSchema.index(
  { cancelledAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { status: 'cancelled' } },
);

export const VideoUpload = mongoose.model<IVideoUpload>('VideoUpload', VideoUploadSchema);
