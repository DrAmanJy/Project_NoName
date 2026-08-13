import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  avatarUrl?: string;
  isActive: boolean;
  role: 'user' | 'employee' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    avatarUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'employee', 'admin'],
      default: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for admin employee search
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
