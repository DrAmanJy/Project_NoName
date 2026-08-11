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

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const MobileHandoffExchangeRequestSchema = z.object({
  code: z.string().min(1),
});
export type MobileHandoffExchangeRequest = z.infer<typeof MobileHandoffExchangeRequestSchema>;
