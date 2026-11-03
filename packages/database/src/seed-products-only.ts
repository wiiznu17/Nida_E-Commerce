import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';
import { syncRbac } from './seeds/common/seed-rbac.js';
import { seedSuperAdmin } from './seeds/prod/seed-superadmin.js';
import { seedCategories } from './seeds/common/seed-categories.js';
import { PRODUCTS_SEED_DATA } from './seeds/data/catalog.data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('👗 Starting Idempotent Product Seeding for NIDA Catalog...');

  await syncRbac(prisma);
  const admin = await seedSuperAdmin(prisma);
  const categoriesMap = await seedCategories(prisma);

  let createdCount = 0;
  let skippedCount = 0;

  for (let idx = 0; idx < PRODUCTS_SEED_DATA.length; idx++) {
    const item = PRODUCTS_SEED_DATA[idx]!;

    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      select: { id: true, name: true },
    });

    if (existing) {
      console.log(
        `⏩ [Skipped] "${item.name}" (slug: ${item.slug}) already exists.`,
      );
      skippedCount++;
      continue;
    }

    const categoryId =
      categoriesMap[item.categorySlug] ||
      categoriesMap['women-apparel'] ||
      Object.values(categoriesMap)[0]!;

    await prisma.product.create({
      data: {
        name: item.name,
        nameTh: item.nameTh,
        slug: item.slug,
        description: item.description,
        descriptionTh: item.descriptionTh,
        materialsCare: item.materialsCare,
        materialsCareTh: item.materialsCareTh,
        basePrice: item.basePrice,
        originalPrice: item.originalPrice ?? null,
        tag: item.tag ?? null,
        tagTh: item.tagTh ?? null,
        categoryId,
        isPreorder: item.isPreorder ?? false,
        preorderReleaseDate: item.preorderReleaseDate
          ? new Date(item.preorderReleaseDate)
          : null,
        preorderLimit: item.preorderLimit ?? null,
        preorderDepositAmount: item.preorderDepositAmount ?? null,
        createdByAdminId: admin.id,
        images: {
          create: item.images.map((img, i) => ({
            imageUrl: img,
            displayOrder: i,
            isPrimary: i === 0,
          })),
        },
        variants: {
          create: item.variants.map((v) => ({
            skuCode: v.sku,
            size: v.size,
            colorName: v.color,
            colorHex: v.hex,
            weightGrams: v.weight,
            inventoryItem: {
              create: {
                quantityAvailable: v.stock,
                quantityReserved: 0,
                preorderBooked: 0,
              },
            },
          })),
        },
      },
    });

    createdCount++;
    console.log(
      `✅ [${createdCount}] Created product: "${item.name}" with ${item.variants.length} SKUs & inventory.`,
    );
  }

  console.log('\n==================================================');
  console.log(`🎉 Finished Product Seeding!`);
  console.log(`   ➕ Total Created: ${createdCount}`);
  console.log(`   ⏩ Total Skipped: ${skippedCount}`);
  console.log(`   📦 Catalog Total: ${PRODUCTS_SEED_DATA.length}`);
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('❌ Product seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
