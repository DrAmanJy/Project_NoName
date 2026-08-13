import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────

export const RoleSchema = z.enum(['user', 'employee', 'admin']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean(),
  role: RoleSchema.default('user'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const EmployeeListResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type EmployeeListResponse = z.infer<typeof EmployeeListResponseSchema>;


export const UpdateEmployeeRequestSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['user', 'employee', 'admin']).optional(),
});
export type UpdateEmployeeRequest = z.infer<typeof UpdateEmployeeRequestSchema>;

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
