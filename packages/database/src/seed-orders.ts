import 'dotenv/config';
import {
  PrismaClient,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
} from './generated/prisma/index.js';

const prisma = new PrismaClient();

const SEED_ORDERS_DATA = [
  {
    orderNumber: 'NIDA-918274',
    customerName: 'พรรณนิดา วิศณุ',
    customerEmail: 'wissanu0531@gmail.com',
    customerPhone: '081-892-3456',
    address: {
      recipientName: 'พรรณนิดา วิศณุ',
      phone: '081-892-3456',
      addressLine1: '108 สุขุมวิท ซอย 24',
      subdistrict: 'คลองตัน',
      district: 'คลองเตย',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110',
    },
    totalAmount: 340.0,
    subtotal: 289.0,
    shippingFee: 51.0,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: OrderStatus.SHIPPED,
    courierName: 'Kerry Express TH',
    trackingNumber: 'KER-982147392TH',
    placedAt: new Date('2026-09-25T16:45:00Z'),
  },
  {
    orderNumber: 'NIDA-847291',
    customerName: 'ธนดล วงศ์สุวรรณ',
    customerEmail: 'thanadol.w@gmail.com',
    customerPhone: '089-112-9844',
    address: {
      recipientName: 'ธนดล วงศ์สุวรรณ',
      phone: '089-112-9844',
      addressLine1: '45/1 ถนนสาทรใต้',
      subdistrict: 'ยานนาวา',
      district: 'สาทร',
      province: 'กรุงเทพมหคร',
      postalCode: '10120',
    },
    totalAmount: 129.0,
    subtotal: 129.0,
    shippingFee: 0.0,
    paymentMethod: PaymentMethod.PROMPTPAY,
    status: OrderStatus.DELIVERED,
    courierName: 'Flash Express',
    trackingNumber: 'FL-209148721TH',
    placedAt: new Date('2026-09-25T14:20:00Z'),
  },
  {
    orderNumber: 'NIDA-761298',
    customerName: 'ศิรดา มณีรัตน์',
    customerEmail: 'sirada.m@outlook.com',
    customerPhone: '084-556-7890',
    address: {
      recipientName: 'ศิรดา มณีรัตน์',
      phone: '084-556-7890',
      addressLine1: '88 หมู่บ้านนภาลัย',
      subdistrict: 'บางนาเหนือ',
      district: 'บางนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10260',
    },
    totalAmount: 495.0,
    subtotal: 490.0,
    shippingFee: 5.0,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: OrderStatus.PROCESSING,
    placedAt: new Date('2026-09-25T11:15:00Z'),
  },
  {
    orderNumber: 'NIDA-632190',
    customerName: 'อภิเชษฐ์ ปรีชานนท์',
    customerEmail: 'apichet.p@gmail.com',
    customerPhone: '082-998-3321',
    address: {
      recipientName: 'อภิเชษฐ์ ปรีชานนท์',
      phone: '082-998-3321',
      addressLine1: '234/12 ซอยทองหล่อ 13',
      subdistrict: 'คลองตันเหนือ',
      district: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110',
    },
    totalAmount: 185.0,
    subtotal: 185.0,
    shippingFee: 0.0,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: OrderStatus.PAID,
    placedAt: new Date('2026-09-25T09:30:00Z'),
  },
  {
    orderNumber: 'NIDA-529184',
    customerName: 'กัญญาณัฐ สุวรรณโชติ',
    customerEmail: 'kanyanat.s@gmail.com',
    customerPhone: '083-441-2901',
    address: {
      recipientName: 'กัญญาณัฐ สุวรรณโชติ',
      phone: '083-441-2901',
      addressLine1: '15/8 ถนนพหลโยธิน',
      subdistrict: 'สามเสนใน',
      district: 'พญาไท',
      province: 'กรุงเทพมหานคร',
      postalCode: '10400',
    },
    totalAmount: 320.0,
    subtotal: 320.0,
    shippingFee: 0.0,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: OrderStatus.PAID,
    placedAt: new Date('2026-09-24T18:20:00Z'),
  },
  {
    orderNumber: 'NIDA-418372',
    customerName: 'ชลธิชา ประเสริฐวิทย์',
    customerEmail: 'chonticha.p@hotmail.com',
    customerPhone: '086-772-9184',
    address: {
      recipientName: 'ชลธิชา ประเสริฐวิทย์',
      phone: '086-772-9184',
      addressLine1: '56 หมู่ 4 ตำบลสุเทพ',
      subdistrict: 'สุเทพ',
      district: 'เมืองเชียงใหม่',
      province: 'เชียงใหม่',
      postalCode: '50200',
    },
    totalAmount: 258.0,
    subtotal: 258.0,
    shippingFee: 0.0,
    paymentMethod: PaymentMethod.PROMPTPAY,
    status: OrderStatus.PROCESSING,
    placedAt: new Date('2026-09-24T15:10:00Z'),
  },
];

export async function seedOrders() {
  console.log('📦 Seeding orders into database...');
  const variants = await prisma.productVariant.findMany({
    take: 5,
    include: { product: true },
  });

  if (variants.length === 0) {
    console.warn('⚠️ No product variants found to attach order items.');
    return;
  }

  for (const item of SEED_ORDERS_DATA) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: item.orderNumber },
    });

    if (existing) {
      console.log(`Order ${item.orderNumber} already exists, skipping.`);
      continue;
    }

    const primaryVariant = variants[0];
    const order = await prisma.order.create({
      data: {
        orderNumber: item.orderNumber,
        status: item.status,
        subtotal: item.subtotal,
        discountTotal: 0,
        shippingFee: item.shippingFee,
        taxAmount: 0,
        totalAmount: item.totalAmount,
        currency: 'THB',
        shippingAddressSnapshot: item.address,
        placedAt: item.placedAt,
        items: {
          create: [
            {
              variantId: primaryVariant.id,
              productNameSnapshot: primaryVariant.product.name,
              variantInfoSnapshot: `${primaryVariant.colorName} / ${primaryVariant.size}`,
              unitPrice: item.subtotal,
              quantity: 1,
              subtotal: item.subtotal,
              discountShare: 0,
              netPrice: item.subtotal,
            },
          ],
        },
        payment: {
          create: {
            paymentMethod: item.paymentMethod,
            status: PaymentStatus.CAPTURED,
            amount: item.totalAmount,
            paidAt: item.placedAt,
          },
        },
      },
    });

    if (item.trackingNumber && item.courierName) {
      const shipment = await prisma.shipment.create({
        data: {
          orderId: order.id,
          courierName: item.courierName,
          trackingNumber: item.trackingNumber,
          status:
            item.status === OrderStatus.DELIVERED
              ? ShipmentStatus.DELIVERED
              : ShipmentStatus.LABEL_CREATED,
          shippedAt: item.placedAt,
          deliveredAt:
            item.status === OrderStatus.DELIVERED ? item.placedAt : null,
        },
      });

      await prisma.shipmentLog.create({
        data: {
          shipmentId: shipment.id,
          statusTitle: 'Label Created',
          statusDescription: `Shipment label generated for ${item.courierName}`,
          location: 'Bangkok Sorting Hub',
          logTimestamp: item.placedAt,
        },
      });
    }

    console.log(`✅ Seeded order: ${item.orderNumber} (${item.status})`);
  }
}

async function run() {
  try {
    await seedOrders();
  } catch (err) {
    console.error('Error seeding orders:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
