import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import {
  Department,
  MarketingTag,
  findMarketingTagByLabel,
  type ApiProduct,
  type ApiProductDetail,
  type ApiCategory,
  type ApiColorSwatch,
  type PaginatedResponse,
  type StoreQueryProductsParams,
} from '@repo/types';

type CategoryWithRelations = Prisma.CategoryGetPayload<
  Record<string, never>
> & {
  children?: CategoryWithRelations[];
  _count?: { products: number };
};

@Injectable()
export class CustomerCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(
    params: StoreQueryProductsParams = {},
  ): Promise<PaginatedResponse<ApiProduct>> {
    const {
      department,
      category,
      subCategory,
      search,
      tag,
      minPrice,
      maxPrice,
      colors,
      isPreorder,
      sortBy = 'newest',
      page = 1,
      limit = 24,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true, // Storefront only shows active products
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionTh: { contains: search, mode: 'insensitive' } },
        { tagTh: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { category: { nameTh: { contains: search, mode: 'insensitive' } } },
      ];

      const matchedTag = findMarketingTagByLabel(search);
      if (matchedTag) {
        where.OR.push({ tag: { equals: matchedTag.key } });
      }
    }

    if (department || category || subCategory) {
      const conditions: Prisma.CategoryWhereInput[] = [];

      if (
        department &&
        Object.values(Department).includes(
          department.toUpperCase() as Department,
        )
      ) {
        conditions.push({ department: department.toUpperCase() as Department });
      }

      if (category && category !== 'all') {
        conditions.push({
          OR: [{ slug: category }, { parent: { slug: category } }],
        });
      }

      if (subCategory) {
        conditions.push({
          OR: [
            { name: { contains: subCategory, mode: 'insensitive' } },
            { nameTh: { contains: subCategory, mode: 'insensitive' } },
            { slug: subCategory },
          ],
        });
      }

      if (conditions.length > 0) {
        where.category = { AND: conditions };
      }
    }

    const isSaleDept = department?.toLowerCase() === 'sale';

    if (tag) {
      const tagList = tag
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const matchedEnums: MarketingTag[] = [];
      for (const t of tagList) {
        const option = findMarketingTagByLabel(t);
        if (option) {
          matchedEnums.push(option.key);
        } else if (
          Object.values(MarketingTag).includes(t.toUpperCase() as MarketingTag)
        ) {
          matchedEnums.push(t.toUpperCase() as MarketingTag);
        }
      }

      if (matchedEnums.includes(MarketingTag.SALE)) {
        const otherTags = matchedEnums.filter((m) => m !== MarketingTag.SALE);
        const saleOrConditions: Prisma.ProductWhereInput[] = [
          { tag: MarketingTag.SALE },
          { originalPrice: { gt: this.prisma.product.fields.basePrice } },
        ];
        if (otherTags.length > 0) {
          saleOrConditions.push({ tag: { in: otherTags } });
        }
        where.AND = [
          ...(Array.isArray(where.AND)
            ? where.AND
            : where.AND
              ? [where.AND]
              : []),
          { OR: saleOrConditions },
        ];
      } else if (matchedEnums.length === 1) {
        where.tag = matchedEnums[0];
      } else if (matchedEnums.length > 1) {
        where.tag = { in: matchedEnums };
      }
    } else if (isSaleDept) {
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        {
          OR: [
            { tag: MarketingTag.SALE },
            { originalPrice: { gt: this.prisma.product.fields.basePrice } },
          ],
        },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      where.basePrice = priceFilter;
    }

    if (colors && colors.length > 0) {
      where.variants = {
        some: {
          colorHex: { in: colors, mode: 'insensitive' },
        },
      };
    }

    if (isPreorder !== undefined) {
      where.isPreorder = isPreorder;
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sortBy === 'price_asc' || sortBy === 'price-asc') {
      orderBy = { basePrice: 'asc' };
    } else if (sortBy === 'price_desc' || sortBy === 'price-desc') {
      orderBy = { basePrice: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

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

    const items: ApiProduct[] = products.map((p) => {
      const colorMap = new Map<string, ApiColorSwatch>();
      const sizeSet = new Set<string>();
      for (const v of p.variants) {
        if (!colorMap.has(v.colorHex)) {
          colorMap.set(v.colorHex, {
            name: v.colorName,
            nameTh: v.colorNameTh ?? undefined,
            hex: v.colorHex,
          });
        }
        if (v.size && v.size.trim()) {
          sizeSet.add(v.size.trim());
        }
      }

      const inStock = p.variants.some(
        (v) => (v.inventoryItem?.quantityAvailable ?? 0) > 0,
      );

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
        sizes: Array.from(sizeSet),
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
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slugOrId,
      );

    const product = await this.prisma.product.findFirst({
      where: isUuid
        ? { OR: [{ id: slugOrId }, { slug: slugOrId }] }
        : { slug: slugOrId },
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
      originalPrice: product.originalPrice
        ? Number(product.originalPrice)
        : undefined,
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
        const variantPrice =
          Number(product.basePrice) + Number(v.priceAdjustment);
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
    const where: Prisma.CategoryWhereInput = { isActive: true };
    if (
      department &&
      Object.values(Department).includes(department.toUpperCase() as Department)
    ) {
      where.department = department.toUpperCase() as Department;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map((c) => this.mapCategory(c));
  }

  private mapCategory(cat: CategoryWithRelations): ApiCategory {
    return {
      id: cat.id,
      name: cat.name,
      nameTh: cat.nameTh ?? undefined,
      slug: cat.slug,
      department: cat.department,
      description: cat.description ?? undefined,
      descriptionTh: cat.descriptionTh ?? undefined,
      bannerTag: cat.bannerTag ?? undefined,
      bannerTagTh: cat.bannerTagTh ?? undefined,
      bannerImage: cat.bannerImage ?? undefined,
      displayOrder: cat.displayOrder,
      parentId: cat.parentId ?? undefined,
      children: cat.children?.map((c) => this.mapCategory(c)),
      productCount: cat._count?.products,
      isActive: cat.isActive,
    };
  }
}
