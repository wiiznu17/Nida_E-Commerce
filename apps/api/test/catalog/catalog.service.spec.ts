import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerCatalogService } from '../../src/modules/catalog/catalog.service.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import { Department } from '@repo/types';

describe('CustomerCatalogService', () => {
  let service: CustomerCatalogService;
  let prismaMock: {
    product: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    category: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  const sampleProducts = [
    {
      id: 'prod-1',
      name: 'Signature Slim Fit Pique Polo',
      nameTh: 'เสื้อโปโลผ้าปิเก้ ซิกเนเจอร์',
      slug: 'signature-slim-fit-pique-polo',
      basePrice: 79,
      originalPrice: 98,
      tag: 'HERITAGE',
      tagTh: 'เฮอริเทจไอคอน',
      isPreorder: false,
      isActive: true,
      category: {
        id: 'cat-1',
        name: 'Polos & T-Shirts',
        nameTh: 'เสื้อโปโล & เสื้อยืด',
        slug: 'men-polos-tshirts',
        department: Department.MEN,
      },
      images: [
        { imageUrl: 'https://example.com/polo.jpg', isPrimary: true, displayOrder: 0 },
      ],
      variants: [
        {
          id: 'var-1',
          sku: 'NIDA-M1-S',
          size: 'S',
          color: 'Espresso',
          colorTh: 'เอสเปรสโซ่',
          hex: '#2B1810',
          price: 79,
          stock: 20,
          inventoryItem: { quantityAvailable: 20 },
        },
      ],
      _count: { reviews: 5 },
    },
  ];

  beforeEach(() => {
    prismaMock = {
      product: {
        findMany: vi.fn().mockResolvedValue(sampleProducts),
        count: vi.fn().mockResolvedValue(1),
        findUnique: vi.fn(),
      },
      category: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    service = new CustomerCatalogService(prismaMock as unknown as PrismaService);
  });

  describe('getProducts', () => {
    it('applies search, department, subCategory, price range, and color filters correctly to where query', async () => {
      const response = await service.getProducts({
        search: 'polo',
        department: 'men',
        subCategory: 'Polos & T-Shirts',
        minPrice: 50,
        maxPrice: 100,
        colors: ['#2B1810'],
        sortBy: 'price_asc',
        page: 1,
        limit: 12,
      });

      expect(response.data).toHaveLength(1);
      expect(response.pagination.total).toBe(1);

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            basePrice: { gte: 50, lte: 100 },
            variants: {
              some: {
                colorHex: { in: ['#2B1810'], mode: 'insensitive' },
              },
            },
            category: {
              AND: expect.arrayContaining([
                { department: Department.MEN },
                expect.objectContaining({
                  OR: expect.arrayContaining([
                    { name: { contains: 'Polos & T-Shirts', mode: 'insensitive' } },
                  ]),
                }),
              ]),
            },
          }),
          orderBy: { basePrice: 'asc' },
          skip: 0,
          take: 12,
        })
      );
    });

    it('handles sorting by newest and natural featured ordering', async () => {
      await service.getProducts({ sortBy: 'newest' });
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });
});
