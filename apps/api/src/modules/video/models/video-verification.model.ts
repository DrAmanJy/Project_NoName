import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IVideoVerification extends Document {
  videoUploadId: Types.ObjectId;
  userId: Types.ObjectId;
  
  scriptVerification: {
    status: 'pass' | 'fail' | 'uncertain' | 'not_run';
    confidence?: number;
    transcript?: string;
    missingSegments?: string[];
    extraContent?: string[];
  };

  documentVerification: {
    status: 'pass' | 'fail' | 'uncertain' | 'not_run';
    documentType?: 'passport' | 'other' | 'uncertain';
    heldByPerson?: boolean;
    confidence?: number;
    evidence?: string[];
  };

  videoAuthenticity: {
    status: 'likely_real' | 'likely_ai_generated' | 'uncertain' | 'not_run';
    confidence?: number;
    signals?: string[];
  };

  overallStatus: 'pass' | 'fail' | 'uncertain' | 'not_run';
  
  verificationVersion: number;

  createdAt: Date;
  updatedAt: Date;
}

const VideoVerificationSchema = new Schema<IVideoVerification>(
  {
    videoUploadId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'VideoUpload',
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    scriptVerification: {
      status: {
        type: String,
        enum: ['pass', 'fail', 'uncertain', 'not_run'],
        required: true,
      },
      confidence: Number,
      transcript: String,
      missingSegments: [String],
      extraContent: [String],
    },
    documentVerification: {
      status: {
        type: String,
        enum: ['pass', 'fail', 'uncertain', 'not_run'],
        required: true,
      },
      documentType: {
        type: String,
        enum: ['passport', 'other', 'uncertain'],
      },
      heldByPerson: Boolean,
      confidence: Number,
      evidence: [String],
    },
    videoAuthenticity: {
      status: {
        type: String,
        enum: ['likely_real', 'likely_ai_generated', 'uncertain', 'not_run'],
        required: true,
      },
      confidence: Number,
      signals: [String],
    },
    overallStatus: {
      type: String,
      enum: ['pass', 'fail', 'uncertain', 'not_run'],
      required: true,
    },
    verificationVersion: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

VideoVerificationSchema.index({ createdAt: 1 });

export const VideoVerification = mongoose.model<IVideoVerification>('VideoVerification', VideoVerificationSchema);
