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

  describe('createCategory', () => {
    it('creates a category with auto-generated slug if omitted', async () => {
      prismaMock.category.findUnique = vi.fn().mockResolvedValue(null);
      prismaMock.category.create = vi.fn().mockResolvedValue({
        id: 'cat-new-1',
        name: 'New Arrivals',
        nameTh: 'สินค้ามาใหม่',
        slug: 'new-arrivals',
        department: Department.WOMEN,
        parentId: null,
        displayOrder: 0,
        isActive: true,
        children: [],
        _count: { products: 0 },
      });

      const result = await service.createCategory({
        name: 'New Arrivals',
        nameTh: 'สินค้ามาใหม่',
        department: Department.WOMEN,
      });

      expect(prismaMock.category.create).toHaveBeenCalled();
      expect(result.id).toBe('cat-new-1');
      expect(result.slug).toBe('new-arrivals');
    });
  });

  describe('updateCategory', () => {
    it('updates existing category fields successfully', async () => {
      prismaMock.category.findUnique = vi.fn().mockResolvedValue({
        id: 'cat-1',
        name: 'Old Name',
        slug: 'old-slug',
      });
      prismaMock.category.update = vi.fn().mockResolvedValue({
        id: 'cat-1',
        name: 'Updated Name',
        slug: 'old-slug',
        department: Department.WOMEN,
        displayOrder: 5,
        isActive: true,
        children: [],
        _count: { products: 2 },
      });

      const result = await service.updateCategory('cat-1', {
        name: 'Updated Name',
        displayOrder: 5,
      });

      expect(prismaMock.category.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteCategory', () => {
    it('deletes category if no products or children attached', async () => {
      prismaMock.category.findUnique = vi.fn().mockResolvedValue({
        id: 'cat-del-1',
        name: 'Empty Category',
        _count: { products: 0, children: 0 },
      });
      prismaMock.category.delete = vi.fn().mockResolvedValue({});

      const result = await service.deleteCategory('cat-del-1');

      expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-del-1' } });
      expect(result.success).toBe(true);
    });

    it('throws BadRequestException if category has products', async () => {
      prismaMock.category.findUnique = vi.fn().mockResolvedValue({
        id: 'cat-has-prod',
        name: 'Has Products',
        _count: { products: 5, children: 0 },
      });

      await expect(service.deleteCategory('cat-has-prod')).rejects.toThrow(
        /contains 5 product\(s\)/,
      );
    });

    it('throws BadRequestException if category has children', async () => {
      prismaMock.category.findUnique = vi.fn().mockResolvedValue({
        id: 'cat-has-children',
        name: 'Parent Cat',
        _count: { products: 0, children: 2 },
      });

      await expect(service.deleteCategory('cat-has-children')).rejects.toThrow(
        /has 2 child sub-categories/,
      );
    });
  });
});
