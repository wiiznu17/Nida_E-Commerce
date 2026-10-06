import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { QueryProductsDto, SortByOption } from './dto/query-products.dto.js';
import type {
  CategoryWithRelations,
  ProductListPayload,
} from './types/catalog.payloads.js';
import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  ApiProductVariant,
  ApiProductImage,
  ApiColorSwatch,
  PaginatedResponse,
} from '@repo/types';
import { Prisma, Department } from '@repo/database';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(department?: string): Promise<ApiCategory[]> {
    const where: Prisma.CategoryWhereInput = { isActive: true };
    if (department && Object.values(Department).includes(department as Department)) {
      where.department = department as Department;
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

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (department || category) {
      where.category = {};
      if (department && Object.values(Department).includes(department as Department)) {
        where.category.department = department as Department;
      }
      if (category) {
        where.category.slug = category;
      }
    }

    if (tag) {
      where.tag = tag;
    }

    if (isPreorder !== undefined) {
      where.isPreorder = isPreorder;
    }

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

  private mapCategory(cat: CategoryWithRelations): ApiCategory {
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      department: cat.department,
      description: undefined,
      bannerTag: cat.bannerTag ?? undefined,
      bannerImage: cat.bannerImage ?? undefined,
      displayOrder: cat.displayOrder,
      parentId: cat.parentId ?? undefined,
      children: cat.children?.map((c) => this.mapCategory(c)),
      productCount: cat._count?.products,
    };
  }

  private mapProductListItem(p: ProductListPayload): ApiProduct {
    const colorMap = new Map<string, ApiColorSwatch>();
    for (const v of p.variants) {
      if (!colorMap.has(v.colorHex)) {
        colorMap.set(v.colorHex, { name: v.colorName, hex: v.colorHex });
      }
    }

    const inStock = p.variants.some((v) => (v.inventoryItem?.quantityAvailable ?? 0) > 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      basePrice: Number(p.basePrice),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      primaryImage: p.images[0]?.imageUrl,
      secondaryImage: p.images[1]?.imageUrl,
      department: p.category.department,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      tag: p.tag ?? undefined,
      colors: Array.from(colorMap.values()),
      reviewsCount: p._count.reviews,
      inStock,
      isPreorder: p.isPreorder,
    };
  }

  private buildOrderBy(sortBy?: SortByOption): Prisma.ProductOrderByWithRelationInput[] {
    switch (sortBy) {
      case SortByOption.PRICE_ASC:
        return [{ basePrice: 'asc' }];
      case SortByOption.PRICE_DESC:
        return [{ basePrice: 'desc' }];
      case SortByOption.BESTSELLER:
      case SortByOption.NEWEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }
}
