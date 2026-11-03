import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TaxInvoiceService,
  NIDA_SELLER_TAX_INFO,
} from '../../src/modules/tax-invoice/tax-invoice.service.js';
import {
  validateThaiIdChecksum,
  taxInvoiceRequestSchema,
} from '@repo/validators';
import { TaxInvoicePayerType, TaxInvoiceBranchType } from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

describe('Tax Invoicing & Receipts (Customer API)', () => {
  let service: TaxInvoiceService;
  let prismaMock: Record<string, unknown>;

  beforeEach(() => {
    prismaMock = {
      order: {
        findUnique: vi.fn(),
      },
      taxInvoice: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    service = new TaxInvoiceService(prismaMock as unknown as PrismaService);
  });

  describe('1. VAT 7% Calculation Logic (Thai Revenue Code Sec. 86/4)', () => {
    it('calculates correct Pre-VAT and VAT 7% amounts with Half-Up rounding for ฿2,500', () => {
      const { preVatAmount, vatAmount } = service.calculateVatBreakdown(2500);

      expect(preVatAmount).toBe(2336.45);
      expect(vatAmount).toBe(163.55);
      expect(preVatAmount + vatAmount).toBe(2500);
    });

    it('calculates correct Pre-VAT and VAT 7% amounts for ฿1,070', () => {
      const { preVatAmount, vatAmount } = service.calculateVatBreakdown(1070);

      expect(preVatAmount).toBe(1000);
      expect(vatAmount).toBe(70);
      expect(preVatAmount + vatAmount).toBe(1070);
    });

    it('calculates correct amounts for ฿100', () => {
      const { preVatAmount, vatAmount } = service.calculateVatBreakdown(100);

      expect(preVatAmount).toBe(93.46);
      expect(vatAmount).toBe(6.54);
      expect(preVatAmount + vatAmount).toBe(100);
    });

    it('returns 0 for 0 total amount', () => {
      const { preVatAmount, vatAmount } = service.calculateVatBreakdown(0);

      expect(preVatAmount).toBe(0);
      expect(vatAmount).toBe(0);
    });
  });

  describe('2. Thai 13-digit ID / Tax ID Checksum (Mod 11 Algorithm)', () => {
    it('validates a mathematically valid 13-digit ID', () => {
      // 1100400123450 has check digit 0
      expect(validateThaiIdChecksum('1100400123450')).toBe(true);
      expect(validateThaiIdChecksum('1-1004-00123-45-0')).toBe(true);
    });

    it('rejects an invalid 13-digit ID with wrong check digit', () => {
      expect(validateThaiIdChecksum('1100400123459')).toBe(false);
    });

    it('rejects IDs with incorrect lengths', () => {
      expect(validateThaiIdChecksum('123456789012')).toBe(false); // 12 digits
      expect(validateThaiIdChecksum('12345678901234')).toBe(false); // 14 digits
      expect(validateThaiIdChecksum('')).toBe(false);
    });

    it('rejects strings containing letters', () => {
      expect(validateThaiIdChecksum('110040012345A')).toBe(false);
    });
  });

  describe('3. Zod Tax Invoice Request Validator Schema', () => {
    it('passes for valid personal request with valid Thai 13-digit ID', () => {
      const validPersonal = {
        payerType: 'PERSONAL',
        name: 'สมชาย รักดี',
        taxId: '1100400123450',
        address: '123 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
      };

      const result = taxInvoiceRequestSchema.safeParse(validPersonal);
      expect(result.success).toBe(true);
    });

    it('passes for valid personal request with passport number', () => {
      const validPassport = {
        payerType: 'PERSONAL',
        name: 'John Doe',
        taxId: 'AB1234567',
        address: '88 Sukhumvit 24, Khlong Toei, Bangkok 10110 Thailand',
      };

      const result = taxInvoiceRequestSchema.safeParse(validPassport);
      expect(result.success).toBe(true);
    });

    it('rejects personal request with invalid 13-digit checksum', () => {
      const invalidPersonal = {
        payerType: 'PERSONAL',
        name: 'สมชาย รักดี',
        taxId: '1100400123459',
        address: '123 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
      };

      const result = taxInvoiceRequestSchema.safeParse(invalidPersonal);
      expect(result.success).toBe(false);
    });

    it('passes for company request with Headquarters', () => {
      const validCompany = {
        payerType: 'COMPANY',
        name: 'บริษัท สยามลักชัวรี่ จำกัด',
        taxId: '1100400123450',
        branchType: 'HEADQUARTERS',
        address:
          '88 อาคารเอ็มโพเรียม ทาวเวอร์ ชั้น 20 ถนนสุขุมวิท กรุงเทพฯ 10110',
      };

      const result = taxInvoiceRequestSchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it('passes for company request with Branch and 5-digit branch code', () => {
      const validCompanyBranch = {
        payerType: 'COMPANY',
        name: 'บริษัท สยามลักชัวรี่ จำกัด',
        taxId: '1100400123450',
        branchType: 'BRANCH',
        branchCode: '00001',
        address:
          '88 อาคารเอ็มโพเรียม ทาวเวอร์ ชั้น 20 ถนนสุขุมวิท กรุงเทพฯ 10110',
      };

      const result = taxInvoiceRequestSchema.safeParse(validCompanyBranch);
      expect(result.success).toBe(true);
    });

    it('rejects company request without branchType', () => {
      const invalidCompany = {
        payerType: 'COMPANY',
        name: 'บริษัท สยามลักชัวรี่ จำกัด',
        taxId: '1100400123450',
        address:
          '88 อาคารเอ็มโพเรียม ทาวเวอร์ ชั้น 20 ถนนสุขุมวิท กรุงเทพฯ 10110',
      };

      const result = taxInvoiceRequestSchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it('rejects company request with Branch but invalid branchCode length', () => {
      const invalidCompany = {
        payerType: 'COMPANY',
        name: 'บริษัท สยามลักชัวรี่ จำกัด',
        taxId: '1100400123450',
        branchType: 'BRANCH',
        branchCode: '12', // Not 5 digits
        address:
          '88 อาคารเอ็มโพเรียม ทาวเวอร์ ชั้น 20 ถนนสุขุมวิท กรุงเทพฯ 10110',
      };

      const result = taxInvoiceRequestSchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });
  });

  describe('4. Sequential Number Generation (INV-YYYYMM-XXXXX)', () => {
    it('generates INV-YYYYMM-00001 when no previous invoice exists this month', async () => {
      const txMock = {
        taxInvoice: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const now = new Date();
      const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      const invNo = await service.generateSequentialInvoiceNumber(
        txMock as unknown as PrismaService,
      );

      expect(invNo).toBe(`INV-${ym}-00001`);
    });

    it('increments sequence number from latest existing invoice', async () => {
      const now = new Date();
      const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      const txMock = {
        taxInvoice: {
          findFirst: vi.fn().mockResolvedValue({
            invoiceNumber: `INV-${ym}-00042`,
          }),
        },
      };

      const invNo = await service.generateSequentialInvoiceNumber(
        txMock as unknown as PrismaService,
      );

      expect(invNo).toBe(`INV-${ym}-00043`);
    });
  });

  describe('5. TaxInvoiceService.issueTaxInvoiceForOrder', () => {
    const mockOrder = {
      id: 'ord-uuid-1',
      orderNumber: 'NIDA-20261104-TEST',
      totalAmount: 2500,
      subtotal: 2500,
      discountTotal: 0,
      shippingFee: 0,
      taxInvoiceRequest: {
        payerType: TaxInvoicePayerType.PERSONAL,
        taxId: '1100400123450',
        name: 'สมชาย รักดี',
        address: '123 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
      },
      items: [
        {
          id: 'item-uuid-1',
          productNameSnapshot: 'Silk Shirt',
          variantInfoSnapshot: 'Cream / M',
          skuCodeSnapshot: 'NIDA-SILK-M',
          unitPrice: 2500,
          quantity: 1,
          subtotal: 2500,
          discountShare: 0,
          netPrice: 2500,
        },
      ],
      taxInvoice: null,
    };

    it('creates TaxInvoice when requested and returns mapped ApiTaxInvoice', async () => {
      const txMock = {
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
        },
        taxInvoice: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(({ data }) => ({
            ...data,
            id: 'tax-inv-uuid-1',
          })),
        },
      };

      const result = await service.issueTaxInvoiceForOrder(
        txMock as unknown as PrismaService,
        'ord-uuid-1',
      );

      expect(result).not.toBeNull();
      expect(result?.orderNumber).toBe('NIDA-20261104-TEST');
      expect(result?.totalAmount).toBe(2500);
      expect(result?.preVatAmount).toBe(2336.45);
      expect(result?.vatAmount).toBe(163.55);
      expect(result?.name).toBe('สมชาย รักดี');
      expect(result?.sellerSnapshot?.taxId).toBe(NIDA_SELLER_TAX_INFO.taxId);
    });

    it('is idempotent: returns existing invoice if already issued', async () => {
      const existingInvoice = {
        id: 'tax-inv-existing',
        orderId: 'ord-uuid-1',
        invoiceNumber: 'INV-202611-00001',
        payerType: 'PERSONAL',
        taxId: '1100400123450',
        name: 'สมชาย รักดี',
        branchType: null,
        branchCode: null,
        address: '123 ถนนสุขุมวิท',
        subtotal: 2500,
        discount: 0,
        shippingFee: 0,
        totalAmount: 2500,
        preVatAmount: 2336.45,
        vatAmount: 163.55,
        itemsSnapshot: [],
        issuedAt: new Date(),
      };

      const orderWithInvoice = {
        ...mockOrder,
        taxInvoice: existingInvoice,
      };

      const txMock = {
        order: {
          findUnique: vi.fn().mockResolvedValue(orderWithInvoice),
        },
        taxInvoice: {
          create: vi.fn(),
        },
      };

      const result = await service.issueTaxInvoiceForOrder(
        txMock as unknown as PrismaService,
        'ord-uuid-1',
      );

      expect(result?.invoiceNumber).toBe('INV-202611-00001');
      expect(txMock.taxInvoice.create).not.toHaveBeenCalled();
    });

    it('returns null if order has no taxInvoiceRequest', async () => {
      const orderWithoutRequest = {
        ...mockOrder,
        taxInvoiceRequest: null,
      };

      const txMock = {
        order: {
          findUnique: vi.fn().mockResolvedValue(orderWithoutRequest),
        },
      };

      const result = await service.issueTaxInvoiceForOrder(
        txMock as unknown as PrismaService,
        'ord-uuid-1',
      );

      expect(result).toBeNull();
    });
  });

  describe('6. Security Guards & Customer Access', () => {
    it('returns tax invoice when user owns the order', async () => {
      const mockOrderWithInvoice = {
        id: 'ord-uuid-1',
        orderNumber: 'NIDA-20261104-MYORDER',
        userId: 'usr-123',
        taxInvoice: {
          id: 'inv-1',
          orderId: 'ord-uuid-1',
          invoiceNumber: 'INV-202611-00005',
          payerType: 'PERSONAL',
          taxId: '1100400123450',
          name: 'สมชาย รักดี',
          branchType: null,
          branchCode: null,
          address: '123 สุขุมวิท',
          subtotal: 2500,
          discount: 0,
          shippingFee: 0,
          totalAmount: 2500,
          preVatAmount: 2336.45,
          vatAmount: 163.55,
          itemsSnapshot: [],
          issuedAt: new Date(),
        },
      };

      (prismaMock.order as Record<string, unknown>).findUnique = vi
        .fn()
        .mockResolvedValue(mockOrderWithInvoice);

      const result = await service.getTaxInvoiceByOrderNumber(
        'NIDA-20261104-MYORDER',
        'usr-123',
      );

      expect(result.invoiceNumber).toBe('INV-202611-00005');
    });

    it('throws NotFoundException when order does not belong to user', async () => {
      const mockOrderOtherUser = {
        id: 'ord-uuid-1',
        orderNumber: 'NIDA-20261104-OTHER',
        userId: 'usr-456',
        taxInvoice: { id: 'inv-1' },
      };

      (prismaMock.order as Record<string, unknown>).findUnique = vi
        .fn()
        .mockResolvedValue(mockOrderOtherUser);

      await expect(
        service.getTaxInvoiceByOrderNumber('NIDA-20261104-OTHER', 'usr-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when tax invoice has not been issued', async () => {
      const mockOrderNoInvoice = {
        id: 'ord-uuid-1',
        orderNumber: 'NIDA-20261104-NOINV',
        userId: 'usr-123',
        taxInvoice: null,
      };

      (prismaMock.order as Record<string, unknown>).findUnique = vi
        .fn()
        .mockResolvedValue(mockOrderNoInvoice);

      await expect(
        service.getTaxInvoiceByOrderNumber('NIDA-20261104-NOINV', 'usr-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
