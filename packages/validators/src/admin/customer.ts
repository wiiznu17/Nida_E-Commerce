import { z } from 'zod';
import { AccountStatus, MembershipTier } from '@repo/types';

export const adminCustomerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  tier: z.nativeEnum(MembershipTier).optional(),
  sortBy: z
    .enum(['createdAt', 'fullName', 'totalSpent', 'ordersCount', 'points'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminCustomerQueryInput = z.infer<typeof adminCustomerQuerySchema>;
