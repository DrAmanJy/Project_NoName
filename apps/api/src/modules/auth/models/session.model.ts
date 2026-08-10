import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionTokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
  userAgent?: string;
  ipAddressHash?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionTokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
    userAgent: {
      type: String,
    },
    ipAddressHash: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

sessionSchema.index({ userId: 1 });
// TTL index for automatic deletion of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
