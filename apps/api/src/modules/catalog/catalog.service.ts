// ====================================================
// CatalogService — Business Logic สำหรับแคตตาล็อกสินค้า
// ====================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { QueryProductsDto, SortByOption } from './dto/query-products.dto.js';
import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  ApiProductVariant,
  ApiProductImage,
  ApiColorSwatch,
  PaginatedResponse,
} from '@repo/types';
import type { Department } from '@repo/database';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------
  // GET /categories — ดึงหมวดหมู่ทั้งหมด
  // -------------------------------------------------------
  async getCategories(department?: string): Promise<ApiCategory[]> {
    const where: Record<string, unknown> = { isActive: true };
    if (department) {
      where['department'] = department;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map((cat) => this.mapCategory(cat));
  }

  // -------------------------------------------------------
  // GET /products — ค้นหาสินค้าพร้อม pagination
  // -------------------------------------------------------
  async getProducts(
    query: QueryProductsDto,
  ): Promise<PaginatedResponse<ApiProduct>> {
    const {
      search,
      category,
      department,
      tag,
      isPreorder,
      sortBy,
      page = 1,
      limit = 12,
    } = query;
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where['name'] = { contains: search, mode: 'insensitive' };
    }
    if (department) {
      where['category'] = { department: department as Department };
    }
    if (category) {
      where['category'] = {
        ...((where['category'] as Record<string, unknown>) ?? {}),
        slug: category,
      };
    }
    if (tag) {
      where['tag'] = tag;
    }
    if (isPreorder !== undefined) {
      where['isPreorder'] = isPreorder;
    }

    // Build orderBy
    const orderBy = this.buildOrderBy(sortBy);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' }, take: 2 },
          variants: {
            include: { inventoryItem: true },
          },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products.map((p) => this.mapProductListItem(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -------------------------------------------------------
  // GET /products/:slug — รายละเอียดสินค้า
  // -------------------------------------------------------
  async getProductBySlug(slug: string): Promise<ApiProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            children: { where: { isActive: true } },
            _count: { select: { products: true } },
          },
        },
        images: { orderBy: { displayOrder: 'asc' } },
        variants: {
          include: { inventoryItem: true },
          orderBy: [{ colorName: 'asc' }, { size: 'asc' }],
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : undefined;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? undefined,
      materialsCare: product.materialsCare ?? undefined,
      basePrice: Number(product.basePrice),
      originalPrice: product.originalPrice
        ? Number(product.originalPrice)
        : undefined,
      tag: product.tag ?? undefined,
      department: product.category.department,
      category: this.mapCategory(product.category),
      images: product.images.map((img): ApiProductImage => ({
        id: img.id,
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
      })),
      variants: product.variants.map((v): ApiProductVariant => ({
        id: v.id,
        sku: v.skuCode,
        size: v.size,
        colorName: v.colorName,
        colorHex: v.colorHex,
        price: Number(product.basePrice) + Number(v.priceAdjustment),
        compareAtPrice: product.originalPrice
          ? Number(product.originalPrice) + Number(v.priceAdjustment)
          : undefined,
        inStock: (v.inventoryItem?.quantityAvailable ?? 0) > 0,
        quantityAvailable: v.inventoryItem?.quantityAvailable ?? 0,
        weightGrams: v.weightGrams,
        lengthCm: v.lengthCm ? Number(v.lengthCm) : undefined,
        widthCm: v.widthCm ? Number(v.widthCm) : undefined,
        heightCm: v.heightCm ? Number(v.heightCm) : undefined,
      })),
      rating: avgRating ? Math.round(avgRating * 10) / 10 : undefined,
      reviewsCount: product._count.reviews,
      isPreorder: product.isPreorder,
      preorderReleaseDate:
        product.preorderReleaseDate?.toISOString() ?? undefined,
      preorderLimit: product.preorderLimit ?? undefined,
      preorderDepositAmount: product.preorderDepositAmount
        ? Number(product.preorderDepositAmount)
        : undefined,
    };
  }

  // ====================================================
  // PRIVATE MAPPERS
  // ====================================================

  private mapCategory(cat: Record<string, unknown>): ApiCategory {
    return {
      id: cat['id'] as string,
      name: cat['name'] as string,
      slug: cat['slug'] as string,
      department: cat['department'] as Department,
      description: undefined,
      bannerTag: (cat['bannerTag'] as string) ?? undefined,
      bannerImage: (cat['bannerImage'] as string) ?? undefined,
      displayOrder: cat['displayOrder'] as number,
      parentId: (cat['parentId'] as string) ?? undefined,
      children: (cat['children'] as Record<string, unknown>[])?.map((c) =>
        this.mapCategory(c),
      ),
      productCount: (cat['_count'] as Record<string, number>)?.products,
    };
  }

  private mapProductListItem(p: Record<string, unknown>): ApiProduct {
    const category = p['category'] as Record<string, unknown>;
    const images = p['images'] as Record<string, unknown>[];
    const variants = p['variants'] as Record<string, unknown>[];
    const count = p['_count'] as Record<string, number>;

    // Extract unique colors from variants
    const colorMap = new Map<string, ApiColorSwatch>();
    for (const v of variants) {
      const hex = v['colorHex'] as string;
      if (!colorMap.has(hex)) {
        colorMap.set(hex, { name: v['colorName'] as string, hex });
      }
    }

    // Check if any variant is in stock
    const inStock = variants.some((v) => {
      const inv = v['inventoryItem'] as Record<string, number> | null;
      return (inv?.quantityAvailable ?? 0) > 0;
    });

    // Calculate average rating from reviews count (simplified — full calc is in detail endpoint)
    return {
      id: p['id'] as string,
      name: p['name'] as string,
      slug: p['slug'] as string,
      basePrice: Number(p['basePrice']),
      originalPrice: p['originalPrice']
        ? Number(p['originalPrice'])
        : undefined,
      primaryImage: images[0]?.['imageUrl'] as string | undefined,
      secondaryImage: images[1]?.['imageUrl'] as string | undefined,
      department: category['department'] as Department,
      categoryName: category['name'] as string,
      categorySlug: category['slug'] as string,
      tag: (p['tag'] as string) ?? undefined,
      colors: Array.from(colorMap.values()),
      reviewsCount: count?.reviews,
      inStock,
      isPreorder: p['isPreorder'] as boolean,
    };
  }

  private buildOrderBy(sortBy?: SortByOption): Record<string, string>[] {
    switch (sortBy) {
      case SortByOption.PRICE_ASC:
        return [{ basePrice: 'asc' }];
      case SortByOption.PRICE_DESC:
        return [{ basePrice: 'desc' }];
      case SortByOption.BESTSELLER:
        return [{ createdAt: 'desc' }]; // Simplified — would use sales count in production
      case SortByOption.NEWEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }
}
