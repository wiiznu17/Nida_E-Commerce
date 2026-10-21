// @repo/validators — Admin CMS & Content Schemas

import { z } from 'zod';
import { BannerPlacement } from '@repo/types';

export const saveCmsBannerSchema = z.object({
  placement: z.nativeEnum(BannerPlacement).default(BannerPlacement.HERO_HOME),
  titleTh: z
    .string()
    .trim()
    .max(70, 'Headline TH must not exceed 70 characters')
    .optional()
    .nullable(),
  titleEn: z
    .string()
    .trim()
    .max(70, 'Headline EN must not exceed 70 characters')
    .optional()
    .nullable(),
  subtitleTh: z
    .string()
    .trim()
    .max(160, 'Subtitle TH must not exceed 160 characters')
    .optional()
    .nullable(),
  subtitleEn: z
    .string()
    .trim()
    .max(160, 'Subtitle EN must not exceed 160 characters')
    .optional()
    .nullable(),
  tagTh: z
    .string()
    .trim()
    .max(30, 'Tag TH must not exceed 30 characters')
    .optional()
    .nullable(),
  tagEn: z
    .string()
    .trim()
    .max(30, 'Tag EN must not exceed 30 characters')
    .optional()
    .nullable(),
  targetUrl: z.string().trim().max(255).optional().nullable(),
  imageDesktopUrl: z
    .string()
    .trim()
    .min(1, 'Desktop banner image is required')
    .max(500),
  imageMobileUrl: z.string().trim().max(500).optional().nullable(),
  ctaPrimaryTextTh: z
    .string()
    .trim()
    .max(50, 'CTA Primary Text TH must not exceed 50 characters')
    .optional()
    .nullable(),
  ctaPrimaryTextEn: z
    .string()
    .trim()
    .max(50, 'CTA Primary Text EN must not exceed 50 characters')
    .optional()
    .nullable(),
  ctaPrimaryLink: z.string().trim().max(255).optional().nullable(),
  ctaSecondaryTextTh: z
    .string()
    .trim()
    .max(50, 'CTA Secondary Text TH must not exceed 50 characters')
    .optional()
    .nullable(),
  ctaSecondaryTextEn: z
    .string()
    .trim()
    .max(50, 'CTA Secondary Text EN must not exceed 50 characters')
    .optional()
    .nullable(),
  ctaSecondaryLink: z.string().trim().max(255).optional().nullable(),
  couponCode: z.string().trim().max(20).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export type SaveCmsBannerDto = z.infer<typeof saveCmsBannerSchema>;

export const updateStoreSettingsSchema = z.object({
  announcementActive: z.boolean().optional(),
  announcementTextTh: z
    .string()
    .trim()
    .max(120, 'Announcement text TH must not exceed 120 characters')
    .optional()
    .nullable(),
  announcementTextEn: z
    .string()
    .trim()
    .max(120, 'Announcement text EN must not exceed 120 characters')
    .optional()
    .nullable(),
  announcementBadgeTh: z
    .string()
    .trim()
    .max(25, 'Announcement badge TH must not exceed 25 characters')
    .optional()
    .nullable(),
  announcementBadgeEn: z
    .string()
    .trim()
    .max(25, 'Announcement badge EN must not exceed 25 characters')
    .optional()
    .nullable(),
  announcementLink: z.string().trim().max(255).optional().nullable(),
  freeShippingThreshold: z
    .number()
    .min(0, 'Free shipping threshold must be >= 0')
    .optional(),
  returnWindowDays: z
    .number()
    .int()
    .min(1, 'Return window must be at least 1 day')
    .max(90, 'Return window cannot exceed 90 days')
    .optional(),
});

export type UpdateStoreSettingsDto = z.infer<typeof updateStoreSettingsSchema>;

export const reorderCmsBannersSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1, 'At least one item is required for reordering'),
});

export type ReorderCmsBannersDto = z.infer<typeof reorderCmsBannersSchema>;
