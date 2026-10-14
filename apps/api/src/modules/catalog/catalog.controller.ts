import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CustomerCatalogService } from './catalog.service.js';
import type { ApiProduct, ApiProductDetail, ApiCategory, PaginatedResponse } from '@repo/types';

@ApiTags('Storefront Catalog')
@Controller('catalog')
export class CustomerCatalogController {
  constructor(private readonly catalogService: CustomerCatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'List storefront products' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'isPreorder', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'price_asc', 'price_desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProducts(
    @Query('department') department?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('isPreorder') isPreorder?: string,
    @Query('sortBy') sortBy?: 'newest' | 'price_asc' | 'price_desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<ApiProduct>> {
    return this.catalogService.getProducts({
      department,
      category,
      search,
      tag,
      isPreorder: isPreorder !== undefined ? isPreorder === 'true' : undefined,
      sortBy,
      page: page ? Math.max(1, Number(page)) : 1,
      limit: limit ? Math.min(100, Math.max(1, Number(limit))) : 24,
    });
  }

  @Get('products/:slugOrId')
  @ApiOperation({ summary: 'Get product detail with live variant stock' })
  @ApiResponse({ status: 200, description: 'Product detail including variant stock availability' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySlug(@Param('slugOrId') slugOrId: string): Promise<ApiProductDetail> {
    return this.catalogService.getProductBySlug(slugOrId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'department', required: false })
  async getCategories(@Query('department') department?: string): Promise<ApiCategory[]> {
    return this.catalogService.getCategories(department);
  }
}
