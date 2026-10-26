import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';
import { syncRbac } from './seeds/common/seed-rbac.js';
import { seedSuperAdmin } from './seeds/prod/seed-superadmin.js';
import { seedCategories } from './seeds/common/seed-categories.js';
import { seedStoreSettings } from './seeds/common/seed-settings.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Safe Idempotent Production Seeding for NIDA...');

  // 1. Synchronize RBAC Roles and Granular Permissions (Pure master data)
  await syncRbac(prisma);

  // 2. Ensure at least one Super Administrator exists
  await seedSuperAdmin(prisma);

  // 3. Upsert Core Taxonomy / Categories (without altering existing products)
  await seedCategories(prisma);

  // 4. Ensure default StoreSettings exist
  await seedStoreSettings(prisma);

  console.log(
    '✨ Production database seeding finished successfully without data loss or demo mock accounts.',
  );
}

main()
  .catch((e) => {
    console.error('❌ Production seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
