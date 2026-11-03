import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { BannerPlacement } from '@repo/types';
import type {
  ApiCmsBanner,
  ApiStoreSettings,
  ApiHomeContentResponse,
} from '@repo/types';

const DEFAULT_STORE_SETTINGS_ID = 'default-store-settings';

@Injectable()
export class StoreContentService {
  private readonly logger = new Logger(StoreContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis?: RedisService,
  ) {}

  async getHomeContent(): Promise<ApiHomeContentResponse> {
    const cacheKey = 'content:home';
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as ApiHomeContentResponse;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Failed to parse cached home content (${cacheKey}): ${errMsg}. Evicting corrupted cache.`,
          );
          await this.redis.del(cacheKey);
        }
      }
    }

    const now = new Date();

    const banners = await this.prisma.cmsBanner.findMany({
      where: {
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
    });

    const heroBanners = banners
      .filter((b) => b.placement === BannerPlacement.HERO_HOME)
      .map((b) => this.mapBanner(b));

    const seasonalSpotlights = banners
      .filter((b) => b.placement === BannerPlacement.SEASONAL_SPOTLIGHT)
      .map((b) => this.mapBanner(b));

    const promoRibbonRaw = banners.find(
      (b) => b.placement === BannerPlacement.PROMO_RIBBON,
    );
    const promoRibbon = promoRibbonRaw ? this.mapBanner(promoRibbonRaw) : null;

    const storeSettings = await this.getStoreSettings();

    const response: ApiHomeContentResponse = {
      heroBanners,
      seasonalSpotlights,
      promoRibbon,
      storeSettings,
    };

    if (this.redis) {
      await this.redis.set(cacheKey, JSON.stringify(response), 900);
    }

    return response;
  }

  async getStoreSettings(): Promise<ApiStoreSettings> {
    const cacheKey = 'content:settings';
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as ApiStoreSettings;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Failed to parse cached store settings (${cacheKey}): ${errMsg}. Evicting corrupted cache.`,
          );
          await this.redis.del(cacheKey);
        }
      }
    }

    const settings = await this.prisma.storeSettings.findUnique({
      where: { id: DEFAULT_STORE_SETTINGS_ID },
    });

    if (!settings) {
      const defaultSettings: ApiStoreSettings = {
        id: DEFAULT_STORE_SETTINGS_ID,
        announcementActive: true,
        announcementTextTh:
          'FALL SALE: รับส่วนลดสูงสุด 50% | ส่งฟรีเมื่อช้อปครบ ฿1,000',
        announcementTextEn:
          'FALL SALE: UP TO 50% OFF | FREE SHIPPING OVER ฿1,000',
        announcementBadgeTh: 'LIMITED OFFER',
        announcementBadgeEn: 'LIMITED OFFER',
        announcementLink: '/collections',
        freeShippingThreshold: 1000,
        returnWindowDays: 7,
        updatedAt: new Date().toISOString(),
      };

      if (this.redis) {
        await this.redis.set(cacheKey, JSON.stringify(defaultSettings), 3600);
      }

      return defaultSettings;
    }

    const result: ApiStoreSettings = {
      id: settings.id,
      announcementActive: settings.announcementActive,
      announcementTextTh: settings.announcementTextTh,
      announcementTextEn: settings.announcementTextEn,
      announcementBadgeTh: settings.announcementBadgeTh,
      announcementBadgeEn: settings.announcementBadgeEn,
      announcementLink: settings.announcementLink,
      freeShippingThreshold: Number(settings.freeShippingThreshold),
      returnWindowDays: settings.returnWindowDays,
      updatedAt: settings.updatedAt.toISOString(),
    };

    if (this.redis) {
      await this.redis.set(cacheKey, JSON.stringify(result), 3600);
    }

    return result;
  }

  private mapBanner(b: {
    id: string;
    placement: BannerPlacement;
    title: string;
    titleTh: string | null;
    titleEn: string | null;
    subtitle: string | null;
    subtitleTh: string | null;
    subtitleEn: string | null;
    tagTh: string | null;
    tagEn: string | null;
    targetUrl: string | null;
    imageDesktopUrl: string;
    imageMobileUrl: string | null;
    ctaPrimaryTextTh: string | null;
    ctaPrimaryTextEn: string | null;
    ctaPrimaryLink: string | null;
    ctaSecondaryTextTh: string | null;
    ctaSecondaryTextEn: string | null;
    ctaSecondaryLink: string | null;
    couponCode: string | null;
    sortOrder: number;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ApiCmsBanner {
    return {
      id: b.id,
      placement: b.placement,
      title: b.title,
      titleTh: b.titleTh,
      titleEn: b.titleEn,
      subtitle: b.subtitle,
      subtitleTh: b.subtitleTh,
      subtitleEn: b.subtitleEn,
      tagTh: b.tagTh,
      tagEn: b.tagEn,
      targetUrl: b.targetUrl,
      imageDesktopUrl: b.imageDesktopUrl,
      imageMobileUrl: b.imageMobileUrl,
      ctaPrimaryTextTh: b.ctaPrimaryTextTh,
      ctaPrimaryTextEn: b.ctaPrimaryTextEn,
      ctaPrimaryLink: b.ctaPrimaryLink,
      ctaSecondaryTextTh: b.ctaSecondaryTextTh,
      ctaSecondaryTextEn: b.ctaSecondaryTextEn,
      ctaSecondaryLink: b.ctaSecondaryLink,
      couponCode: b.couponCode,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      startDate: b.startDate?.toISOString() ?? null,
      endDate: b.endDate?.toISOString() ?? null,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };
  }
}
