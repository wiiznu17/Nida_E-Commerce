import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentService } from '../../src/modules/content/content.service.js';
import { BannerPlacement, AuditActionType } from '@repo/types';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';

describe('ContentService (Admin API)', () => {
  let service: ContentService;
  let prismaMock: {
    cmsBanner: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
    storeSettings: {
      upsert: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let auditLogServiceMock: {
    recordLog: ReturnType<typeof vi.fn>;
  };

  const sampleBanner = {
    id: 'b-1',
    placement: BannerPlacement.HERO_HOME,
    title: 'Fall Campaign 2026',
    titleTh: 'แคมเปญฤดูใบไม้ร่วง 2026',
    titleEn: 'Fall Campaign 2026',
    subtitle: 'Luxury Modern Heritage',
    subtitleTh: 'ความสง่างามร่วมสมัย',
    subtitleEn: 'Luxury Modern Heritage',
    tagTh: 'คอลเลกชันใหม่',
    tagEn: 'NEW COLLECTION',
    targetUrl: '/collections/women',
    imageDesktopUrl: 'https://images.unsplash.com/hero-desktop.jpg',
    imageMobileUrl: 'https://images.unsplash.com/hero-mobile.jpg',
    ctaPrimaryTextTh: 'เลือกซื้อสินค้า',
    ctaPrimaryTextEn: 'Shop Now',
    ctaPrimaryLink: '/collections/women',
    ctaSecondaryTextTh: 'ดูลุคบุ๊ก',
    ctaSecondaryTextEn: 'Lookbook',
    ctaSecondaryLink: '/about',
    couponCode: 'NIDA20',
    sortOrder: 0,
    isActive: true,
    startDate: new Date('2026-10-01'),
    endDate: new Date('2026-11-01'),
    createdByAdminId: 'admin-1',
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
  };

  const sampleStoreSettings = {
    id: 'default-store-settings',
    announcementActive: true,
    announcementTextTh: 'FALL SALE: รับส่วนลดสูงสุด 50%',
    announcementTextEn: 'FALL SALE: UP TO 50% OFF',
    announcementBadgeTh: 'LIMITED OFFER',
    announcementBadgeEn: 'LIMITED OFFER',
    announcementLink: '/collections',
    freeShippingThreshold: 1000,
    returnWindowDays: 7,
    updatedAt: new Date('2026-10-01'),
  };

  beforeEach(() => {
    prismaMock = {
      cmsBanner: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        aggregate: vi.fn(),
      },
      storeSettings: {
        upsert: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    auditLogServiceMock = {
      recordLog: vi.fn().mockResolvedValue(null),
    };

    service = new ContentService(
      prismaMock as unknown as PrismaService,
      auditLogServiceMock as unknown as AuditLogService,
    );
  });

  describe('getAdminHomeContent', () => {
    it('returns grouped hero banners, seasonal spotlights, promo ribbon and store settings', async () => {
      prismaMock.cmsBanner.findMany.mockResolvedValue([
        sampleBanner,
        {
          ...sampleBanner,
          id: 'b-spotlight',
          placement: BannerPlacement.SEASONAL_SPOTLIGHT,
        },
        {
          ...sampleBanner,
          id: 'b-ribbon',
          placement: BannerPlacement.PROMO_RIBBON,
        },
      ]);
      prismaMock.storeSettings.upsert.mockResolvedValue(sampleStoreSettings);

      const result = await service.getAdminHomeContent();

      expect(result.heroBanners).toHaveLength(1);
      expect(result.heroBanners[0].id).toBe('b-1');
      expect(result.seasonalSpotlights).toHaveLength(1);
      expect(result.seasonalSpotlights[0].id).toBe('b-spotlight');
      expect(result.promoRibbon).toBeDefined();
      expect(result.promoRibbon?.id).toBe('b-ribbon');
      expect(result.storeSettings.freeShippingThreshold).toBe(1000);
    });
  });

  describe('getBannerById', () => {
    it('returns mapped banner when exists', async () => {
      prismaMock.cmsBanner.findUnique.mockResolvedValue(sampleBanner);

      const result = await service.getBannerById('b-1');
      expect(result.id).toBe('b-1');
      expect(result.title).toBe('Fall Campaign 2026');
    });

    it('throws NotFoundException when banner does not exist', async () => {
      prismaMock.cmsBanner.findUnique.mockResolvedValue(null);

      await expect(service.getBannerById('b-nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createBanner', () => {
    it('creates banner with next sortOrder and records audit log', async () => {
      prismaMock.cmsBanner.aggregate.mockResolvedValue({
        _max: { sortOrder: 2 },
      });
      prismaMock.cmsBanner.create.mockResolvedValue({
        ...sampleBanner,
        id: 'b-new',
        sortOrder: 3,
      });

      const result = await service.createBanner(
        {
          placement: BannerPlacement.HERO_HOME,
          titleTh: 'หัวข้อใหม่',
          titleEn: 'New Title',
          imageDesktopUrl: 'https://image.com/desktop.jpg',
          sortOrder: 0,
          isActive: true,
        },
        'admin-1',
      );

      expect(prismaMock.cmsBanner.create).toHaveBeenCalled();
      expect(auditLogServiceMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-1',
          actionType: AuditActionType.CREATE,
          targetTable: 'cms_banners',
        }),
      );
      expect(result.id).toBe('b-new');
    });
  });

  describe('updateBanner', () => {
    it('updates existing banner and records audit log', async () => {
      prismaMock.cmsBanner.findUnique.mockResolvedValue(sampleBanner);
      prismaMock.cmsBanner.update.mockResolvedValue({
        ...sampleBanner,
        titleEn: 'Updated Title',
      });

      const result = await service.updateBanner(
        'b-1',
        {
          placement: BannerPlacement.HERO_HOME,
          titleEn: 'Updated Title',
          imageDesktopUrl: 'https://image.com/desktop.jpg',
          sortOrder: 0,
          isActive: true,
        },
        'admin-1',
      );

      expect(result.titleEn).toBe('Updated Title');
      expect(auditLogServiceMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: AuditActionType.UPDATE,
          targetTable: 'cms_banners',
          targetId: 'b-1',
        }),
      );
    });

    it('throws NotFoundException when updating non-existent banner', async () => {
      prismaMock.cmsBanner.findUnique.mockResolvedValue(null);

      await expect(
        service.updateBanner(
          'b-none',
          {
            placement: BannerPlacement.HERO_HOME,
            imageDesktopUrl: 'https://image.com/desktop.jpg',
            sortOrder: 0,
            isActive: true,
          },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBanner', () => {
    it('deletes existing banner and records audit log', async () => {
      prismaMock.cmsBanner.findUnique.mockResolvedValue(sampleBanner);
      prismaMock.cmsBanner.delete.mockResolvedValue(sampleBanner);

      const success = await service.deleteBanner('b-1', 'admin-1');

      expect(success).toBe(true);
      expect(prismaMock.cmsBanner.delete).toHaveBeenCalledWith({
        where: { id: 'b-1' },
      });
      expect(auditLogServiceMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: AuditActionType.DELETE,
          targetTable: 'cms_banners',
          targetId: 'b-1',
        }),
      );
    });

    it('throws NotFoundException when deleting non-existent banner', async () => {
      prismaMock.cmsBanner.findUnique.mockResolvedValue(null);

      await expect(service.deleteBanner('b-none', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorderBanners', () => {
    it('executes transaction for reordering items', async () => {
      prismaMock.$transaction.mockResolvedValue([]);

      const success = await service.reorderBanners(
        {
          items: [
            { id: 'b-1', sortOrder: 1 },
            { id: 'b-2', sortOrder: 0 },
          ],
        },
        'admin-1',
      );

      expect(success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateStoreSettings', () => {
    it('updates store settings and returns updated record', async () => {
      prismaMock.storeSettings.upsert.mockResolvedValue(sampleStoreSettings);
      prismaMock.storeSettings.update.mockResolvedValue({
        ...sampleStoreSettings,
        freeShippingThreshold: 1500,
      });

      const result = await service.updateStoreSettings(
        {
          freeShippingThreshold: 1500,
        },
        'admin-1',
      );

      expect(result.freeShippingThreshold).toBe(1500);
      expect(auditLogServiceMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          targetTable: 'store_settings',
          actionType: AuditActionType.UPDATE,
        }),
      );
    });
  });
});
