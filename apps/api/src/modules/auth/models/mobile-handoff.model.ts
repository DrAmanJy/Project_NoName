import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
export interface IMobileAuthHandoff extends Document {
  codeHash: string;
  userId: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const MobileAuthHandoffSchema = new Schema<IMobileAuthHandoff>({
  codeHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: Schema.Types.ObjectId, ref: 'OAuthTransaction', required: true },
  expiresAt: { type: Date, required: true },
  consumedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// TTL index to automatically clean up expired handoff documents
MobileAuthHandoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MobileAuthHandoff = mongoose.model<IMobileAuthHandoff>('MobileAuthHandoff', MobileAuthHandoffSchema);
