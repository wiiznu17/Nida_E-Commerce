import 'dotenv/config';
import { PrismaClient, Department, DiscountType, StockChangeType } from './generated/prisma/client.js';

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

  // 3. Create Categories
  console.log('📂 Creating Product Categories...');
  const categoriesData = [
    { name: 'Women Apparel', slug: 'women-apparel', department: Department.WOMEN },
    { name: 'Men Apparel', slug: 'men-apparel', department: Department.MEN },
    { name: 'Classic Bags', slug: 'bags-accessories', department: Department.BAGS },
    { name: 'Footwear & Shoes', slug: 'footwear-shoes', department: Department.SHOES },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap[cat.slug] = created.id;
  }

  // 4. Create Products, Variants, Images & Inventory
  console.log('👗 Creating Products, Variants, Images & Stock...');
  const productsList = [
    {
      name: 'Iconic Cable-Knit Crewneck Sweater',
      slug: 'iconic-cable-knit-crewneck-sweater',
      description:
        'Handcrafted luxury cable-knit sweater made from 100% fine Merino wool. Timeless elegance for autumn and winter.',
      materialsCare: '100% Merino Wool. Dry clean only or gentle hand wash cold.',
      basePrice: 129.0,
      originalPrice: 179.0,
      tag: 'BESTSELLER',
      categorySlug: 'women-apparel',
      isPreorder: false,
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'SWTR-WHT-S', size: 'S', color: 'Ivory White', hex: '#FFFFFF', stock: 25, weight: 380 },
        { sku: 'SWTR-WHT-M', size: 'M', color: 'Ivory White', hex: '#FFFFFF', stock: 35, weight: 400 },
        { sku: 'SWTR-NVY-S', size: 'S', color: 'Navy Dark', hex: '#1E293B', stock: 20, weight: 380 },
        { sku: 'SWTR-NVY-M', size: 'M', color: 'Navy Dark', hex: '#1E293B', stock: 30, weight: 400 },
      ],
    },
    {
      name: 'Heritage Double-Breasted Trench Coat',
      slug: 'heritage-double-breasted-trench-coat',
      description: 'Tailored double-breasted trench coat with storm flap, horn buttons, and adjustable waist belt.',
      materialsCare: 'Cotton gabardine with water-repellent finish. Professional dry clean.',
      basePrice: 289.0,
      originalPrice: 380.0,
      tag: 'NEW ARRIVAL',
      categorySlug: 'women-apparel',
      isPreorder: false,
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'TRNCH-BGE-S', size: 'S', color: 'Classic Beige', hex: '#D4B996', stock: 15, weight: 850 },
        { sku: 'TRNCH-BGE-M', size: 'M', color: 'Classic Beige', hex: '#D4B996', stock: 20, weight: 890 },
      ],
    },
    {
      name: 'Pre-Order: Limited Edition Cashmere Overcoat (Winter 2026)',
      slug: 'preorder-limited-cashmere-overcoat',
      description: 'Exclusive artisanal overcoat crafted in limited quantities from Italian double-faced cashmere.',
      materialsCare: '100% Italian Cashmere. Specialist dry clean.',
      basePrice: 490.0,
      originalPrice: 590.0,
      tag: 'LIMITED DROP',
      categorySlug: 'men-apparel',
      isPreorder: true,
      preorderReleaseDate: new Date('2026-11-15T00:00:00Z'),
      preorderLimit: 50,
      preorderDepositAmount: 100.0,
      images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { sku: 'OVRCT-BLK-M', size: 'M', color: 'Midnight Black', hex: '#111827', stock: 0, weight: 1200 },
        { sku: 'OVRCT-BLK-L', size: 'L', color: 'Midnight Black', hex: '#111827', stock: 0, weight: 1250 },
      ],
    },
    {
      name: 'Saffiano Leather Executive Tote',
      slug: 'saffiano-leather-executive-tote',
      description:
        'Structured luxury tote bag made from scratch-resistant Saffiano calf leather with gold-tone hardware.',
      materialsCare: '100% Calf Leather. Wipe clean with soft damp cloth.',
      basePrice: 220.0,
      originalPrice: 275.0,
      tag: 'ICONIC',
      categorySlug: 'bags-accessories',
      isPreorder: false,
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { sku: 'BAG-TOTE-BLK', size: 'One Size', color: 'Onyx Black', hex: '#000000', stock: 40, weight: 650 },
        { sku: 'BAG-TOTE-BRN', size: 'One Size', color: 'Cognac Brown', hex: '#78350F', stock: 25, weight: 650 },
      ],
    },
  ];

  for (const item of productsList) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        materialsCare: item.materialsCare,
        basePrice: item.basePrice,
        originalPrice: item.originalPrice,
        tag: item.tag,
        categoryId: categoriesMap[item.categorySlug]!,
        isPreorder: item.isPreorder,
        preorderReleaseDate: item.preorderReleaseDate ?? null,
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
