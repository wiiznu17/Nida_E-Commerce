import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoreContentService } from '../../src/modules/content/content.service.js';
import { BannerPlacement } from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';

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
  let redisMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
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

    redisMock = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };

    service = new StoreContentService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
    );
  });

  describe('getHomeContent', () => {
    it('returns cached content directly on cache hit without database query', async () => {
      const cachedData = {
        heroBanners: [sampleHeroBanner],
        seasonalSpotlights: [],
        promoRibbon: null,
        storeSettings: {
          id: 'default-store-settings',
          announcementActive: true,
          announcementTextTh: 'แคชทดสอบ',
          announcementTextEn: 'Cache Test',
          announcementBadgeTh: 'TEST',
          announcementBadgeEn: 'TEST',
          announcementLink: '/test',
          freeShippingThreshold: 500,
          returnWindowDays: 7,
          updatedAt: new Date().toISOString(),
        },
      };

      redisMock.get.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await service.getHomeContent();

      expect(redisMock.get).toHaveBeenCalledWith('content:home');
      expect(prismaMock.cmsBanner.findMany).not.toHaveBeenCalled();
      expect(prismaMock.storeSettings.findUnique).not.toHaveBeenCalled();
      expect(result.heroBanners).toHaveLength(1);
      expect(result.storeSettings.announcementTextEn).toBe('Cache Test');
    });

    it('returns active banners grouped and writes to cache on cache miss (TTL: 900s)', async () => {
      prismaMock.cmsBanner.findMany.mockResolvedValue([
        sampleHeroBanner,
        sampleSpotlight,
        samplePromoRibbon,
      ]);
      prismaMock.storeSettings.findUnique.mockResolvedValue(null);

      const result = await service.getHomeContent();

      expect(redisMock.get).toHaveBeenCalledWith('content:home');
      expect(prismaMock.cmsBanner.findMany).toHaveBeenCalled();
      expect(redisMock.set).toHaveBeenCalledWith(
        'content:home',
        expect.any(String),
        900,
      );
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

    it('evicts corrupted cache key and falls back to database when cached home content is invalid JSON', async () => {
      redisMock.get.mockResolvedValueOnce('invalid-json{{{');
      prismaMock.cmsBanner.findMany.mockResolvedValue([]);
      prismaMock.storeSettings.findUnique.mockResolvedValue(null);

      const result = await service.getHomeContent();

      expect(redisMock.del).toHaveBeenCalledWith('content:home');
      expect(prismaMock.cmsBanner.findMany).toHaveBeenCalled();
      expect(result.storeSettings.freeShippingThreshold).toBe(1000);
    });
  });

  describe('getStoreSettings', () => {
    it('returns cached store settings on cache hit without database query', async () => {
      const cachedSettings = {
        id: 'default-store-settings',
        announcementActive: true,
        announcementTextTh: 'แคช',
        announcementTextEn: 'Cached',
        announcementBadgeTh: 'HOT',
        announcementBadgeEn: 'HOT',
        announcementLink: '/sale',
        freeShippingThreshold: 800,
        returnWindowDays: 14,
        updatedAt: new Date().toISOString(),
      };

      redisMock.get.mockResolvedValueOnce(JSON.stringify(cachedSettings));

      const result = await service.getStoreSettings();

      expect(redisMock.get).toHaveBeenCalledWith('content:settings');
      expect(prismaMock.storeSettings.findUnique).not.toHaveBeenCalled();
      expect(result.freeShippingThreshold).toBe(800);
    });

    it('evicts corrupted cache key and falls back to database when cached store settings is invalid JSON', async () => {
      redisMock.get.mockResolvedValueOnce('bad-json-payload');
      prismaMock.storeSettings.findUnique.mockResolvedValue(null);

      const result = await service.getStoreSettings();

      expect(redisMock.del).toHaveBeenCalledWith('content:settings');
      expect(prismaMock.storeSettings.findUnique).toHaveBeenCalled();
      expect(result.freeShippingThreshold).toBe(1000);
    });

    it('returns default settings when database row does not exist and caches with TTL 3600s', async () => {
      prismaMock.storeSettings.findUnique.mockResolvedValue(null);

      const result = await service.getStoreSettings();

      expect(prismaMock.storeSettings.findUnique).toHaveBeenCalled();
      expect(redisMock.set).toHaveBeenCalledWith(
        'content:settings',
        expect.any(String),
        3600,
      );
      expect(result.freeShippingThreshold).toBe(1000);
      expect(result.returnWindowDays).toBe(7);
      expect(result.announcementBadgeEn).toBe('LIMITED OFFER');
    });
  });
});
