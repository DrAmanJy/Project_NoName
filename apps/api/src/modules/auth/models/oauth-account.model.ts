import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IOAuthAccount extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'google' | 'facebook' | 'apple';
  providerAccountId: string;
  email?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const oauthAccountSchema = new Schema<IOAuthAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'apple'],
      required: true,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for uniqueness of oauth identity
oauthAccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
// Index on userId for fast lookups
oauthAccountSchema.index({ userId: 1 });

export const OAuthAccount = mongoose.model<IOAuthAccount>('OAuthAccount', oauthAccountSchema);
