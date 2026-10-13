import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from '../../src/modules/catalog/catalog.service.js';
import { Department } from '@repo/database';

describe('CatalogService - createProduct', () => {
  let service: CatalogService;
  let prismaMock: any;
  let uploadServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      product: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      category: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      productImage: {
        create: vi.fn(),
      },
      productVariant: {
        create: vi.fn().mockResolvedValue({ id: 'variant-1' }),
      },
      inventoryItem: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    uploadServiceMock = {
      commitTempImage: vi.fn(async (url: string) => url.replace('/temp/', '/products/')),
    };

    service = new CatalogService(prismaMock, uploadServiceMock);
  });

  it('creates product with slug generated from English name', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null); // Slug is unique
    prismaMock.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      name: 'Apparel',
      slug: 'apparel',
      department: Department.WOMEN,
    });

    const createdDbProduct = {
      id: 'prod-1',
      name: 'Classic Wool Trench Coat',
      nameTh: 'เสื้อโค้ทผ้าวูลคลาสสิก',
      slug: 'classic-wool-trench-coat',
      basePrice: 450,
      originalPrice: null,
      tag: 'NEW_ARRIVAL',
      isActive: true,
      isPreorder: false,
      category: {
        id: 'cat-1',
        name: 'Apparel',
        slug: 'apparel',
        department: Department.WOMEN,
      },
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://cdn.example.com/products/cover.jpg',
          displayOrder: 0,
          isPrimary: true,
        },
      ],
      variants: [
        {
          id: 'var-1',
          skuCode: 'COAT-BLK-M',
          size: 'M',
          colorName: 'Black',
          colorHex: '#000000',
          priceAdjustment: 0,
          inventoryItem: { quantityAvailable: 15 },
        },
      ],
      reviews: [],
      _count: { reviews: 0 },
    };

    prismaMock.product.create.mockResolvedValue(createdDbProduct);

    // Mock getProductBySlug return for mapProductDetail
    vi.spyOn(service, 'getProductBySlug').mockResolvedValue({
      id: 'prod-1',
      name: 'Classic Wool Trench Coat',
      nameTh: 'เสื้อโค้ทผ้าวูลคลาสสิก',
      slug: 'classic-wool-trench-coat',
      basePrice: 450,
      department: Department.WOMEN,
      category: {
        id: 'cat-1',
        name: 'Apparel',
        slug: 'apparel',
        department: Department.WOMEN,
        displayOrder: 1,
      },
      images: [],
      variants: [],
      isActive: true,
      isPreorder: false,
    });

    const result = await service.createProduct({
      name: 'Classic Wool Trench Coat',
      nameTh: 'เสื้อโค้ทผ้าวูลคลาสสิก',
      price: 450,
      category: 'apparel',
      department: 'WOMEN',
      tag: 'NEW_ARRIVAL',
      image: 'https://cdn.example.com/temp/cover.jpg',
      skus: [
        {
          sku: 'COAT-BLK-M',
          size: 'M',
          colorName: 'Black',
          colorHex: '#000000',
          stock: 15,
        },
      ],
    });

    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
      where: { slug: 'classic-wool-trench-coat' },
      select: { id: true },
    });

    expect(uploadServiceMock.commitTempImage).toHaveBeenCalledWith(
      'https://cdn.example.com/temp/cover.jpg',
      'products',
    );

    expect(result.name).toBe('Classic Wool Trench Coat');
    expect(result.slug).toBe('classic-wool-trench-coat');
  });

  it('appends unique suffix when slug already exists', async () => {
    // First lookup finds existing product with this slug
    prismaMock.product.findUnique.mockResolvedValueOnce({ id: 'existing-id' });
    prismaMock.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      name: 'Apparel',
      slug: 'apparel',
      department: Department.WOMEN,
    });

    prismaMock.product.create.mockImplementation((args: any) => {
      return {
        id: 'prod-2',
        ...args.data,
      };
    });

    vi.spyOn(service, 'getProductBySlug').mockImplementation(async (slugOrId) => {
      return {
        id: 'prod-2',
        name: 'Silk Blouse',
        slug: slugOrId,
        basePrice: 150,
        department: Department.WOMEN,
        category: { id: 'cat-1', name: 'Apparel', slug: 'apparel', department: Department.WOMEN, displayOrder: 1 },
        images: [],
        variants: [],
        isActive: true,
        isPreorder: false,
      };
    });

    const result = await service.createProduct({
      name: 'Silk Blouse',
      price: 150,
      category: 'apparel',
    });

    expect(result.slug).toMatch(/^silk-blouse-[a-z0-9]{4}$/);
  });

  it('automatically falls back to a standard single SKU when skus array is empty', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    prismaMock.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      name: 'Accessories',
      slug: 'accessories',
      department: Department.WOMEN,
    });

    prismaMock.product.create.mockResolvedValue({ id: 'prod-3', name: 'Leather Belt', slug: 'leather-belt' });

    vi.spyOn(service, 'getProductBySlug').mockResolvedValue({
      id: 'prod-3',
      name: 'Leather Belt',
      slug: 'leather-belt',
      basePrice: 80,
      department: Department.WOMEN,
      category: { id: 'cat-1', name: 'Accessories', slug: 'accessories', department: Department.WOMEN, displayOrder: 1 },
      images: [],
      variants: [],
      isActive: true,
      isPreorder: false,
    });

    await service.createProduct({
      name: 'Leather Belt',
      price: 80,
      category: 'accessories',
      colors: ['Brown'],
    });

    expect(prismaMock.productVariant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          skuCode: 'LEATHER--STD',
          size: 'One Size',
          colorName: 'Brown',
        }),
      }),
    );
  });
});
