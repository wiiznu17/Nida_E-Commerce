import { PrismaClient } from '../../generated/prisma/index.js';
import { PRODUCTS_SEED_DATA } from '../../catalog-seed.data.js';

export async function seedCatalog(
  prisma: PrismaClient,
  adminId: string,
  categoriesMap: Record<string, string>,
) {
  console.log(
    `👗 Creating Products (${PRODUCTS_SEED_DATA.length} products with SKU matrix)...`,
  );

  for (let idx = 0; idx < PRODUCTS_SEED_DATA.length; idx++) {
    const item = PRODUCTS_SEED_DATA[idx]!;
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
        createdByAdminId: adminId,
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

    console.log(
      `  • [${idx + 1}/${PRODUCTS_SEED_DATA.length}] ${item.name} (${item.variants.length} SKUs)`,
    );
  }
}
