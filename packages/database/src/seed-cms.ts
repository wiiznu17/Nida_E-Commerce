import 'dotenv/config';
import { PrismaClient, BannerPlacement } from './generated/prisma/index.js';

export async function seedCms(prisma: PrismaClient) {
  console.log('🖼️  Seeding Storefront CMS Banners & Store Settings...');

  // 1. Clean existing CMS banners
  await prisma.cmsBanner.deleteMany({});

  // 2. Seed Hero Carousel Banners (3 rich editorial slides)
  const heroBanners = [
    {
      placement: BannerPlacement.HERO_HOME,
      title: 'MODERN HERITAGE\nTIMELESS SILK & TAILORING',
      titleTh: 'มรดกแห่งความสง่างาม\nนิยามใหม่ของผ้าไหมไทย',
      titleEn: 'MODERN HERITAGE\nTIMELESS SILK & TAILORING',
      subtitle:
        'Autumn/Winter 2026 collection celebrates understated luxury through fine natural fibers and contemporary cuts.',
      subtitleTh:
        'คอลเลกชันฤดูใบไม้ร่วง/ฤดูหนาว 2026 ถ่ายทอดความประณีตผ่านเส้นใยธรรมชาติและแพทเทิร์นร่วมสมัย',
      subtitleEn:
        'Autumn/Winter 2026 collection celebrates understated luxury through fine natural fibers and contemporary cuts.',
      tagTh: 'คอลเลกชันใหม่ล่าสุด',
      tagEn: 'NEW AUTUMN / WINTER 2026',
      imageDesktopUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2560&q=85',
      imageMobileUrl:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&q=85',
      ctaPrimaryTextTh: 'เลือกชมคอลเลกชันสตรี',
      ctaPrimaryTextEn: 'EXPLORE WOMEN',
      ctaPrimaryLink: '/collections/women',
      ctaSecondaryTextTh: 'เลือกชมคอลเลกชันบุรุษ',
      ctaSecondaryTextEn: 'EXPLORE MEN',
      ctaSecondaryLink: '/collections/men',
      sortOrder: 0,
      isActive: true,
    },
    {
      placement: BannerPlacement.HERO_HOME,
      title: 'THE ARTISANAL EDIT\nEFFORTLESS ELEGANCE',
      titleTh: 'เสน่ห์แห่งเส้นด้ายธรรมชาติ\nผสานดีไซน์มินิมอล',
      titleEn: 'THE ARTISANAL EDIT\nEFFORTLESS ELEGANCE',
      subtitle:
        'Indulge in premium cashmere and fine linen silhouettes designed for effortless day-to-evening transitions.',
      subtitleTh:
        'สัมผัสความอบอุ่นและความนุ่มนวลจากแคชเมียร์และลินินเกรดพรีเมียม ออกแบบเพื่อทุกโอกาสสำคัญ',
      subtitleEn:
        'Indulge in premium cashmere and fine linen silhouettes designed for effortless day-to-evening transitions.',
      tagTh: 'แคชเมียร์ & นิตแวร์',
      tagEn: 'CASHMERE & KNITWEAR',
      imageDesktopUrl:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2560&q=85',
      imageMobileUrl:
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1080&q=85',
      ctaPrimaryTextTh: 'ช้อปสเวตเตอร์ & นิตแวร์',
      ctaPrimaryTextEn: 'SHOP KNITWEAR',
      ctaPrimaryLink: '/collections/women',
      ctaSecondaryTextTh: 'ดูสินค้าทั้งหมด',
      ctaSecondaryTextEn: 'DISCOVER ALL',
      ctaSecondaryLink: '/collections',
      sortOrder: 1,
      isActive: true,
    },
    {
      placement: BannerPlacement.HERO_HOME,
      title: 'CONTEMPORARY TAILORING\nSHARP LINES & LUXE WOOL',
      titleTh: 'สูทและเบลเซอร์ร่วมสมัย\nโครงสร้างประณีตระดับงานเทเลอร์',
      titleEn: 'CONTEMPORARY TAILORING\nSHARP LINES & LUXE WOOL',
      subtitle:
        'Sharp architectural silhouettes and structured luxury wool jackets engineered for modern sophistication.',
      subtitleTh:
        'การตัดเย็บบรรจงตามแบบฉบับช่างฝีมือชั้นสูง มอบความมั่นใจและรูปทรงภูมิฐานในทุกก้าว',
      subtitleEn:
        'Sharp architectural silhouettes and structured luxury wool jackets engineered for modern sophistication.',
      tagTh: 'งานเทเลอร์สั่งตัด',
      tagEn: 'SARTORIAL TAILORING',
      imageDesktopUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2560&q=85',
      imageMobileUrl:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1080&q=85',
      ctaPrimaryTextTh: 'ช้อปเบลเซอร์ & โอเวอร์โค้ต',
      ctaPrimaryTextEn: 'SHOP TAILORING',
      ctaPrimaryLink: '/collections/men',
      ctaSecondaryTextTh: null,
      ctaSecondaryTextEn: null,
      ctaSecondaryLink: null,
      sortOrder: 2,
      isActive: true,
    },
  ];

  for (const banner of heroBanners) {
    await prisma.cmsBanner.create({ data: banner });
  }

  // 3. Seed Seasonal Spotlight Bento (2 cards)
  const seasonalSpotlights = [
    {
      placement: BannerPlacement.SEASONAL_SPOTLIGHT,
      title: "THE WOMEN'S ATELIER",
      titleTh: 'คอลเลกชันสตรีร่วมสมัย',
      titleEn: "THE WOMEN'S ATELIER",
      subtitle:
        'Fluid draping meets modern Thai silk silhouettes tailored for distinctive presence.',
      subtitleTh:
        'ความพลิ้วไหวของผ้าไหมไทยและซิลูเอทสมัยใหม่ สรรสร้างเพื่อผู้หญิงที่มีสไตล์โดดเด่น',
      subtitleEn:
        'Fluid draping meets modern Thai silk silhouettes tailored for distinctive presence.',
      tagTh: 'ไฮไลต์คอลเลกชัน',
      tagEn: 'FEATURED STORY',
      imageDesktopUrl:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      ctaPrimaryTextTh: 'ค้นพบคอลเลกชันสตรี',
      ctaPrimaryTextEn: 'DISCOVER WOMEN',
      ctaPrimaryLink: '/collections/women',
      sortOrder: 0,
      isActive: true,
    },
    {
      placement: BannerPlacement.SEASONAL_SPOTLIGHT,
      title: "REFINED MEN'S TAILORING",
      titleTh: 'งานเทเลอร์บุรุษระดับไอคอนิก',
      titleEn: "REFINED MEN'S TAILORING",
      subtitle:
        'Structured wool blazers and artisan coats engineered for understated masculine poise.',
      subtitleTh:
        'โครงสร้างเบลเซอร์ประณีตและเนื้อผ้าคัดสรรพิเศษ สะท้อนรสนิยมอันสุขุมและเหนือกาลเวลา',
      subtitleEn:
        'Structured wool blazers and artisan coats engineered for understated masculine poise.',
      tagTh: 'คลาสสิกเหนือกาลเวลา',
      tagEn: 'TIMELESS HERITAGE',
      imageDesktopUrl:
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      ctaPrimaryTextTh: 'ค้นพบคอลเลกชันบุรุษ',
      ctaPrimaryTextEn: 'DISCOVER MEN',
      ctaPrimaryLink: '/collections/men',
      sortOrder: 1,
      isActive: true,
    },
  ];

  for (const spotlight of seasonalSpotlights) {
    await prisma.cmsBanner.create({ data: spotlight });
  }

  // 4. Seed Promo Ribbon Strip
  await prisma.cmsBanner.create({
    data: {
      placement: BannerPlacement.PROMO_RIBBON,
      title: 'ENJOY 20% OFF YOUR FIRST ORDER',
      titleTh: 'รับส่วนลดพิเศษ 20% สำหรับคำสั่งซื้อแรกของคุณ',
      titleEn: 'ENJOY 20% OFF YOUR FIRST ORDER',
      subtitle:
        'When shopping new season arrivals over ฿1,000 with complimentary nationwide delivery.',
      subtitleTh:
        'เมื่อช้อปสินค้าคอลเลกชันใหม่ครบ ฿1,000 พร้อมบริการจัดส่งฟรีทั่วประเทศ',
      subtitleEn:
        'When shopping new season arrivals over ฿1,000 with complimentary nationwide delivery.',
      tagTh: 'สิทธิพิเศษต้อนรับลูกค้าใหม่',
      tagEn: 'EXCLUSIVE WELCOME PRIVILEGE',
      couponCode: 'NIDA20',
      imageDesktopUrl:
        'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=85',
      imageMobileUrl:
        'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1080&q=85',
      ctaPrimaryLink: '/collections',
      sortOrder: 0,
      isActive: true,
    },
  });

  // 5. Seed or Update StoreSettings
  await prisma.storeSettings.upsert({
    where: { id: 'default-store-settings' },
    update: {
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

  console.log('✅ CMS Banners and Store Settings seeded successfully!');
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient();
  seedCms(prisma)
    .catch((err) => {
      console.error('❌ Failed to seed CMS data:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
