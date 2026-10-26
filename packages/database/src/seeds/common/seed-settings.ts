import { PrismaClient } from '../../generated/prisma/index.js';

export async function seedStoreSettings(prisma: PrismaClient) {
  console.log('⚙️  Ensuring default StoreSettings exist...');

  const settings = await prisma.storeSettings.upsert({
    where: { id: 'default-store-settings' },
    update: {
      // Keep existing settings if already modified, but ensure default fields exist
    },
    create: {
      id: 'default-store-settings',
      announcementActive: true,
      announcementBadgeTh: 'NEW SEASON',
      announcementBadgeEn: 'NEW SEASON',
      announcementTextTh:
        'AUTUMN/WINTER 2026: รับส่วนลดพิเศษ 20% ด้วยโค้ด NIDA20 | บริการจัดส่งฟรีเมื่อช้อปครบ ฿1,000',
      announcementTextEn:
        'AUTUMN/WINTER 2026: ENJOY 20% OFF WITH CODE NIDA20 | COMPLIMENTARY SHIPPING OVER ฿1,000',
      announcementLink: '/collections',
      freeShippingThreshold: 1000,
      returnWindowDays: 7,
    },
  });

  console.log(
    `✅ StoreSettings verified (ID: ${settings.id}, Free Shipping over ฿${settings.freeShippingThreshold}).`,
  );
  return settings;
}
