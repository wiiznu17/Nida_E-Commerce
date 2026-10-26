import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CustomerCatalogService } from './catalog.service.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import { syncCartSchema, type SyncCartInput } from '@repo/validators';
import type {
  ApiProduct,
  ApiProductDetail,
  ApiCategory,
  PaginatedResponse,
  SyncCartResponse,
} from '@repo/types';

@ApiTags('Storefront Catalog')
@Controller('catalog')
export class CustomerCatalogController {
  constructor(private readonly catalogService: CustomerCatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'List storefront products' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'subCategory', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'colors', required: false, type: String })
  @ApiQuery({ name: 'isPreorder', required: false, type: Boolean })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'featured',
      'newest',
      'price_asc',
      'price-asc',
      'price_desc',
      'price-desc',
    ],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProducts(
    @Query('department') department?: string,
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('colors') colors?: string,
    @Query('isPreorder') isPreorder?: string,
    @Query('sortBy')
    sortBy?:
      | 'featured'
      | 'newest'
      | 'price_asc'
      | 'price-asc'
      | 'price_desc'
      | 'price-desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<ApiProduct>> {
    const parsedColors = colors
      ? colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : undefined;
    const parsedMinPrice =
      minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined;
    const parsedMaxPrice =
      maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined;

    return this.catalogService.getProducts({
      department,
      category,
      subCategory,
      search,
      tag,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      colors: parsedColors,
      isPreorder: isPreorder !== undefined ? isPreorder === 'true' : undefined,
      sortBy,
      page: page ? Math.max(1, Number(page)) : 1,
      limit: limit ? Math.min(100, Math.max(1, Number(limit))) : 24,
    });
  }

  @Get('products/:slugOrId')
  @ApiOperation({ summary: 'Get product detail with live variant stock' })
  @ApiResponse({
    status: 200,
    description: 'Product detail including variant stock availability',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySlug(
    @Param('slugOrId') slugOrId: string,
  ): Promise<ApiProductDetail> {
    return this.catalogService.getProductBySlug(slugOrId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'department', required: false })
  async getCategories(
    @Query('department') department?: string,
  ): Promise<ApiCategory[]> {
    return this.catalogService.getCategories(department);
  }

  @Post('sync-cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch sync latest prices and stock for cart items' })
  @ApiResponse({
    status: 200,
    description: 'Latest variant prices, status, and stock availability',
  })
  async syncCart(
    @Body(new ZodValidationPipe(syncCartSchema)) dto: SyncCartInput,
  ): Promise<SyncCartResponse> {
    return this.catalogService.syncCart(dto);
  }
}
