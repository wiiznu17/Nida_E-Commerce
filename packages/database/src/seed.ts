import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';
import { syncRbac } from './seeds/common/seed-rbac.js';
import { seedCategories } from './seeds/common/seed-categories.js';
import { seedStoreSettings } from './seeds/common/seed-settings.js';
import { seedSuperAdmin } from './seeds/prod/seed-superadmin.js';
import { seedDemoUsers } from './seeds/dev/seed-demo-users.js';
import { seedCatalog } from './seeds/dev/seed-catalog.js';
import { seedCoupons } from './seeds/dev/seed-coupons.js';
import { seedOrders } from './seeds/dev/seed-orders.js';
import { seedCms } from './seeds/dev/seed-cms.js';

const prisma = new PrismaClient();

async function main() {
  // Production Safeguard Guard Rails
  const isProdEnv = process.env.NODE_ENV === 'production';
  const forceDevSeed = process.env.FORCE_DEV_SEED === 'true';
  const dbUrl = (process.env.DATABASE_URL ?? '').toLowerCase();
  const isProdDb =
    dbUrl.includes('-prod') ||
    dbUrl.includes('/production') ||
    dbUrl.includes('prod-db') ||
    (isProdEnv && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));

  if ((isProdEnv || isProdDb) && !forceDevSeed) {
    console.error(
      '\n🚨 [FATAL ERROR] Destructive development seed script aborted!\n' +
        'Attempted to run dev seed (which wipes data) on a production environment or remote database.\n' +
        'To initialize or sync a production database safely without data destruction, run:\n' +
        '  npm run db:seed:prod\n' +
        '\nIf this is an intentional remote test/staging database reset, run with:\n' +
        '  FORCE_DEV_SEED=true npm run db:seed\n',
    );
    process.exit(1);
  }

  if (forceDevSeed) {
    console.warn(
      '\n⚠️  [FORCE OVERRIDE ACTIVE] FORCE_DEV_SEED=true detected. Proceeding to wipe and re-seed remote database...\n',
    );
  }

  console.log(
    '🌱 Starting database seeding for Nida E-Commerce (Dev Environment)...',
  );

  // 1. Clean existing records (in reverse dependency order)
  console.log('🧹 Cleaning existing data for fresh development cycle...');
  await prisma.couponRedemption.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.returnItem.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.shipmentLog.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.pointTransaction.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.promotionCoupon.deleteMany({});
  await prisma.cmsBanner.deleteMany({});
  await prisma.adminAuditLog.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.adminUser.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.userAddress.deleteMany({});
  await prisma.otpVerification.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Common Master Data
  await syncRbac(prisma);
  const admin = await seedSuperAdmin(prisma);
  const categoriesMap = await seedCategories(prisma);
  await seedStoreSettings(prisma);

  // 3. Dev Mock Data
  await seedDemoUsers(prisma);
  await seedCatalog(prisma, admin.id, categoriesMap);
  await seedCoupons(prisma);
  await seedOrders(prisma);
  await seedCms(prisma);

  console.log('✅ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('🔑 Super Admin Credentials:');
  console.log('   Username: superadmin');
  console.log('   Email:    admin@nida-apparel.com');
  console.log('   Password: admin123');
  console.log('👥 Demo Staff Accounts:');
  console.log('   inventory@nida-apparel.com (password: admin123)');
  console.log('   fulfillment@nida-apparel.com (password: admin123)');
  console.log('   marketing@nida-apparel.com (password: admin123)');
  console.log('👤 Demo Customers (Storefront):');
  console.log('   Email:    phannida@nida.com / customer@example.com');
  console.log('   Password: Password123!');
  console.log('🎟️ Sample Coupons: NIDA20, FREESHIP, WELCOME200');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
