import { z } from 'zod';

// ─── Earning Status ──────────────────────────────────────────

export const EarningStatusSchema = z.enum(['PENDING', 'PROCESSING', 'PAID', 'FAILED']);

export type EarningStatus = z.infer<typeof EarningStatusSchema>;

// ─── Earning Schemas ─────────────────────────────────────────

export const EarningSchema = z.object({
  id: z.string(),
  userId: z.string(),
  videoId: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string().default('USD'),
  status: EarningStatusSchema,
  paidAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type Earning = z.infer<typeof EarningSchema>;

export const EarningsSummarySchema = z.object({
  totalEarnings: z.number().nonnegative(),
  pendingEarnings: z.number().nonnegative(),
  paidEarnings: z.number().nonnegative(),
  currency: z.string(),
});

export type EarningsSummary = z.infer<typeof EarningsSummarySchema>;

export const EarningsListResponseSchema = z.object({
  earnings: z.array(EarningSchema),
  summary: EarningsSummarySchema,
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type EarningsListResponse = z.infer<typeof EarningsListResponseSchema>;
