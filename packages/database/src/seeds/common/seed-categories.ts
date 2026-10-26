import { PrismaClient, Department } from '../../generated/prisma/index.js';
import { CATEGORIES_SEED_DATA } from '../../catalog-seed.data.js';

export async function seedCategories(
  prisma: PrismaClient,
): Promise<Record<string, string>> {
  console.log(
    `📂 Upserting product categories (${CATEGORIES_SEED_DATA.length} categories)...`,
  );
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
  return categoriesMap;
}
