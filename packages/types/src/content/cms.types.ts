// @repo/types — CMS & Store Content Types

import type { BannerPlacement } from '../common/enums.js';

export interface ApiCmsBanner {
  id: string;
  placement: BannerPlacement;
  title: string;
  titleTh?: string | null;
  titleEn?: string | null;
  subtitle?: string | null;
  subtitleTh?: string | null;
  subtitleEn?: string | null;
  tagTh?: string | null;
  tagEn?: string | null;
  targetUrl?: string | null;
  imageDesktopUrl: string;
  imageMobileUrl?: string | null;
  ctaPrimaryTextTh?: string | null;
  ctaPrimaryTextEn?: string | null;
  ctaPrimaryLink?: string | null;
  ctaSecondaryTextTh?: string | null;
  ctaSecondaryTextEn?: string | null;
  ctaSecondaryLink?: string | null;
  couponCode?: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStoreSettings {
  id: string;
  announcementActive: boolean;
  announcementTextTh?: string | null;
  announcementTextEn?: string | null;
  announcementBadgeTh?: string | null;
  announcementBadgeEn?: string | null;
  announcementLink?: string | null;
  freeShippingThreshold: number;
  returnWindowDays: number;
  updatedAt: string;
}

export interface ApiHomeContentResponse {
  heroBanners: ApiCmsBanner[];
  seasonalSpotlights: ApiCmsBanner[];
  promoRibbon?: ApiCmsBanner | null;
  storeSettings: ApiStoreSettings;
}
