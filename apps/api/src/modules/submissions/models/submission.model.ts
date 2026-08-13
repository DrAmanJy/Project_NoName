import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISubmission extends Document {
  userId: Types.ObjectId;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'payment_pending' | 'paid';
  expectedEarning: number;
  earning: number;
  idempotencyKey?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  timeline: {
    status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'payment_pending' | 'paid';
    timestamp: Date;
    userId?: Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'in_review', 'approved', 'rejected', 'payment_pending', 'paid'],
      default: 'draft',
      required: true,
      index: true,
    },
    expectedEarning: {
      type: Number,
      required: true,
      min: 0,
    },
    earning: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    idempotencyKey: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Index to find user's submissions sorted by newest first
SubmissionSchema.index({ userId: 1, createdAt: -1 });
// Unique constraint for idempotency key scoped to user
SubmissionSchema.index(
  { userId: 1, idempotencyKey: 1 }, 
  { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true } } }
);
// Staff list query optimization
SubmissionSchema.index({ createdAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
