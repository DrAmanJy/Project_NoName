import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IVideoUpload extends Document {
  userId: Types.ObjectId;
  objectKey: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
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

VideoUploadSchema.index({ createdAt: 1 });

export const VideoUpload = mongoose.model<IVideoUpload>('VideoUpload', VideoUploadSchema);
