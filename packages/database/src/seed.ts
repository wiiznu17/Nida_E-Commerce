import 'dotenv/config';
import { PrismaClient, Department, DiscountType, StockChangeType } from './generated/prisma/index.js';

import {
  CATEGORIES_SEED_DATA,
  PRODUCTS_SEED_DATA,
} from './catalog-seed.data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Nida E-Commerce...');

  // 1. Clean existing records (in reverse dependency order)
  console.log('🧹 Cleaning existing data...');
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

  // 2. Create Roles & Super Admin
  console.log('👑 Creating Roles and Super Admin...');
  const superAdminRole = await prisma.role.create({
    data: {
      roleCode: 'SUPER_ADMIN',
      roleName: 'Super Administrator',
      description: 'Full system control and configuration',
    },
  });

  const admin = await prisma.adminUser.create({
    data: {
      username: 'superadmin',
      email: 'admin@nida-apparel.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8eqKMBGdVg0K6yKkG2', // demo hash for "admin123"
      fullName: 'Nida Super Admin',
      department: 'Headquarters',
      roleId: superAdminRole.id,
    },
  });

  // 3. Create Categories (Parent Categories first, then Subcategories)
  console.log(`📂 Creating Product Categories (${CATEGORIES_SEED_DATA.length} categories)...`);
  const categoriesMap: Record<string, string> = {};

  // First pass: parent categories
  const parentCategories = CATEGORIES_SEED_DATA.filter((c) => !c.parentSlug);
  for (const cat of parentCategories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        nameTh: cat.nameTh,
        slug: cat.slug,
        department: cat.department as Department,
        displayOrder: cat.displayOrder,
      },
    });
    categoriesMap[cat.slug] = created.id;
  }

  // Second pass: sub-categories with parentId relation
  const subCategories = CATEGORIES_SEED_DATA.filter((c) => c.parentSlug);
  for (const cat of subCategories) {
    const parentId = categoriesMap[cat.parentSlug!];
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        nameTh: cat.nameTh,
        slug: cat.slug,
        department: cat.department as Department,
        parentId: parentId ?? null,
        displayOrder: cat.displayOrder,
      },
    });
    categoriesMap[cat.slug] = created.id;
  }

  // 4. Create Products, Variants, Images & Inventory
  console.log(`👗 Creating Products (${PRODUCTS_SEED_DATA.length} products with complete SKU matrix)...`);

  for (const item of PRODUCTS_SEED_DATA) {
    const categoryId =
      categoriesMap[item.categorySlug] ||
      categoriesMap['women-apparel'] ||
      Object.values(categoriesMap)[0]!;

    const product = await prisma.product.create({
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
        tag: item.tag,
        tagTh: item.tagTh,
        categoryId,
        isPreorder: item.isPreorder ?? false,
        preorderReleaseDate: item.preorderReleaseDate ? new Date(item.preorderReleaseDate) : null,
        preorderLimit: item.preorderLimit ?? null,
        preorderDepositAmount: item.preorderDepositAmount ?? null,
        createdByAdminId: admin.id,
      },
    });

    // Images
    for (let i = 0; i < item.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: item.images[i]!,
          displayOrder: i,
          isPrimary: i === 0,
        },
      });
    }

    // Variants & Inventory
    for (const v of item.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          skuCode: v.sku,
          size: v.size,
          colorName: v.color,
          colorHex: v.hex,
          weightGrams: v.weight,
        },
      });

      await prisma.inventoryItem.create({
        data: {
          variantId: variant.id,
          quantityAvailable: v.stock,
          quantityReserved: 0,
          preorderBooked: 0,
        },
      });

      if (v.stock > 0) {
        await prisma.stockMovement.create({
          data: {
            variantId: variant.id,
            adminId: admin.id,
            changeType: StockChangeType.RESTOCK,
            quantityChange: v.stock,
            balanceAfter: v.stock,
            reasonNote: 'Initial warehouse batch intake',
          },
        });
      }
    }
  }

  // 5. Create Sample Promotion Coupons
  console.log('🎟️ Creating Promotion Coupons...');
  await prisma.promotionCoupon.createMany({
    data: [
      {
        code: 'NIDA20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minOrderAmount: 100,
        maxDiscountAmount: 50,
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
        minOrderAmount: 50,
        totalUsageLimit: 1000,
        userUsageLimit: 2,
        startsAt: new Date(),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        isActive: true,
      },
      {
        code: 'WELCOME50',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 50,
        minOrderAmount: 200,
        totalUsageLimit: 200,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        isActive: true,
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('🔑 Super Admin Credentials:');
  console.log('   Username: superadmin');
  console.log('   Email:    admin@nida-apparel.com');
  console.log('   Password: admin123');
  console.log('🎟️ Sample Coupons: NIDA20, FREESHIP, WELCOME50');
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
