import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerOrdersService } from '../../src/modules/orders/orders.service.js';
import { OrderStatus, PaymentMethod } from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { OmiseService } from '../../src/modules/orders/omise.service.js';
import type { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { ApiProductSnapshot } from '@repo/types';

describe('Product Snapshot in Order Items (Customer API)', () => {
  let service: CustomerOrdersService;
  let prismaMock: Record<string, unknown>;
  let orderItemCreateSpy: ReturnType<typeof vi.fn>;

  const mockVariantWithFullProduct = {
    id: 'var-uuid-1',
    skuCode: 'NIDA-SILK-BLOUSE-W-M',
    colorName: 'Ivory Cream',
    colorNameTh: 'สีครีมงาช้าง',
    colorHex: '#FAF7F2',
    size: 'M',
    priceAdjustment: 200,
    product: {
      id: 'prod-uuid-1',
      name: 'Mulberry Silk Evening Blouse',
      nameTh: 'เสื้อเบลาส์ผ้าไหมมัลเบอร์รี่',
      slug: 'mulberry-silk-evening-blouse',
      basePrice: 3500,
      originalPrice: 4200,
      materialsCare: '100% Mulberry Silk. Dry clean only.',
      materialsCareTh: 'ผ้าไหมมัลเบอร์รี่ 100% ซักแห้งเท่านั้น',
      description: 'Handcrafted luxury blouse with mother-of-pearl buttons.',
      descriptionTh: 'เสื้อเบลาส์ไหมแท้ระดับพรีเมียม ตัดเย็บอย่างประณีต',
      isPreorder: false,
      preorderReleaseDate: null,
      category: {
        id: 'cat-uuid-1',
        name: 'Tops & Blouses',
        department: 'WOMEN',
      },
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://images.nida.co/products/blouse-sec.jpg',
          isPrimary: false,
        },
        {
          id: 'img-2',
          imageUrl: 'https://images.nida.co/products/blouse-main.jpg',
          isPrimary: true,
        },
      ],
    },
    inventoryItem: {
      id: 'inv-uuid-1',
      quantityAvailable: 15,
      quantityReserved: 0,
    },
  };

  beforeEach(() => {
    orderItemCreateSpy = vi.fn().mockImplementation(async ({ data }) => ({
      id: 'item-uuid-created',
      ...data,
    }));

    prismaMock = {
      productVariant: {
        findMany: vi.fn().mockResolvedValue([mockVariantWithFullProduct]),
        findFirst: vi.fn(),
      },
      promotionCoupon: {
        findUnique: vi.fn(),
      },
      couponRedemption: {
        count: vi.fn(),
      },
      order: {
        findUnique: vi.fn().mockImplementation(({ where }) => ({
          id: 'order-uuid-1',
          orderNumber: where.orderNumber ?? 'NIDA-20261025-ABCD',
          userId: 'user-uuid-1',
          status: OrderStatus.PENDING,
          hasPreorderItems: false,
          subtotal: 7400,
          discountTotal: 0,
          shippingFee: 0,
          taxAmount: 0,
          totalAmount: 7400,
          currency: 'THB',
          placedAt: new Date(),
          shippingAddressSnapshot: {},
          items: [],
          payment: null,
          shipments: [],
        })),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        const tx = {
          order: {
            create: vi.fn().mockResolvedValue({
              id: 'order-uuid-1',
              orderNumber: 'NIDA-20261025-ABCD',
              status: OrderStatus.PENDING,
            }),
          },
          orderItem: {
            create: orderItemCreateSpy,
          },
          inventoryItem: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            findUnique: vi.fn().mockResolvedValue({ quantityAvailable: 13 }),
          },
          stockMovement: {
            create: vi.fn().mockResolvedValue({ id: 'sm-1' }),
          },
          payment: {
            create: vi.fn().mockResolvedValue({
              id: 'payment-uuid-1',
            }),
          },
        };
        return callback(tx);
      }),
    };

    const mailerMock = {
      sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    };

    const omiseMock = {
      createPromptPayCharge: vi.fn().mockResolvedValue({
        chargeId: 'chrg_test_promptpay',
        qrDownloadUri: 'https://api.omise.co/qr.svg',
        expiresAt: '2026-10-25T15:00:00Z',
        status: 'pending',
      }),
      createCreditCardCharge: vi.fn(),
    };

    const orderLifecycleProducerMock = {
      scheduleOrderTimeout: vi.fn().mockResolvedValue('job-snap-1'),
      cancelOrderTimeout: vi.fn().mockResolvedValue(true),
    };

    const redisMock = {
      checkRateLimit: vi.fn().mockResolvedValue({
        allowed: true,
        remaining: 5,
        retryAfter: 0,
      }),
    };

    service = new CustomerOrdersService(
      prismaMock as unknown as PrismaService,
      mailerMock as unknown as MailerService,
      omiseMock as unknown as OmiseService,
      orderLifecycleProducerMock as unknown as OrderLifecycleProducerService,
      redisMock as unknown as RedisService,
    );
  });

  it('createOrder persists imageUrlSnapshot, skuCodeSnapshot, and productSnapshot on orderItem.create', async () => {
    await service.createOrder(
      {
        items: [{ variantId: 'var-uuid-1', quantity: 2 }],
        shippingAddress: {
          recipientName: 'Warisara Suk',
          phone: '0812345678',
          addressLine1: '99 Ploenchit Road',
          subdistrict: 'Lumpini',
          district: 'Pathumwan',
          province: 'Bangkok',
          postalCode: '10330',
        },
        paymentMethod: PaymentMethod.PROMPTPAY,
      },
      'user-uuid-1',
    );

    expect(orderItemCreateSpy).toHaveBeenCalledTimes(1);
    const createData = orderItemCreateSpy.mock.calls[0][0].data;

    // Snapshot Image: should pick isPrimary: true
    expect(createData.imageUrlSnapshot).toBe('https://images.nida.co/products/blouse-main.jpg');

    // Snapshot SKU: exact SKU code of variant at purchase time
    expect(createData.skuCodeSnapshot).toBe('NIDA-SILK-BLOUSE-W-M');

    // Snapshot JSON: deep product and variant attributes
    expect(createData.productSnapshot).toBeDefined();
    const snap = createData.productSnapshot as ApiProductSnapshot;
    expect(snap.productId).toBe('prod-uuid-1');
    expect(snap.name).toBe('Mulberry Silk Evening Blouse');
    expect(snap.nameTh).toBe('เสื้อเบลาส์ผ้าไหมมัลเบอร์รี่');
    expect(snap.slug).toBe('mulberry-silk-evening-blouse');
    expect(snap.department).toBe('WOMEN');
    expect(snap.categoryName).toBe('Tops & Blouses');
    expect(snap.colorName).toBe('Ivory Cream');
    expect(snap.colorNameTh).toBe('สีครีมงาช้าง');
    expect(snap.colorHex).toBe('#FAF7F2');
    expect(snap.size).toBe('M');
    expect(snap.basePrice).toBe(3500);
    expect(snap.originalPrice).toBe(4200);
    expect(snap.materialsCare).toBe('100% Mulberry Silk. Dry clean only.');
    expect(snap.materialsCareTh).toBe('ผ้าไหมมัลเบอร์รี่ 100% ซักแห้งเท่านั้น');
  });

  it('maps order items using historical snapshots and maintains data invariants against catalog mutations', async () => {
    const historicalOrderRecord = {
      id: 'order-hist-1',
      orderNumber: 'NIDA-20261025-HIST',
      status: OrderStatus.PAID,
      hasPreorderItems: false,
      subtotal: 7400,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      totalAmount: 7400,
      currency: 'THB',
      placedAt: new Date('2026-10-25T10:00:00Z'),
      shippingAddressSnapshot: {
        recipientName: 'Warisara Suk',
        phone: '0812345678',
        addressLine1: '99 Ploenchit Road',
        subdistrict: 'Lumpini',
        district: 'Pathumwan',
        province: 'Bangkok',
        postalCode: '10330',
      },
      items: [
        {
          id: 'item-hist-1',
          variantId: 'var-uuid-1',
          productNameSnapshot: 'Original Blouse Title At Checkout',
          variantInfoSnapshot: 'Ivory Cream / M',
          unitPrice: 3700,
          quantity: 2,
          subtotal: 7400,
          discountShare: 0,
          netPrice: 7400,
          isPreorder: false,
          expectedShipDate: null,
          imageUrlSnapshot: 'https://cdn.nida.co/snap-blouse.jpg',
          skuCodeSnapshot: 'HISTORICAL-SKU-001',
          productSnapshot: {
            productId: 'prod-uuid-1',
            name: 'Original Blouse Title At Checkout',
            slug: 'original-slug',
            department: 'WOMEN',
            categoryName: 'Tops',
            materialsCare: 'Historical Care Guide',
            basePrice: 3500,
            originalPrice: 4500,
          },
          // Simulated live product mutation (live catalog now changed or images deleted)
          variant: {
            skuCode: 'NEW-MODIFIED-SKU-999',
            product: {
              images: [{ imageUrl: 'https://cdn.nida.co/brand-new-catalog-image.jpg' }],
            },
          },
        },
      ],
      payment: {
        paymentMethod: PaymentMethod.PROMPTPAY,
        amount: 7400,
        currency: 'THB',
        status: 'PAID',
        paidAt: new Date('2026-10-25T10:05:00Z'),
      },
      shipments: [],
    };

    (prismaMock.order as { findUnique: ReturnType<typeof vi.fn> }).findUnique.mockResolvedValue(
      historicalOrderRecord,
    );

    const result = await service.getOrderByNumber('NIDA-20261025-HIST');

    expect(result).toBeDefined();
    expect(result.items).toHaveLength(1);

    const item = result.items[0];
    // Must return snapshot values, unaffected by catalog changes
    expect(item.imageUrl).toBe('https://cdn.nida.co/snap-blouse.jpg');
    expect(item.imageUrlSnapshot).toBe('https://cdn.nida.co/snap-blouse.jpg');
    expect(item.skuCode).toBe('HISTORICAL-SKU-001');
    expect(item.skuCodeSnapshot).toBe('HISTORICAL-SKU-001');
    expect(item.productSnapshot?.name).toBe('Original Blouse Title At Checkout');
    expect(item.productSnapshot?.materialsCare).toBe('Historical Care Guide');
  });

  it('gracefully falls back for legacy pre-migration orders where snapshot is null', async () => {
    const legacyOrderRecord = {
      id: 'order-legacy-1',
      orderNumber: 'NIDA-20261025-LEGACY',
      status: OrderStatus.PENDING,
      hasPreorderItems: false,
      subtotal: 1000,
      discountTotal: 0,
      shippingFee: 50,
      taxAmount: 0,
      totalAmount: 1050,
      currency: 'THB',
      placedAt: new Date('2026-10-25T08:00:00Z'),
      shippingAddressSnapshot: {},
      items: [
        {
          id: 'item-legacy-1',
          variantId: 'var-legacy-1',
          productNameSnapshot: 'Legacy Item',
          variantInfoSnapshot: 'Black / L',
          unitPrice: 1000,
          quantity: 1,
          subtotal: 1000,
          discountShare: 0,
          netPrice: 1000,
          isPreorder: false,
          expectedShipDate: null,
          imageUrlSnapshot: null,
          skuCodeSnapshot: null,
          productSnapshot: null,
          variant: {
            skuCode: 'FALLBACK-LEGACY-SKU',
            product: {
              images: [{ imageUrl: 'https://cdn.nida.co/fallback-primary.jpg' }],
            },
          },
        },
      ],
      payment: null,
      shipments: [],
    };

    (prismaMock.order as { findUnique: ReturnType<typeof vi.fn> }).findUnique.mockResolvedValue(
      legacyOrderRecord,
    );

    const result = await service.getOrderByNumber('NIDA-20261025-LEGACY');
    expect(result.items[0].imageUrl).toBe('https://cdn.nida.co/fallback-primary.jpg');
    expect(result.items[0].skuCode).toBe('FALLBACK-LEGACY-SKU');
    expect(result.items[0].productSnapshot).toBeNull();
  });
});
