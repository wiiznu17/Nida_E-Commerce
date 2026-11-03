import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../../src/modules/orders/orders.service.js';
import {
  OrderStatus,
  PaymentStatus,
  TaxInvoicePayerType,
  TaxInvoiceBranchType,
  AuditActionType,
  AdminPermission,
} from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { CouponsService } from '../../src/modules/coupons/coupons.service.js';
import type { CarrierMockService } from '../../src/modules/orders/carrier/index.js';
import type { LogisticsService } from '../../src/modules/orders/logistics/index.js';
import type { PaymentGatewayService } from '../../src/modules/orders/payment-gateway/index.js';
import type { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';
import type { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';
import { NotFoundException } from '@nestjs/common';

describe('Admin Tax Invoicing & Receipts (Admin API)', () => {
  let service: OrdersService;
  let prismaMock: Record<string, unknown>;
  let auditLogMock: { recordLog: ReturnType<typeof vi.fn> };

  const mockAdmin = {
    id: 'admin-uuid-1',
    email: 'finance@nida.co',
    fullName: 'Finance Manager',
    role: { id: 'role-1', name: 'SUPER_ADMIN' },
    permissions: [AdminPermission.ORDERS_READ, AdminPermission.ORDERS_FULFILL],
  };

  beforeEach(() => {
    auditLogMock = {
      recordLog: vi.fn().mockResolvedValue(null),
    };

    prismaMock = {
      order: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      taxInvoice: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      payment: {
        update: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => callback(prismaMock)),
    };

    service = new OrdersService(
      prismaMock as unknown as PrismaService,
      {} as CouponsService,
      {} as CarrierMockService,
      {} as LogisticsService,
      {} as PaymentGatewayService,
      {} as OrderLifecycleProducerService,
      auditLogMock as unknown as AuditLogService,
    );
  });

  describe('1. VAT Calculation & Sequential Numbering in Admin Service', () => {
    it('calculates Pre-VAT and VAT 7% accurately for ฿5,000', () => {
      const { preVatAmount, vatAmount } = service.calculateVatBreakdown(5000);

      expect(preVatAmount).toBe(4672.9);
      expect(vatAmount).toBe(327.1);
      expect(preVatAmount + vatAmount).toBe(5000);
    });

    it('generates sequential invoice number starting at 00001 when none exists', async () => {
      (prismaMock.taxInvoice as Record<string, unknown>).findFirst = vi
        .fn()
        .mockResolvedValue(null);

      const now = new Date();
      const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      const invNo = await service.generateSequentialInvoiceNumber(
        prismaMock as unknown as PrismaService,
      );

      expect(invNo).toBe(`INV-${ym}-00001`);
    });
  });

  describe('2. OrdersService.getOrderTaxInvoice', () => {
    const mockOrderWithTaxInvoice = {
      id: 'ord-123',
      orderNumber: 'NIDA-20261104-ADM',
      status: OrderStatus.PAID,
      totalAmount: 3210,
      subtotal: 3210,
      discountTotal: 0,
      shippingFee: 0,
      taxInvoice: {
        id: 'tax-inv-123',
        orderId: 'ord-123',
        invoiceNumber: 'INV-202611-00010',
        payerType: TaxInvoicePayerType.COMPANY,
        taxId: '0105566000000',
        name: 'บริษัท สยามแกลเลอรี จำกัด',
        branchType: TaxInvoiceBranchType.HEADQUARTERS,
        branchCode: '00000',
        address: '999 สุขุมวิท กรุงเทพฯ 10110',
        subtotal: 3210,
        discount: 0,
        shippingFee: 0,
        totalAmount: 3210,
        preVatAmount: 3000,
        vatAmount: 210,
        itemsSnapshot: [],
        issuedAt: new Date('2026-11-04T00:00:00.000Z'),
      },
      items: [],
    };

    it('returns tax invoice and logs AuditActionType.READ on tax_invoices', async () => {
      (prismaMock.order as Record<string, unknown>).findFirst = vi
        .fn()
        .mockResolvedValue(mockOrderWithTaxInvoice);

      const result = await service.getOrderTaxInvoice(
        'NIDA-20261104-ADM',
        mockAdmin,
      );

      expect(result.invoiceNumber).toBe('INV-202611-00010');
      expect(result.name).toBe('บริษัท สยามแกลเลอรี จำกัด');
      expect(result.preVatAmount).toBe(3000);
      expect(result.vatAmount).toBe(210);

      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-uuid-1',
          actionType: AuditActionType.READ,
          targetTable: 'tax_invoices',
          targetId: 'tax-inv-123',
          permission: AdminPermission.ORDERS_READ,
        }),
      );
    });

    it('auto-issues tax invoice when order is PAID and has pending tax request', async () => {
      const mockOrderPendingIssue = {
        id: 'ord-456',
        orderNumber: 'NIDA-20261104-AUTO',
        status: OrderStatus.PAID,
        totalAmount: 2140,
        subtotal: 2140,
        discountTotal: 0,
        shippingFee: 0,
        taxInvoiceRequest: {
          payerType: TaxInvoicePayerType.PERSONAL,
          taxId: '1100400123450',
          name: 'วิศณุ เรืองทอง',
          address: '456 สุขุมวิท กรุงเทพฯ',
        },
        items: [
          {
            id: 'item-1',
            productNameSnapshot: 'Cotton T-Shirt',
            variantInfoSnapshot: 'White / L',
            skuCodeSnapshot: 'TSHIRT-W-L',
            unitPrice: 2140,
            quantity: 1,
            subtotal: 2140,
            discountShare: 0,
            netPrice: 2140,
          },
        ],
        taxInvoice: null,
      };

      (prismaMock.order as Record<string, unknown>).findFirst = vi
        .fn()
        .mockResolvedValue(mockOrderPendingIssue);
      (prismaMock.order as Record<string, unknown>).findUnique = vi
        .fn()
        .mockResolvedValue(mockOrderPendingIssue);

      (prismaMock.taxInvoice as Record<string, unknown>).findFirst = vi
        .fn()
        .mockResolvedValue(null);

      (prismaMock.taxInvoice as Record<string, unknown>).create = vi
        .fn()
        .mockImplementation(({ data }) => ({
          ...data,
          id: 'newly-created-inv',
        }));

      const result = await service.getOrderTaxInvoice(
        'NIDA-20261104-AUTO',
        mockAdmin,
      );

      expect(result.id).toBe('newly-created-inv');
      expect(result.name).toBe('วิศณุ เรืองทอง');
      expect(result.preVatAmount).toBe(2000);
      expect(result.vatAmount).toBe(140);
    });

    it('throws NotFoundException when order does not exist', async () => {
      (prismaMock.order as Record<string, unknown>).findFirst = vi
        .fn()
        .mockResolvedValue(null);

      await expect(
        service.getOrderTaxInvoice('NON-EXISTENT', mockAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when order has no tax invoice requested or issued', async () => {
      const mockOrderNoRequest = {
        id: 'ord-789',
        orderNumber: 'NIDA-20261104-NONE',
        status: OrderStatus.PAID,
        taxInvoiceRequest: null,
        taxInvoice: null,
      };

      (prismaMock.order as Record<string, unknown>).findFirst = vi
        .fn()
        .mockResolvedValue(mockOrderNoRequest);

      await expect(
        service.getOrderTaxInvoice('NIDA-20261104-NONE', mockAdmin),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
