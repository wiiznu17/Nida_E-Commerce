import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { QueryProductsDto, SortByOption } from './dto/query-products.dto.js';
import { CreateProductDto, CreateSkuVariantDto } from './dto/create-product.dto.js';
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
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

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

    const where: Prisma.ProductWhereInput = {};

    if (query.status === 'published' || query.isActive === true) {
      where.isActive = true;
    } else if (query.status === 'draft' || query.isActive === false) {
      where.isActive = false;
    } else if (query.status !== 'all') {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
      ];
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

  async getProductBySlug(slugOrId: string): Promise<ApiProductDetail> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const product = await this.prisma.product.findFirst({
      where: isUuid
        ? { OR: [{ id: slugOrId }, { slug: slugOrId }] }
        : { slug: slugOrId },
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
      throw new NotFoundException(`Product with identifier "${slugOrId}" not found`);
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : undefined;

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
      category: this.mapCategory(product.category),
      images: product.images.map((img): ApiProductImage => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText ?? undefined,
        altTextTh: img.altTextTh ?? undefined,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
      })),
      variants: product.variants.map((v): ApiProductVariant => ({
        id: v.id,
        sku: v.skuCode,
        size: v.size,
        colorName: v.colorName,
        colorNameTh: v.colorNameTh ?? undefined,
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
      isActive: product.isActive,
    };
  }

  async createProduct(dto: CreateProductDto): Promise<ApiProductDetail> {
    const basePrice = dto.basePrice ?? dto.price ?? 0;
    const originalPrice = dto.originalPrice ?? null;

    const slug = await this.generateUniqueSlug(dto.name);
    const category = await this.resolveCategory(dto.category, dto.department);
    const imageList = await this.commitAndPrepareImages(dto);
    const skusToCreate = this.prepareSkusToCreate(dto.skus, slug, dto.colors?.[0]);

    const newProduct = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: dto.name,
          nameTh: dto.nameTh ?? null,
          slug,
          description: dto.description ?? null,
          descriptionTh: dto.descriptionTh ?? null,
          materialsCare: dto.materialsCare ?? null,
          materialsCareTh: dto.materialsCareTh ?? null,
          basePrice,
          originalPrice,
          tag: dto.tag ?? null,
          tagTh: dto.tagTh ?? null,
          categoryId: category.id,
          isPreorder: dto.isPreorder ?? false,
          preorderReleaseDate: dto.preorderReleaseDate ? new Date(dto.preorderReleaseDate) : null,
          preorderLimit: dto.preorderLimit ?? null,
          preorderDepositAmount: dto.preorderDepositAmount ?? null,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      for (const img of imageList) {
        await tx.productImage.create({
          data: {
            productId: created.id,
            imageUrl: img.imageUrl,
            displayOrder: img.displayOrder,
            isPrimary: img.isPrimary,
            altText: img.altText ?? null,
          },
        });
      }

      for (const skuItem of skusToCreate) {
        const variant = await tx.productVariant.create({
          data: {
            productId: created.id,
            skuCode: skuItem.sku,
            size: skuItem.size,
            colorName: skuItem.colorName,
            colorHex: skuItem.colorHex,
            priceAdjustment: skuItem.priceAdjustment ?? 0,
            barcode: skuItem.barcode ?? null,
            weightGrams: skuItem.weightGrams ?? 300,
          },
        });

        await tx.inventoryItem.create({
          data: {
            variantId: variant.id,
            quantityAvailable: skuItem.stock ?? 0,
            quantityReserved: 0,
            preorderBooked: 0,
            lowStockThreshold: skuItem.lowStockThreshold ?? 5,
          },
        });
      }

      return created;
    });

    return this.getProductBySlug(newProduct.slug);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const rawSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const baseSlug = rawSlug.length > 0 ? rawSlug : `product-${Date.now()}`;

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });

    if (existingSlug) {
      return `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    return baseSlug;
  }

  private async resolveCategory(
    categoryInput: string,
    departmentInput?: string,
  ): Promise<{ id: string }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryInput);
    const categoryOrConditions: Prisma.CategoryWhereInput[] = [
      { slug: categoryInput.toLowerCase() },
      { name: { contains: categoryInput, mode: 'insensitive' } },
    ];
    if (isUuid) {
      categoryOrConditions.push({ id: categoryInput });
    }

    let category = await this.prisma.category.findFirst({
      where: { OR: categoryOrConditions },
    });

    if (!category && departmentInput) {
      const parsedDept = departmentInput.toUpperCase() as Department;
      if (Object.values(Department).includes(parsedDept)) {
        category = await this.prisma.category.findFirst({
          where: { department: parsedDept },
        });
      }
    }

    if (!category) {
      category = await this.prisma.category.findFirst();
    }

    if (!category) {
      const parsedDept = departmentInput?.toUpperCase() as Department | undefined;
      const validDept = parsedDept && Object.values(Department).includes(parsedDept)
        ? parsedDept
        : Department.WOMEN;

      const categoryName = categoryInput.trim().length > 0 ? categoryInput : 'General Apparel';
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      category = await this.prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          department: validDept,
        },
      });
    }

    return category;
  }

  private async commitAndPrepareImages(
    dto: CreateProductDto,
  ): Promise<Array<{ imageUrl: string; isPrimary: boolean; displayOrder: number; altText?: string }>> {
    let mainImageUrl = dto.image;
    if (mainImageUrl) {
      mainImageUrl = await this.uploadService.commitTempImage(mainImageUrl, 'products');
      dto.image = mainImageUrl;
    }

    let secondaryImageUrl = dto.secondaryImage;
    if (secondaryImageUrl) {
      secondaryImageUrl = await this.uploadService.commitTempImage(secondaryImageUrl, 'products');
      dto.secondaryImage = secondaryImageUrl;
    }

    if (dto.colorImages) {
      for (const [colorName, imgUrl] of Object.entries(dto.colorImages)) {
        if (imgUrl) {
          dto.colorImages[colorName] = await this.uploadService.commitTempImage(imgUrl, 'products');
        }
      }
    }

    const imageList: Array<{ imageUrl: string; isPrimary: boolean; displayOrder: number; altText?: string }> = [];

    if (mainImageUrl) {
      imageList.push({
        imageUrl: mainImageUrl,
        isPrimary: true,
        displayOrder: 0,
        altText: dto.name,
      });
    }

    if (secondaryImageUrl && secondaryImageUrl !== mainImageUrl) {
      imageList.push({
        imageUrl: secondaryImageUrl,
        isPrimary: false,
        displayOrder: imageList.length,
        altText: `${dto.name} - View 2`,
      });
    }

    if (dto.colorImages) {
      for (const [colorName, imgUrl] of Object.entries(dto.colorImages)) {
        if (imgUrl && !imageList.some((img) => img.imageUrl === imgUrl)) {
          imageList.push({
            imageUrl: imgUrl,
            isPrimary: false,
            displayOrder: imageList.length,
            altText: `${dto.name} - ${colorName}`,
          });
        }
      }
    }

    return imageList;
  }

  private prepareSkusToCreate(
    skus: CreateSkuVariantDto[] | undefined,
    slug: string,
    defaultColor?: string,
  ): CreateSkuVariantDto[] {
    if (skus && skus.length > 0) {
      return skus;
    }

    return [
      {
        sku: `${slug.substring(0, 8).toUpperCase()}-STD`,
        size: 'One Size',
        colorName: defaultColor ?? 'Standard',
        colorHex: '#000000',
        stock: 20,
        lowStockThreshold: 5,
        priceAdjustment: 0,
        weightGrams: 300,
      },
    ];
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
    };
  }

  private mapProductListItem(p: ProductListPayload): ApiProduct {
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
  }

  async toggleProductStatus(id: string, isActive: boolean): Promise<{ success: boolean; id: string; isActive: boolean }> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
    return { success: true, id: updated.id, isActive: updated.isActive };
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
