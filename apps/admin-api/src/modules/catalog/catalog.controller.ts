import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  createProductSchema,
  queryProductsSchema,
  updateProductStatusSchema,
} from '@repo/validators';
import { AdminPermission } from '@repo/types';
import { RequirePermissions } from '../auth/decorators/index.js';

@ApiTags('Catalog')
@Controller(['catalog', ''])
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieve all active categories, optionally filtered by department (WOMEN, MEN, BAGS, SHOES, etc.)',
  })
  getCategories(@Query('department') department?: string) {
    return this.catalogService.getCategories(department);
  }

  @Get('products')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiOperation({
    summary: 'Search & list products',
    description:
      'Search products with filtering, sorting, and pagination. Supports department, category, tag, pre-order, and text search.',
  })
  getProducts(
    @Query(new ZodValidationPipe(queryProductsSchema))
    query: QueryProductsDto,
  ) {
    return this.catalogService.getProducts(query);
  }

  @Get('products/counts')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiOperation({
    summary: 'Get product status counts',
    description: 'Retrieve counts for all, published, and draft products',
  })
  getProductCounts() {
    return this.catalogService.getProductCounts();
  }

  @Get('products/:slug')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiOperation({
    summary: 'Get product details',
    description:
      'Retrieve full product details including variants, images, inventory status, and pre-order info.',
  })
  @ApiParam({ name: 'slug', example: 'iconic-cable-knit-crewneck-sweater' })
  getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @Post('products')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a new product with image gallery, variant SKU matrix, and initial inventory in PostgreSQL.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully with variants and inventory items.',
  })
  createProduct(
    @Body(new ZodValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
  ) {
    return this.catalogService.createProduct(createProductDto);
  }

  @Put('products/:id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiOperation({
    summary: 'Update product details',
    description: 'Update catalog specifications, pricing, and details of an existing product.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID or slug' })
  updateProduct(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Patch('products/:id/status')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiOperation({
    summary: 'Toggle product active/published status',
    description: 'Updates publication status (isActive: true/false) of a product.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  toggleProductStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductStatusSchema))
    body: { isActive: boolean },
  ) {
    return this.catalogService.toggleProductStatus(id, Boolean(body.isActive));
  }

  @Delete('products/:id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete or archive a product',
    description: 'Deletes a product, or archives it if associated with order history.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }
}

