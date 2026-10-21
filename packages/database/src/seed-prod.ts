import 'dotenv/config';
import { PrismaClient, Department } from './generated/prisma/index.js';
import { CATEGORIES_SEED_DATA } from './catalog-seed.data.js';
import { syncRbac } from './seed-rbac.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Safe Idempotent Production Seeding for NIDA...');

  // 1. Synchronize RBAC Roles and Granular Permissions
  await syncRbac(prisma);

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { roleCode: 'SUPER_ADMIN' },
  });

  // 2. Ensure at least one Super Administrator exists
  const existingSuperAdmin = await prisma.adminUser.findFirst({
    where: { roleId: superAdminRole.id },
  });

  if (!existingSuperAdmin) {
    const adminEmail =
      process.env.INITIAL_ADMIN_EMAIL ?? 'admin@nida-apparel.com';
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME ?? 'superadmin';
    // Default fallback hash is bcrypt for "admin123" if not provided via environment
    const passwordHash =
      process.env.INITIAL_ADMIN_PASSWORD_HASH ??
      '$2b$10$/45cqjrkP0Gy4P0tjZeBJe5XyQ0u1vpEhkTI1A14DnM2Y9Kxa6dL.';

    const createdAdmin = await prisma.adminUser.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        fullName: 'NIDA Super Administrator',
        department: 'Executive HQ',
        roleId: superAdminRole.id,
      },
    });
    console.log(
      `✅ Created initial Super Admin: ${createdAdmin.email} (${createdAdmin.username})`,
    );
  } else {
    console.log(
      `ℹ️ Super Admin already exists: ${existingSuperAdmin.email}. Skipping creation.`,
    );
  }

  // 3. Upsert Core Taxonomy / Categories (without altering existing products)
  console.log('📂 Verifying and upserting core categories...');
  const categoriesMap: Record<string, string> = {};

  // First pass: parent categories
  const parentCategories = CATEGORIES_SEED_DATA.filter((c) => !c.parentSlug);
  for (const cat of parentCategories) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameTh: cat.nameTh,
        department: cat.department as Department,
        displayOrder: cat.displayOrder,
      },
      create: {
        name: cat.name,
        nameTh: cat.nameTh,
        slug: cat.slug,
        department: cat.department as Department,
        displayOrder: cat.displayOrder,
      },
    });
    categoriesMap[cat.slug] = upserted.id;
  }

  // Second pass: sub-categories with parent relationship
  const subCategories = CATEGORIES_SEED_DATA.filter((c) => c.parentSlug);
  for (const cat of subCategories) {
    const parentId = categoriesMap[cat.parentSlug!];
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameTh: cat.nameTh,
        department: cat.department as Department,
        parentId: parentId ?? null,
        displayOrder: cat.displayOrder,
      },
      create: {
        name: cat.name,
        nameTh: cat.nameTh,
        slug: cat.slug,
        department: cat.department as Department,
        parentId: parentId ?? null,
        displayOrder: cat.displayOrder,
      },
    });
    categoriesMap[cat.slug] = upserted.id;
  }
  console.log(
    `✅ Upserted ${CATEGORIES_SEED_DATA.length} core categories successfully.`,
  );

  console.log(
    '✨ Production database seeding finished successfully without data loss.',
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
