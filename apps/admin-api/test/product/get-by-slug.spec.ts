import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from '../../src/modules/catalog/catalog.service.js';
import { NotFoundException } from '@nestjs/common';
import { Department } from '@repo/database';

describe('CatalogService - getProductBySlug', () => {
  let service: CatalogService;
  let prismaMock: any;
  let uploadServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      product: {
        findFirst: vi.fn(),
      },
    };

    uploadServiceMock = {};

    service = new CatalogService(prismaMock, uploadServiceMock);
  });

  it('retrieves and maps product detail by slug string', async () => {
    const mockDbProduct = {
      id: 'prod-uuid-1',
      name: 'Iconic Cable-Knit Sweater',
      nameTh: 'สเวตเตอร์ถักเคเบิลไอคอนิค',
      slug: 'iconic-cable-knit-sweater',
      description: 'Signature knitwear',
      descriptionTh: 'เสื้อไหมพรมซิกเนเจอร์',
      materialsCare: '100% Merino Wool',
      materialsCareTh: 'ผ้าวูลเมอริโน 100%',
      basePrice: 129,
      originalPrice: 159,
      tag: 'BESTSELLER',
      tagTh: 'สินค้าขายดี',
      isActive: true,
      isPreorder: false,
      preorderReleaseDate: null,
      preorderLimit: null,
      preorderDepositAmount: null,
      category: {
        id: 'cat-1',
        name: 'Sweaters & Knits',
        nameTh: 'สเวตเตอร์และเสื้อไหมพรม',
        slug: 'sweaters-knits',
        department: Department.WOMEN,
        displayOrder: 1,
      },
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://cdn.example.com/sweater-front.jpg',
          altText: 'Front View',
          altTextTh: 'ด้านหน้า',
          displayOrder: 0,
          isPrimary: true,
        },
      ],
      variants: [
        {
          id: 'var-1',
          skuCode: 'SWTR-WHT-S',
          size: 'S',
          colorName: 'Ivory White',
          colorNameTh: 'สีขาวไอวอรี่',
          colorHex: '#FFFFF0',
          priceAdjustment: 0,
          weightGrams: 350,
          lengthCm: 60,
          widthCm: 45,
          heightCm: 5,
          inventoryItem: {
            quantityAvailable: 10,
          },
        },
      ],
      reviews: [{ rating: 5 }, { rating: 4 }],
      _count: { reviews: 2 },
    };

    prismaMock.product.findFirst.mockResolvedValue(mockDbProduct);

    const result = await service.getProductBySlug('iconic-cable-knit-sweater');

    expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'iconic-cable-knit-sweater' },
      }),
    );

    expect(result.id).toBe('prod-uuid-1');
    expect(result.name).toBe('Iconic Cable-Knit Sweater');
    expect(result.basePrice).toBe(129);
    expect(result.originalPrice).toBe(159);
    expect(result.rating).toBe(4.5); // (5 + 4) / 2
    expect(result.reviewsCount).toBe(2);
    expect(result.variants[0].inStock).toBe(true);
    expect(result.variants[0].quantityAvailable).toBe(10);
  });

  it('retrieves product by UUID identifier', async () => {
    const testUuid = 'b81c8af6-b2ed-4cdb-8421-55c3cbe9689f';

    prismaMock.product.findFirst.mockResolvedValue({
      id: testUuid,
      name: 'Cashmere Cardigan',
      slug: 'cashmere-cardigan',
      basePrice: 200,
      originalPrice: null,
      isActive: true,
      isPreorder: false,
      category: { id: 'c-1', name: 'Apparel', department: Department.WOMEN, displayOrder: 1 },
      images: [],
      variants: [],
      reviews: [],
      _count: { reviews: 0 },
    });

    await service.getProductBySlug(testUuid);

    expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ id: testUuid }, { slug: testUuid }] },
      }),
    );
  });

  it('throws NotFoundException when product slug does not exist', async () => {
    prismaMock.product.findFirst.mockResolvedValue(null);

    await expect(service.getProductBySlug('non-existent-product')).rejects.toThrow(
      NotFoundException,
    );
  });
});
