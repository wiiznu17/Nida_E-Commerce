import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerCatalogService } from '../../src/modules/catalog/catalog.service.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import { Department } from '@repo/types';

describe('CustomerCatalogService', () => {
  let service: CustomerCatalogService;
  let redisMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    delByPattern: ReturnType<typeof vi.fn>;
  };
  let prismaMock: {
    product: {
      fields: {
        basePrice: unknown;
      };
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    category: {
      findMany: ReturnType<typeof vi.fn>;
    };
    productVariant: {
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
        {
          imageUrl: 'https://example.com/polo.jpg',
          isPrimary: true,
          displayOrder: 0,
        },
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
        fields: {
          basePrice: 'basePrice',
        },
        findMany: vi.fn().mockResolvedValue(sampleProducts),
        count: vi.fn().mockResolvedValue(1),
        findUnique: vi.fn(),
      },
      category: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      productVariant: {
        findMany: vi.fn(),
      },
    };

    redisMock = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
      delByPattern: vi.fn().mockResolvedValue(undefined),
    };

    service = new CustomerCatalogService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
    );
  });

  describe('syncCart', () => {
    it('returns empty array when variantIds is empty', async () => {
      const res = await service.syncCart({ variantIds: [] });
      expect(res.items).toEqual([]);
    });

    it('returns synced items with live unitPrice and stock', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'var-1',
          skuCode: 'NIDA-M1-S',
          size: 'S',
          colorName: 'Espresso',
          priceAdjustment: 10,
          isActive: true,
          product: {
            id: 'prod-1',
            name: 'Polo Shirt',
            nameTh: 'เสื้อโปโล',
            slug: 'polo-shirt',
            basePrice: 100,
            originalPrice: 150,
            isActive: true,
            isPreorder: false,
          },
          inventoryItem: {
            quantityAvailable: 15,
          },
        },
      ]);

      const res = await service.syncCart({ variantIds: ['var-1'] });
      expect(res.items).toHaveLength(1);
      expect(res.items[0]).toEqual({
        variantId: 'var-1',
        productId: 'prod-1',
        productName: 'Polo Shirt',
        productNameTh: 'เสื้อโปโล',
        productSlug: 'polo-shirt',
        sku: 'NIDA-M1-S',
        size: 'S',
        colorName: 'Espresso',
        price: 110, // 100 + 10
        basePrice: 100,
        originalPrice: 150,
        stock: 15,
        isAvailable: true,
        isPreorder: false,
      });
    });
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
                    {
                      name: {
                        contains: 'Polos & T-Shirts',
                        mode: 'insensitive',
                      },
                    },
                  ]),
                }),
              ]),
            },
          }),
          orderBy: { basePrice: 'asc' },
          skip: 0,
          take: 12,
        }),
      );
    });

    it('handles sorting by newest and natural featured ordering', async () => {
      await service.getProducts({ sortBy: 'newest' });
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('applies sale query to include products with tag SALE or originalPrice > basePrice', async () => {
      await service.getProducts({ tag: 'SALE' });
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { tag: 'SALE' },
                  { originalPrice: { gt: 'basePrice' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });

    it('returns cached products when cache hit occurs without querying database', async () => {
      const cachedPayload = {
        success: true,
        data: [{ id: 'cached-prod', name: 'Cached Polo' }],
        pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
      };
      redisMock.get.mockResolvedValueOnce(JSON.stringify(cachedPayload));

      const result = await service.getProducts({ page: 1 });
      expect(result).toEqual(cachedPayload);
      expect(prismaMock.product.findMany).not.toHaveBeenCalled();
    });

    it('stores query result in Redis on cache miss', async () => {
      redisMock.get.mockResolvedValueOnce(null);

      const result = await service.getProducts({ page: 1 });
      expect(prismaMock.product.findMany).toHaveBeenCalled();
      expect(redisMock.set).toHaveBeenCalledWith(
        expect.stringContaining('catalog:products:'),
        expect.any(String),
        120,
      );
      expect(result.data.length).toBe(1);
    });
  });

  describe('getCategories caching', () => {
    it('returns cached categories on cache hit', async () => {
      const cachedCategories = [{ id: 'cat-1', name: 'Men', slug: 'men' }];
      redisMock.get.mockResolvedValueOnce(JSON.stringify(cachedCategories));

      const result = await service.getCategories('men');
      expect(result).toEqual(cachedCategories);
      expect(prismaMock.category.findMany).not.toHaveBeenCalled();
    });

    it('stores categories in Redis on cache miss with 600s TTL', async () => {
      redisMock.get.mockResolvedValueOnce(null);
      prismaMock.category.findMany.mockResolvedValueOnce([
        {
          id: 'cat-1',
          name: 'Men',
          slug: 'men',
          department: Department.MEN,
          displayOrder: 1,
          isActive: true,
          children: [],
          _count: { products: 10 },
        },
      ]);

      const result = await service.getCategories('men');
      expect(result.length).toBe(1);
      expect(redisMock.set).toHaveBeenCalledWith(
        'catalog:categories:men',
        expect.any(String),
        600,
      );
    });
  });
});
