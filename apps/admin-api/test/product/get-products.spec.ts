import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from '../../src/modules/catalog/catalog.service.js';
import { Department } from '@repo/database';

describe('CatalogService - getProducts', () => {
  let service: CatalogService;
  let prismaMock: any;
  let uploadServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      product: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
    };

    uploadServiceMock = {};

    service = new CatalogService(prismaMock, uploadServiceMock);
  });

  it('searches products with case-insensitive search query in both English and Thai', async () => {
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 'p-1',
        name: 'Wool Cardigan',
        nameTh: 'คาร์ดิแกนผ้าวูล',
        slug: 'wool-cardigan',
        basePrice: 190,
        originalPrice: null,
        tag: null,
        tagTh: null,
        isPreorder: false,
        isActive: true,
        category: {
          id: 'c-1',
          name: 'Apparel',
          slug: 'apparel',
          department: Department.WOMEN,
        },
        images: [],
        variants: [],
        _count: { reviews: 0 },
      },
    ]);
    prismaMock.product.count.mockResolvedValue(1);

    const result = await service.getProducts({ search: 'wool' });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'wool', mode: 'insensitive' } },
            { nameTh: { contains: 'wool', mode: 'insensitive' } },
          ],
        }),
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('filters products by department, category, and tag', async () => {
    await service.getProducts({
      department: 'WOMEN',
      category: 'sweaters',
      tag: 'BESTSELLER',
    });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: {
            department: Department.WOMEN,
            slug: 'sweaters',
          },
          tag: 'BESTSELLER',
        }),
      }),
    );
  });

  it('filters by publication status: published vs draft vs all', async () => {
    await service.getProducts({ status: 'published' });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );

    await service.getProducts({ status: 'draft' });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      }),
    );

    await service.getProducts({ status: 'all' });
    const calls = prismaMock.product.findMany.mock.calls;
    const lastCallWhere = calls[calls.length - 1][0].where;
    expect(lastCallWhere.isActive).toBeUndefined();
  });

  it('calculates correct pagination metadata (skip, take, page, limit, totalPages)', async () => {
    prismaMock.product.count.mockResolvedValue(45);

    const result = await service.getProducts({
      page: 3,
      limit: 10,
    });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20, // (3 - 1) * 10
        take: 10,
      }),
    );

    expect(result.pagination).toEqual({
      page: 3,
      limit: 10,
      total: 45,
      totalPages: 5, // ceil(45 / 10)
    });
  });

  it('applies correct orderBy for sortBy options', async () => {
    await service.getProducts({ sortBy: 'price_asc' as 'price_asc' });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ basePrice: 'asc' }],
      }),
    );

    await service.getProducts({ sortBy: 'price_desc' as 'price_desc' });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ basePrice: 'desc' }],
      }),
    );

    await service.getProducts({ sortBy: 'newest' as 'newest' });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
      }),
    );
  });

  it('retrieves product counts partitioned into total, published, and draft', async () => {
    prismaMock.product.count
      .mockResolvedValueOnce(25) // total
      .mockResolvedValueOnce(22) // published
      .mockResolvedValueOnce(3); // draft

    const counts = await service.getProductCounts();

    expect(counts).toEqual({
      total: 25,
      published: 22,
      draft: 3,
    });
    expect(prismaMock.product.count).toHaveBeenCalledTimes(3);
    expect(prismaMock.product.count).toHaveBeenNthCalledWith(2, {
      where: { isActive: true },
    });
    expect(prismaMock.product.count).toHaveBeenNthCalledWith(3, {
      where: { isActive: false },
    });
  });
});
