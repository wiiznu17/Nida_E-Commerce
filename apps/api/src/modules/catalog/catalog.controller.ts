// ====================================================
// CatalogController — REST Endpoints สำหรับแคตตาล็อก
// ====================================================
// Controller มีหน้าที่เฉพาะ:
// 1. รับ Request + Validate Input
// 2. เรียก Service ให้ทำงาน
// 3. กำหนด Swagger Docs
// ❌ ไม่มี Business Logic ใดๆ

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // -------------------------------------------------------
  // GET /api/v1/categories
  // -------------------------------------------------------
  @Get('categories')
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieve all active categories, optionally filtered by department (WOMEN, MEN, BAGS, SHOES, etc.)',
  })
  getCategories(@Query('department') department?: string) {
    return this.catalogService.getCategories(department);
  }

  // -------------------------------------------------------
  // GET /api/v1/products
  // -------------------------------------------------------
  @Get('products')
  @ApiOperation({
    summary: 'Search & list products',
    description:
      'Search products with filtering, sorting, and pagination. Supports department, category, tag, pre-order, and text search.',
  })
  getProducts(@Query() query: QueryProductsDto) {
    return this.catalogService.getProducts(query);
  }

  // -------------------------------------------------------
  // GET /api/v1/products/:slug
  // -------------------------------------------------------
  @Get('products/:slug')
  @ApiOperation({
    summary: 'Get product details',
    description:
      'Retrieve full product details including variants, images, inventory status, and pre-order info.',
  })
  @ApiParam({ name: 'slug', example: 'iconic-cable-knit-crewneck-sweater' })
  getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}
