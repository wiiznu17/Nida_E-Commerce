import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  createSkuVariantSchema,
  queryProductsSchema,
  updateProductStatusSchema,
} from '@repo/validators';
import { ZodValidationPipe } from '../../src/core/pipes/zod-validation.pipe.js';
import { BadRequestException } from '@nestjs/common';

describe('Product Zod Validation & ZodValidationPipe', () => {
  describe('createProductSchema', () => {
    it('accepts valid product with basePrice and SKU matrix', () => {
      const validPayload = {
        name: 'Fine Merino Turtleneck',
        price: 195,
        category: 'sweaters',
        department: 'WOMEN',
        skus: [
          {
            sku: 'MRN-BLK-S',
            size: 'S',
            colorName: 'Black',
            colorHex: '#000000',
            stock: 20,
          },
        ],
      };

      const result = createProductSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Fine Merino Turtleneck');
        expect(result.data.price).toBe(195);
        expect(result.data.skus[0].stock).toBe(20);
      }
    });

    it('accepts basePrice as alias for price', () => {
      const payload = {
        name: 'Silk Scarf',
        basePrice: 85,
        category: 'accessories',
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects product when both price and basePrice are missing or non-positive', () => {
      const missingPrice = {
        name: 'No Price Product',
        category: 'apparel',
      };

      const zeroPrice = {
        name: 'Free Product',
        category: 'apparel',
        price: 0,
      };

      const negativePrice = {
        name: 'Negative Product',
        category: 'apparel',
        price: -50,
      };

      expect(createProductSchema.safeParse(missingPrice).success).toBe(false);
      expect(createProductSchema.safeParse(zeroPrice).success).toBe(false);
      expect(createProductSchema.safeParse(negativePrice).success).toBe(false);
    });

    it('rejects product when name is empty or only whitespace', () => {
      const emptyName = {
        name: '   ',
        price: 100,
        category: 'apparel',
      };

      const result = createProductSchema.safeParse(emptyName);
      expect(result.success).toBe(false);
    });

    it('rejects product when category is missing', () => {
      const missingCategory = {
        name: 'Valid Name',
        price: 100,
      };

      const result = createProductSchema.safeParse(missingCategory);
      expect(result.success).toBe(false);
    });

    it('accepts optional metadata like rating, reviewsCount, and handles zero originalPrice cleanly', () => {
      const payloadWithMeta = {
        name: 'Wool Cashmere Cardigan',
        price: 240,
        originalPrice: 0,
        category: 'sweaters',
        rating: 4.8,
        reviewsCount: 35,
      };

      const result = createProductSchema.safeParse(payloadWithMeta);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(4.8);
        expect(result.data.reviewsCount).toBe(35);
        expect(result.data.originalPrice).toBeNull();
      }
    });
  });

  describe('createSkuVariantSchema', () => {
    it('accepts valid sku variant and applies default thresholds', () => {
      const validSku = {
        sku: 'TSH-WHT-M',
        size: 'M',
        colorName: 'White',
        colorHex: '#FFFFFF',
      };

      const result = createSkuVariantSchema.safeParse(validSku);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stock).toBe(0);
        expect(result.data.lowStockThreshold).toBe(5);
        expect(result.data.priceAdjustment).toBe(0);
      }
    });

    it('rejects sku when required variant identity fields are empty', () => {
      const missingFields = {
        sku: '',
        size: '',
        colorName: '',
        colorHex: '',
      };

      const result = createSkuVariantSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map((i) => i.path[0]);
        expect(errorPaths).toContain('sku');
        expect(errorPaths).toContain('size');
        expect(errorPaths).toContain('colorName');
        expect(errorPaths).toContain('colorHex');
      }
    });

    it('rejects negative stock', () => {
      const negativeStock = {
        sku: 'SKU-001',
        size: 'L',
        colorName: 'Navy',
        colorHex: '#000080',
        stock: -10,
      };

      const result = createSkuVariantSchema.safeParse(negativeStock);
      expect(result.success).toBe(false);
    });
  });

  describe('queryProductsSchema', () => {
    it('coerces and sets default page and limit values', () => {
      const result = queryProductsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(12);
        expect(result.data.sortBy).toBe('newest');
      }
    });

    it('rejects page less than 1 or limit greater than 100', () => {
      const invalidPage = queryProductsSchema.safeParse({ page: 0 });
      const invalidLimit = queryProductsSchema.safeParse({ limit: 150 });

      expect(invalidPage.success).toBe(false);
      expect(invalidLimit.success).toBe(false);
    });

    it('rejects invalid sortBy value', () => {
      const invalidSort = queryProductsSchema.safeParse({ sortBy: 'unknown_sort' });
      expect(invalidSort.success).toBe(false);
    });
  });

  describe('updateProductStatusSchema', () => {
    it('coerces and validates boolean isActive', () => {
      expect(updateProductStatusSchema.safeParse({ isActive: true }).success).toBe(true);
      expect(updateProductStatusSchema.safeParse({ isActive: false }).success).toBe(true);
      expect(updateProductStatusSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('ZodValidationPipe integration', () => {
    const pipe = new ZodValidationPipe(createProductSchema);

    it('returns parsed and validated data on valid input', () => {
      const input = {
        name: 'Valid Coat',
        price: 250,
        category: 'coats',
      };

      const output = pipe.transform(input, { type: 'body' });
      expect(output.name).toBe('Valid Coat');
      expect(output.price).toBe(250);
    });

    it('throws BadRequestException with detailed error messages on invalid input', () => {
      const invalidInput = {
        name: '',
        category: '',
      };

      expect(() => pipe.transform(invalidInput, { type: 'body' })).toThrow(
        BadRequestException,
      );

      try {
        pipe.transform(invalidInput, { type: 'body' });
      } catch (err: unknown) {
        expect(err instanceof BadRequestException).toBe(true);
        if (err instanceof BadRequestException) {
          const response = err.getResponse() as Record<string, unknown>;
          expect(response['statusCode']).toBe(400);
          expect(response['message']).toBe('Validation failed');
          expect(Array.isArray(response['issues'])).toBe(true);
          expect((response['issues'] as string[]).length).toBeGreaterThan(0);
          expect(response['details']).toBeDefined();
        }
      }
    });
  });
});
