import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const MobileHandoffExchangeRequestSchema = z.object({
  code: z.string().min(1),
});
export type MobileHandoffExchangeRequest = z.infer<typeof MobileHandoffExchangeRequestSchema>;
