import { PrismaClient, DiscountType } from '../../generated/prisma/index.js';

export async function seedCoupons(prisma: PrismaClient) {
  console.log('🎟️  Creating Demo Promotion Coupons...');

  await prisma.promotionCoupon.createMany({
    data: [
      {
        code: 'NIDA20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minOrderAmount: 1000,
        maxDiscountAmount: 500,
        totalUsageLimit: 500,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        isActive: true,
      },
      {
        code: 'FREESHIP',
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
        minOrderAmount: 1000,
        totalUsageLimit: 1000,
        userUsageLimit: 2,
        startsAt: new Date(),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        isActive: true,
      },
      {
        code: 'WELCOME200',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 200,
        minOrderAmount: 1500,
        totalUsageLimit: 200,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Demo coupons created: NIDA20, FREESHIP, WELCOME200');
}
