import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IVideoVerificationJob extends Document {
  videoUploadId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  lockedAt?: Date;
  lockedBy?: string; // workerId
  availableAt?: Date; // For delayed retries
  lastErrorCode?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  cleanupAt?: Date | null;
}

const VideoVerificationJobSchema = new Schema<IVideoVerificationJob>(
  {
    videoUploadId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'VideoUpload',
      unique: true, // Only one job per upload
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockedAt: {
      type: Date,
    },
    lockedBy: {
      type: String,
    },
    availableAt: {
      type: Date,
      index: true,
    },
    lastErrorCode: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cleanupAt: {
      type: Date,
      default: null,
      index: {
        expireAfterSeconds: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

VideoVerificationJobSchema.index({ createdAt: 1 });

export const VideoVerificationJob = mongoose.model<IVideoVerificationJob>('VideoVerificationJob', VideoVerificationJobSchema);
