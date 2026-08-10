import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IOAuthTransaction extends Document {
  provider: 'google' | 'facebook' | 'apple';
  stateHash: string;
  encryptedCodeVerifier?: string;
  nonceHash?: string;
  redirectUri?: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const oauthTransactionSchema = new Schema<IOAuthTransaction>(
  {
    provider: {
      type: String,
      enum: ['google', 'facebook', 'apple'],
      required: true,
    },
    stateHash: {
      type: String,
      required: true,
      unique: true,
    },
    encryptedCodeVerifier: {
      type: String,
    },
    nonceHash: {
      type: String,
    },
    redirectUri: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

// TTL index for automatic cleanup of stale transactions
oauthTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthTransaction = mongoose.model<IOAuthTransaction>('OAuthTransaction', oauthTransactionSchema);
