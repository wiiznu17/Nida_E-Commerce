import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import {
  Department,
  type ApiProduct,
  type ApiProductDetail,
  type ApiCategory,
  type ApiColorSwatch,
  type PaginatedResponse,
} from '@repo/types';

export interface StoreQueryProductsParams {
  department?: string;
  category?: string;
  search?: string;
  tag?: string;
  isPreorder?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class CustomerCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(params: StoreQueryProductsParams = {}): Promise<PaginatedResponse<ApiProduct>> {
    const {
      department,
      category,
      search,
      tag,
      isPreorder,
      sortBy = 'newest',
      page = 1,
      limit = 24,
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isActive: true, // Storefront only shows active products
    };

    if (search) {
      where['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department || category) {
      const categoryFilter: Record<string, unknown> = {};
      if (department && Object.values(Department).includes(department.toUpperCase() as Department)) {
        categoryFilter['department'] = department.toUpperCase() as Department;
      }
      if (category) {
        categoryFilter['slug'] = category;
      }
      where['category'] = categoryFilter;
    }

    if (tag) {
      where['tag'] = tag;
    }

    if (isPreorder !== undefined) {
      where['isPreorder'] = isPreorder;
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { basePrice: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: where as any,
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
      this.prisma.product.count({ where: where as any }),
    ]);

    const items: ApiProduct[] = products.map((p) => {
      const colorMap = new Map<string, ApiColorSwatch>();
      for (const v of p.variants) {
        if (!colorMap.has(v.colorHex)) {
          colorMap.set(v.colorHex, {
            name: v.colorName,
            nameTh: v.colorNameTh ?? undefined,
            hex: v.colorHex,
          });
        }
      }

      const inStock = p.variants.some((v) => (v.inventoryItem?.quantityAvailable ?? 0) > 0);

      return {
        id: p.id,
        name: p.name,
        nameTh: p.nameTh ?? undefined,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        primaryImage: p.images[0]?.imageUrl,
        secondaryImage: p.images[1]?.imageUrl,
        department: p.category.department,
        categoryName: p.category.name,
        categoryNameTh: p.category.nameTh ?? undefined,
        categorySlug: p.category.slug,
        tag: p.tag ?? undefined,
        tagTh: p.tagTh ?? undefined,
        colors: Array.from(colorMap.values()),
        reviewsCount: p._count.reviews,
        inStock,
        isPreorder: p.isPreorder,
        isActive: p.isActive,
      };
    });

    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slugOrId: string): Promise<ApiProductDetail> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    const product = await this.prisma.product.findFirst({
      where: isUuid ? { OR: [{ id: slugOrId }, { slug: slugOrId }] } : { slug: slugOrId },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: {
          include: { inventoryItem: true },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product "${slugOrId}" not found`);
    }

    return {
      id: product.id,
      name: product.name,
      nameTh: product.nameTh ?? undefined,
      slug: product.slug,
      description: product.description ?? undefined,
      descriptionTh: product.descriptionTh ?? undefined,
      materialsCare: product.materialsCare ?? undefined,
      materialsCareTh: product.materialsCareTh ?? undefined,
      basePrice: Number(product.basePrice),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      tag: product.tag ?? undefined,
      tagTh: product.tagTh ?? undefined,
      department: product.category.department,
      category: {
        id: product.category.id,
        name: product.category.name,
        nameTh: product.category.nameTh ?? undefined,
        slug: product.category.slug,
        department: product.category.department,
        displayOrder: product.category.displayOrder,
      },
      images: product.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText ?? undefined,
        altTextTh: img.altTextTh ?? undefined,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
      })),
      variants: product.variants.map((v) => {
        const available = v.inventoryItem?.quantityAvailable ?? 0;
        const variantPrice = Number(product.basePrice) + Number(v.priceAdjustment);
        const variantComparePrice = product.originalPrice
          ? Number(product.originalPrice) + Number(v.priceAdjustment)
          : undefined;

        return {
          id: v.id,
          sku: v.skuCode,
          size: v.size,
          colorName: v.colorName,
          colorNameTh: v.colorNameTh ?? undefined,
          colorHex: v.colorHex,
          price: variantPrice,
          compareAtPrice: variantComparePrice,
          inStock: available > 0,
          quantityAvailable: available,
          weightGrams: v.weightGrams ?? 350,
          lengthCm: v.lengthCm ? Number(v.lengthCm) : undefined,
          widthCm: v.widthCm ? Number(v.widthCm) : undefined,
          heightCm: v.heightCm ? Number(v.heightCm) : undefined,
        };
      }),
      reviewsCount: product._count.reviews,
      isPreorder: product.isPreorder,
      preorderReleaseDate: product.preorderReleaseDate?.toISOString(),
      preorderLimit: product.preorderLimit ?? undefined,
      preorderDepositAmount: product.preorderDepositAmount
        ? Number(product.preorderDepositAmount)
        : undefined,
      isActive: product.isActive,
    };
  }

  async getCategories(department?: string): Promise<ApiCategory[]> {
    const where: Record<string, unknown> = {};
    if (department && Object.values(Department).includes(department.toUpperCase() as Department)) {
      where['department'] = department.toUpperCase() as Department;
    }

    const categories = await this.prisma.category.findMany({
      where: where as any,
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameTh: c.nameTh ?? undefined,
      slug: c.slug,
      department: c.department,
      description: c.description ?? undefined,
      descriptionTh: c.descriptionTh ?? undefined,
      bannerTag: c.bannerTag ?? undefined,
      bannerTagTh: c.bannerTagTh ?? undefined,
      bannerImage: c.bannerImage ?? undefined,
      displayOrder: c.displayOrder,
      parentId: c.parentId ?? undefined,
    }));
  }
}
