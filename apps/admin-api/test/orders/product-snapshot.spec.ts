import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../../src/modules/orders/orders.service.js';
import { PaymentMethod, OrderStatus } from '@repo/types';
import { CarrierMockService } from '../../src/modules/orders/carrier/index.js';
import {
  LogisticsService,
  InternalLogisticsProvider,
  ShippopLogisticsProvider,
} from '../../src/modules/orders/logistics/index.js';
import type { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';
import type { ApiProductSnapshot } from '@repo/types';

describe('Product Snapshot in Order Items (Admin API)', () => {
  let service: OrdersService;
  let prismaMock: Record<string, unknown>;
  let orderItemCreateSpy: ReturnType<typeof vi.fn>;

  const mockVariantWithFullProduct = {
    id: 'var-admin-1',
    skuCode: 'NIDA-CASHMERE-COAT-M',
    colorName: 'Espresso Brown',
    colorNameTh: 'สีน้ำตาลเอสเปรสโซ่',
    colorHex: '#2B1810',
    size: 'M',
    priceAdjustment: 0,
    product: {
      id: 'prod-admin-1',
      name: 'Cashmere Double-Breasted Trench Coat',
      nameTh: 'เสื้อโค้ทแคชเมียร์กระดุมสองแถว',
      slug: 'cashmere-double-breasted-trench-coat',
      basePrice: 12500,
      originalPrice: 15000,
      materialsCare: '100% Mongolian Cashmere. Specialist dry clean.',
      materialsCareTh: 'ผ้าแคชเมียร์มองโกเลีย 100% ซักแห้งเฉพาะทาง',
      description: 'Structured silhouette tailored with fine horn buttons.',
      descriptionTh: 'เสื้อโค้ทโครงสร้างประณีต ตกแต่งด้วยกระดุมเขาสัตว์แท้',
      isPreorder: false,
      preorderReleaseDate: null,
      category: {
        id: 'cat-admin-1',
        name: 'Outerwear & Coats',
        department: 'WOMEN',
      },
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://images.nida.co/products/coat-main.jpg',
          isPrimary: true,
        },
      ],
    },
    inventoryItem: {
      id: 'inv-admin-1',
      quantityAvailable: 10,
    },
  };

  beforeEach(() => {
    orderItemCreateSpy = vi.fn().mockImplementation(async ({ data }) => ({
      id: 'item-created-admin',
      ...data,
    }));

    prismaMock = {
      productVariant: {
        findMany: vi.fn().mockResolvedValue([mockVariantWithFullProduct]),
      },
      order: {
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: 'order-admin-uuid-1',
          orderNumber: data.orderNumber ?? 'NIDA-20261025-ADMIN',
          ...data,
          placedAt: new Date(),
        })),
        findUnique: vi.fn().mockImplementation(({ where }) => ({
          id: 'order-admin-uuid-1',
          orderNumber: where.orderNumber ?? 'NIDA-20261025-ADMIN',
          status: OrderStatus.PENDING,
          hasPreorderItems: false,
          subtotal: 12500,
          discountTotal: 0,
          shippingFee: 0,
          taxAmount: 0,
          totalAmount: 12500,
          currency: 'THB',
          placedAt: new Date(),
          shippingAddressSnapshot: {
            recipientName: 'Somchai Jaidee',
            phone: '0812345678',
            addressLine1: '123 Sukhumvit Road',
            subdistrict: 'Khlong Toei',
            district: 'Khlong Toei',
            province: 'Bangkok',
            postalCode: '10110',
          },
          items: [],
          payment: null,
          shipments: [],
          refunds: [],
          cancellationRequests: [],
          returnRequests: [],
        })),
      },
      orderItem: {
        create: orderItemCreateSpy,
      },
      inventoryItem: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({ quantityAvailable: 9 }),
      },
      stockMovement: {
        create: vi.fn().mockResolvedValue({ id: 'sm-admin-1' }),
      },
      payment: {
        create: vi.fn().mockResolvedValue({ id: 'pay-admin-1' }),
      },
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => callback(prismaMock)),
    };

    const couponsServiceMock = {
      calculateCheckout: vi.fn().mockResolvedValue({
        subtotal: 12500,
        discountTotal: 0,
        shippingFee: 0,
        taxAmount: 0,
        totalAmount: 12500,
        couponApplied: null,
        items: [
          {
            variantId: 'var-admin-1',
            productName: 'Cashmere Double-Breasted Trench Coat',
            variantInfo: 'Espresso Brown / M',
            unitPrice: 12500,
            quantity: 1,
            subtotal: 12500,
            discountShare: 0,
            netPrice: 12500,
          },
        ],
      }),
    };

    const carrierMockService = new CarrierMockService();
    const internalProvider = new InternalLogisticsProvider(carrierMockService);
    const shippopProvider = new ShippopLogisticsProvider();
    const logisticsService = new LogisticsService(
      internalProvider,
      shippopProvider,
      prismaMock as any,
    );

    const paymentGatewayServiceMock = {
      createRefund: vi.fn(),
    };

    const orderLifecycleProducerMock = {
      scheduleOrderTimeout: vi.fn().mockResolvedValue('job-snap-admin-1'),
      cancelOrderTimeout: vi.fn().mockResolvedValue(true),
    };

    service = new OrdersService(
      prismaMock as any,
      couponsServiceMock as any,
      carrierMockService,
      logisticsService,
      paymentGatewayServiceMock as any,
      orderLifecycleProducerMock as unknown as OrderLifecycleProducerService,
    );
  });

  it('admin createOrder persists imageUrlSnapshot, skuCodeSnapshot, and full productSnapshot', async () => {
    await service.createOrder({
      items: [{ variantId: 'var-admin-1', quantity: 1 }],
      shippingAddress: {
        recipientName: 'Somchai Jaidee',
        phone: '0812345678',
        addressLine1: '123 Sukhumvit Road',
        subdistrict: 'Khlong Toei',
        district: 'Khlong Toei',
        province: 'Bangkok',
        postalCode: '10110',
      },
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    expect(orderItemCreateSpy).toHaveBeenCalledTimes(1);
    const createData = orderItemCreateSpy.mock.calls[0][0].data;

    expect(createData.imageUrlSnapshot).toBe('https://images.nida.co/products/coat-main.jpg');
    expect(createData.skuCodeSnapshot).toBe('NIDA-CASHMERE-COAT-M');

    const snap = createData.productSnapshot as ApiProductSnapshot;
    expect(snap.name).toBe('Cashmere Double-Breasted Trench Coat');
    expect(snap.nameTh).toBe('เสื้อโค้ทแคชเมียร์กระดุมสองแถว');
    expect(snap.department).toBe('WOMEN');
    expect(snap.categoryName).toBe('Outerwear & Coats');
    expect(snap.colorName).toBe('Espresso Brown');
    expect(snap.basePrice).toBe(12500);
    expect(snap.originalPrice).toBe(15000);
    expect(snap.materialsCare).toBe('100% Mongolian Cashmere. Specialist dry clean.');
  });

  it('admin getOrderById maps historical snapshots and protects order history from catalog edits', async () => {
    const historicalOrderPayload = {
      id: 'order-admin-hist-1',
      orderNumber: 'NIDA-20261025-SNAP',
      status: OrderStatus.PAID,
      hasPreorderItems: false,
      subtotal: 12500,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      totalAmount: 12500,
      currency: 'THB',
      placedAt: new Date(),
      shippingAddressSnapshot: {
        recipientName: 'Somchai Jaidee',
        phone: '0812345678',
        addressLine1: '123 Sukhumvit Road',
        subdistrict: 'Khlong Toei',
        district: 'Khlong Toei',
        province: 'Bangkok',
        postalCode: '10110',
      },
      items: [
        {
          id: 'item-snap-1',
          variantId: 'var-admin-1',
          productNameSnapshot: 'Original Coat Name at Purchase',
          variantInfoSnapshot: 'Espresso Brown / M',
          unitPrice: 12500,
          quantity: 1,
          subtotal: 12500,
          discountShare: 0,
          netPrice: 12500,
          isPreorder: false,
          expectedShipDate: null,
          imageUrlSnapshot: 'https://cdn.nida.co/coat-snapshot.jpg',
          skuCodeSnapshot: 'HISTORICAL-COAT-SKU',
          productSnapshot: {
            productId: 'prod-admin-1',
            name: 'Original Coat Name at Purchase',
            department: 'WOMEN',
            categoryName: 'Outerwear',
            basePrice: 12500,
            originalPrice: 15000,
          },
          // Changed variant in catalog
          variant: {
            skuCode: 'ALTERED-SKU-999',
            product: {
              images: [{ imageUrl: 'https://cdn.nida.co/altered-image.jpg' }],
            },
          },
        },
      ],
      payment: null,
      shipments: [],
      refunds: [],
      cancellationRequests: [],
      returnRequests: [],
    };

    (prismaMock.order as { findUnique: ReturnType<typeof vi.fn> }).findUnique.mockResolvedValue(
      historicalOrderPayload,
    );

    const result = await service.getOrderByNumber('NIDA-20261025-SNAP');

    expect(result).toBeDefined();
    const item = result.items[0];
    expect(item.imageUrl).toBe('https://cdn.nida.co/coat-snapshot.jpg');
    expect(item.imageUrlSnapshot).toBe('https://cdn.nida.co/coat-snapshot.jpg');
    expect(item.skuCode).toBe('HISTORICAL-COAT-SKU');
    expect(item.skuCodeSnapshot).toBe('HISTORICAL-COAT-SKU');
    expect(item.productSnapshot?.name).toBe('Original Coat Name at Purchase');
  });

  it('admin getOrderById falls back cleanly for orders prior to snapshot migration', async () => {
    const legacyOrderPayload = {
      id: 'order-admin-legacy-1',
      orderNumber: 'NIDA-20261025-LEGACY-ADMIN',
      status: OrderStatus.COMPLETED,
      hasPreorderItems: false,
      subtotal: 500,
      discountTotal: 0,
      shippingFee: 50,
      taxAmount: 0,
      totalAmount: 550,
      currency: 'THB',
      placedAt: new Date(),
      shippingAddressSnapshot: {},
      items: [
        {
          id: 'item-legacy-1',
          variantId: 'var-legacy-1',
          productNameSnapshot: 'Legacy Product',
          variantInfoSnapshot: 'White / S',
          unitPrice: 500,
          quantity: 1,
          subtotal: 500,
          discountShare: 0,
          netPrice: 500,
          isPreorder: false,
          expectedShipDate: null,
          imageUrlSnapshot: null,
          skuCodeSnapshot: null,
          productSnapshot: null,
          variant: {
            skuCode: 'LEGACY-VARIANT-SKU',
            product: {
              images: [{ imageUrl: 'https://cdn.nida.co/legacy-variant-image.jpg' }],
            },
          },
        },
      ],
      payment: null,
      shipments: [],
      refunds: [],
      cancellationRequests: [],
      returnRequests: [],
    };

    (prismaMock.order as { findUnique: ReturnType<typeof vi.fn> }).findUnique.mockResolvedValue(
      legacyOrderPayload,
    );

    const result = await service.getOrderByNumber('NIDA-20261025-LEGACY-ADMIN');
    expect(result.items[0].imageUrl).toBe('https://cdn.nida.co/legacy-variant-image.jpg');
    expect(result.items[0].skuCode).toBe('LEGACY-VARIANT-SKU');
    expect(result.items[0].productSnapshot).toBeNull();
  });
});
