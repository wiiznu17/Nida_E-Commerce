import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoreContentService } from '../../src/modules/content/content.service.js';
import { BannerPlacement } from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('StoreContentService (Customer Storefront API)', () => {
  let service: StoreContentService;
  let prismaMock: {
    cmsBanner: {
      findMany: ReturnType<typeof vi.fn>;
    };
    storeSettings: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  const sampleHeroBanner = {
    id: 'hero-1',
    placement: BannerPlacement.HERO_HOME,
    title: 'Modern Heritage 2026',
    titleTh: 'แคมเปญมรดกร่วมสมัย',
    titleEn: 'Modern Heritage 2026',
    subtitle: 'Fall / Winter',
    subtitleTh: 'ฤดูใบไม้ร่วง / หนาว',
    subtitleEn: 'Fall / Winter',
    tagTh: 'สินค้ามาใหม่',
    tagEn: 'NEW ARRIVALS',
    targetUrl: '/collections/women',
    imageDesktopUrl: 'https://images.unsplash.com/hero.jpg',
    imageMobileUrl: null,
    ctaPrimaryTextTh: 'ช้อปผู้หญิง',
    ctaPrimaryTextEn: 'Shop Women',
    ctaPrimaryLink: '/collections/women',
    ctaSecondaryTextTh: 'ช้อปผู้ชาย',
    ctaSecondaryTextEn: 'Shop Men',
    ctaSecondaryLink: '/collections/men',
    couponCode: null,
    sortOrder: 0,
    isActive: true,
    startDate: null,
    endDate: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
  };

  const samplePromoRibbon = {
    id: 'ribbon-1',
    placement: BannerPlacement.PROMO_RIBBON,
    title: 'Special Privilege',
    titleTh: 'สิทธิพิเศษ',
    titleEn: 'Special Privilege',
    subtitle: 'Get 20% off',
    subtitleTh: 'รับส่วนลด 20%',
    subtitleEn: 'Get 20% off',
    tagTh: 'โปรโมชันพิเศษ',
    tagEn: 'PROMO CODE',
    targetUrl: null,
    imageDesktopUrl: 'https://images.unsplash.com/ribbon.jpg',
    imageMobileUrl: null,
    ctaPrimaryTextTh: null,
    ctaPrimaryTextEn: null,
    ctaPrimaryLink: null,
    ctaSecondaryTextTh: null,
    ctaSecondaryTextEn: null,
    ctaSecondaryLink: null,
    couponCode: 'NIDA20',
    sortOrder: 0,
    isActive: true,
    startDate: null,
    endDate: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
  };

  const sampleSpotlight = {
    id: 'spotlight-1',
    placement: BannerPlacement.SEASONAL_SPOTLIGHT,
    title: 'Modern Tailored Outerwear',
    titleTh: 'เสื้อคลุมสไตล์โมเดิร์น',
    titleEn: 'Modern Tailored Outerwear',
    subtitle: 'Sculpted silhouettes',
    subtitleTh: 'สัมผัสโครงสร้างอันประณีต',
    subtitleEn: 'Sculpted silhouettes',
    tagTh: 'คอลเลกชันใหม่ / สุภาพสตรี',
    tagEn: "WOMEN'S / NEW SEASON",
    targetUrl: '/collections/women',
    imageDesktopUrl: 'https://images.unsplash.com/spotlight.jpg',
    imageMobileUrl: null,
    ctaPrimaryTextTh: 'ดูคอลเลกชันสตรี',
    ctaPrimaryTextEn: 'Discover Women',
    ctaPrimaryLink: '/collections/women',
    ctaSecondaryTextTh: null,
    ctaSecondaryTextEn: null,
    ctaSecondaryLink: null,
    couponCode: null,
    sortOrder: 0,
    isActive: true,
    startDate: null,
    endDate: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
  };

  beforeEach(() => {
    prismaMock = {
      cmsBanner: {
        findMany: vi.fn(),
      },
      storeSettings: {
        findUnique: vi.fn(),
      },
    };

    service = new StoreContentService(prismaMock as unknown as PrismaService);
  });

  describe('getHomeContent', () => {
    it('returns active banners grouped into heroBanners, seasonalSpotlights, and promoRibbon', async () => {
      prismaMock.cmsBanner.findMany.mockResolvedValue([
        sampleHeroBanner,
        sampleSpotlight,
        samplePromoRibbon,
      ]);
      prismaMock.storeSettings.findUnique.mockResolvedValue(null); // tests default settings fallback

      const result = await service.getHomeContent();

      expect(result.heroBanners).toHaveLength(1);
      expect(result.heroBanners[0].id).toBe('hero-1');
      expect(result.heroBanners[0].titleEn).toBe('Modern Heritage 2026');
      expect(result.seasonalSpotlights).toHaveLength(1);
      expect(result.seasonalSpotlights[0].id).toBe('spotlight-1');
      expect(result.promoRibbon).toBeDefined();
      expect(result.promoRibbon?.id).toBe('ribbon-1');
      expect(result.promoRibbon?.couponCode).toBe('NIDA20');
      expect(result.storeSettings.freeShippingThreshold).toBe(1000);
      expect(result.storeSettings.announcementActive).toBe(true);
    });

    it('returns custom store settings when present in database', async () => {
      prismaMock.cmsBanner.findMany.mockResolvedValue([]);
      prismaMock.storeSettings.findUnique.mockResolvedValue({
        id: 'default-store-settings',
        announcementActive: false,
        announcementTextTh: 'ประกาศปรับปรุง',
        announcementTextEn: 'Maintenance',
        announcementBadgeTh: 'NOTICE',
        announcementBadgeEn: 'NOTICE',
        announcementLink: '/notice',
        freeShippingThreshold: 2000,
        returnWindowDays: 14,
        updatedAt: new Date('2026-10-15'),
      });

      const result = await service.getHomeContent();

      expect(result.heroBanners).toEqual([]);
      expect(result.promoRibbon).toBeNull();
      expect(result.storeSettings.announcementActive).toBe(false);
      expect(result.storeSettings.freeShippingThreshold).toBe(2000);
      expect(result.storeSettings.returnWindowDays).toBe(14);
    });
  });

  describe('getStoreSettings', () => {
    it('returns default settings when database row does not exist', async () => {
      prismaMock.storeSettings.findUnique.mockResolvedValue(null);

      const result = await service.getStoreSettings();

      expect(result.freeShippingThreshold).toBe(1000);
      expect(result.returnWindowDays).toBe(7);
      expect(result.announcementBadgeEn).toBe('LIMITED OFFER');
    });
  });
});
