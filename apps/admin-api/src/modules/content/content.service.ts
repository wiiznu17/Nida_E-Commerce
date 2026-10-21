import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AuditActionType, BannerPlacement } from '@repo/types';
import type {
  ApiCmsBanner,
  ApiStoreSettings,
  ApiHomeContentResponse,
} from '@repo/types';
import type {
  SaveCmsBannerDto,
  UpdateStoreSettingsDto,
  ReorderCmsBannersDto,
} from '@repo/validators';

const DEFAULT_STORE_SETTINGS_ID = 'default-store-settings';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAdminHomeContent(): Promise<ApiHomeContentResponse> {
    const banners = await this.prisma.cmsBanner.findMany({
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

    return {
      heroBanners,
      seasonalSpotlights,
      promoRibbon,
      storeSettings,
    };
  }

  async getAllBanners(): Promise<ApiCmsBanner[]> {
    const banners = await this.prisma.cmsBanner.findMany({
      orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
    });
    return banners.map((b) => this.mapBanner(b));
  }

  async getBannerById(id: string): Promise<ApiCmsBanner> {
    const banner = await this.prisma.cmsBanner.findUnique({
      where: { id },
    });
    if (!banner) {
      throw new NotFoundException(`Banner with id ${id} not found`);
    }
    return this.mapBanner(banner);
  }

  async createBanner(
    dto: SaveCmsBannerDto,
    adminId?: string,
  ): Promise<ApiCmsBanner> {
    const maxSortOrder = await this.prisma.cmsBanner.aggregate({
      where: { placement: dto.placement },
      _max: { sortOrder: true },
    });
    const nextSortOrder =
      dto.sortOrder > 0
        ? dto.sortOrder
        : (maxSortOrder._max.sortOrder ?? -1) + 1;

    const banner = await this.prisma.cmsBanner.create({
      data: {
        placement: dto.placement,
        title: dto.titleEn ?? dto.titleTh ?? '',
        titleTh: dto.titleTh ?? null,
        titleEn: dto.titleEn ?? null,
        subtitle: dto.subtitleEn ?? dto.subtitleTh ?? null,
        subtitleTh: dto.subtitleTh ?? null,
        subtitleEn: dto.subtitleEn ?? null,
        tagTh: dto.tagTh ?? null,
        tagEn: dto.tagEn ?? null,
        targetUrl: dto.targetUrl ?? null,
        imageDesktopUrl: dto.imageDesktopUrl,
        imageMobileUrl: dto.imageMobileUrl ?? null,
        ctaPrimaryTextTh: dto.ctaPrimaryTextTh ?? null,
        ctaPrimaryTextEn: dto.ctaPrimaryTextEn ?? null,
        ctaPrimaryLink: dto.ctaPrimaryLink ?? null,
        ctaSecondaryTextTh: dto.ctaSecondaryTextTh ?? null,
        ctaSecondaryTextEn: dto.ctaSecondaryTextEn ?? null,
        ctaSecondaryLink: dto.ctaSecondaryLink ?? null,
        couponCode: dto.couponCode ?? null,
        sortOrder: nextSortOrder,
        isActive: dto.isActive,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdByAdminId: adminId ?? null,
      },
    });

    await this.auditLogService.recordLog({
      adminId,
      actionType: AuditActionType.CREATE,
      targetTable: 'cms_banners',
      targetId: banner.id,
      newValuesJson: banner as unknown as Record<string, unknown>,
    });

    return this.mapBanner(banner);
  }

  async updateBanner(
    id: string,
    dto: SaveCmsBannerDto,
    adminId?: string,
  ): Promise<ApiCmsBanner> {
    const existing = await this.prisma.cmsBanner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Banner with id ${id} not found`);
    }

    const updated = await this.prisma.cmsBanner.update({
      where: { id },
      data: {
        placement: dto.placement,
        title: dto.titleEn ?? dto.titleTh ?? existing.title,
        titleTh: dto.titleTh ?? null,
        titleEn: dto.titleEn ?? null,
        subtitle: dto.subtitleEn ?? dto.subtitleTh ?? null,
        subtitleTh: dto.subtitleTh ?? null,
        subtitleEn: dto.subtitleEn ?? null,
        tagTh: dto.tagTh ?? null,
        tagEn: dto.tagEn ?? null,
        targetUrl: dto.targetUrl ?? null,
        imageDesktopUrl: dto.imageDesktopUrl,
        imageMobileUrl: dto.imageMobileUrl ?? null,
        ctaPrimaryTextTh: dto.ctaPrimaryTextTh ?? null,
        ctaPrimaryTextEn: dto.ctaPrimaryTextEn ?? null,
        ctaPrimaryLink: dto.ctaPrimaryLink ?? null,
        ctaSecondaryTextTh: dto.ctaSecondaryTextTh ?? null,
        ctaSecondaryTextEn: dto.ctaSecondaryTextEn ?? null,
        ctaSecondaryLink: dto.ctaSecondaryLink ?? null,
        couponCode: dto.couponCode ?? null,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });

    await this.auditLogService.recordLog({
      adminId,
      actionType: AuditActionType.UPDATE,
      targetTable: 'cms_banners',
      targetId: id,
      oldValuesJson: existing as unknown as Record<string, unknown>,
      newValuesJson: updated as unknown as Record<string, unknown>,
    });

    return this.mapBanner(updated);
  }

  async deleteBanner(id: string, adminId?: string): Promise<boolean> {
    const existing = await this.prisma.cmsBanner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Banner with id ${id} not found`);
    }

    await this.prisma.cmsBanner.delete({
      where: { id },
    });

    await this.auditLogService.recordLog({
      adminId,
      actionType: AuditActionType.DELETE,
      targetTable: 'cms_banners',
      targetId: id,
      oldValuesJson: existing as unknown as Record<string, unknown>,
    });

    return true;
  }

  async reorderBanners(
    dto: ReorderCmsBannersDto,
    adminId?: string,
  ): Promise<boolean> {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.cmsBanner.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await this.auditLogService.recordLog({
      adminId,
      actionType: AuditActionType.UPDATE,
      targetTable: 'cms_banners',
      targetId: 'batch-reorder',
      newValuesJson: { items: dto.items },
    });

    return true;
  }

  async getStoreSettings(): Promise<ApiStoreSettings> {
    const settings = await this.prisma.storeSettings.upsert({
      where: { id: DEFAULT_STORE_SETTINGS_ID },
      update: {},
      create: {
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
      },
    });

    return {
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
  }

  async updateStoreSettings(
    dto: UpdateStoreSettingsDto,
    adminId?: string,
  ): Promise<ApiStoreSettings> {
    const existing = await this.getStoreSettings();

    const updated = await this.prisma.storeSettings.update({
      where: { id: DEFAULT_STORE_SETTINGS_ID },
      data: {
        announcementActive:
          dto.announcementActive ?? existing.announcementActive,
        announcementTextTh:
          dto.announcementTextTh !== undefined
            ? dto.announcementTextTh
            : existing.announcementTextTh,
        announcementTextEn:
          dto.announcementTextEn !== undefined
            ? dto.announcementTextEn
            : existing.announcementTextEn,
        announcementBadgeTh:
          dto.announcementBadgeTh !== undefined
            ? dto.announcementBadgeTh
            : existing.announcementBadgeTh,
        announcementBadgeEn:
          dto.announcementBadgeEn !== undefined
            ? dto.announcementBadgeEn
            : existing.announcementBadgeEn,
        announcementLink:
          dto.announcementLink !== undefined
            ? dto.announcementLink
            : existing.announcementLink,
        freeShippingThreshold:
          dto.freeShippingThreshold !== undefined
            ? dto.freeShippingThreshold
            : existing.freeShippingThreshold,
        returnWindowDays:
          dto.returnWindowDays !== undefined
            ? dto.returnWindowDays
            : existing.returnWindowDays,
      },
    });

    await this.auditLogService.recordLog({
      adminId,
      actionType: AuditActionType.UPDATE,
      targetTable: 'store_settings',
      targetId: DEFAULT_STORE_SETTINGS_ID,
      oldValuesJson: existing as unknown as Record<string, unknown>,
      newValuesJson: updated as unknown as Record<string, unknown>,
    });

    return {
      id: updated.id,
      announcementActive: updated.announcementActive,
      announcementTextTh: updated.announcementTextTh,
      announcementTextEn: updated.announcementTextEn,
      announcementBadgeTh: updated.announcementBadgeTh,
      announcementBadgeEn: updated.announcementBadgeEn,
      announcementLink: updated.announcementLink,
      freeShippingThreshold: Number(updated.freeShippingThreshold),
      returnWindowDays: updated.returnWindowDays,
      updatedAt: updated.updatedAt.toISOString(),
    };
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
