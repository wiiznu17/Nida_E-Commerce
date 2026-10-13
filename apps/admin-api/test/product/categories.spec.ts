import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from '../../src/modules/catalog/catalog.service.js';
import { Department } from '@repo/database';

describe('CatalogService - getCategories', () => {
  let service: CatalogService;
  let prismaMock: any;
  let uploadServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      category: {
        findMany: vi.fn(),
      },
    };

    uploadServiceMock = {};

    service = new CatalogService(prismaMock, uploadServiceMock);
  });

  it('retrieves all active categories with subcategory children ordered by displayOrder', async () => {
    const mockCategories = [
      {
        id: 'cat-women',
        name: 'Women',
        nameTh: 'ผู้หญิง',
        slug: 'women',
        department: Department.WOMEN,
        displayOrder: 1,
        isActive: true,
        children: [
          {
            id: 'cat-sweaters',
            name: 'Sweaters & Knits',
            nameTh: 'สเวตเตอร์และเสื้อไหมพรม',
            slug: 'sweaters-knits',
            department: Department.WOMEN,
            displayOrder: 10,
            parentId: 'cat-women',
            isActive: true,
            children: [],
            _count: { products: 12 },
          },
        ],
        _count: { products: 45 },
      },
    ];

    prismaMock.category.findMany.mockResolvedValue(mockCategories);

    const result = await service.getCategories();

    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('women');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].slug).toBe('sweaters-knits');
  });

  it('filters categories by specific department', async () => {
    prismaMock.category.findMany.mockResolvedValue([]);

    await service.getCategories('MEN');

    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          department: Department.MEN,
        },
      }),
    );
  });
});
