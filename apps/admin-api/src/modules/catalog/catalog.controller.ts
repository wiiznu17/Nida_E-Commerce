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
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
} from './dto/create-product.dto.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  createProductSchema,
  queryProductsSchema,
  updateProductStatusSchema,
  createCategorySchema,
  updateCategorySchema,
} from '@repo/validators';
import { AdminPermission, type ApiAdminUser } from '@repo/types';
import { CurrentAdmin, RequirePermissions } from '../auth/decorators/index.js';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieve categories, optionally filtered by department and include inactive.',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description:
      'Filter categories by department code (WOMEN, MEN, KIDS, BAGS, SHOES, FRAGRANCE)',
    example: 'WOMEN',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive/hidden categories',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
  })
  getCategories(
    @Query('department') department?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const showAll = includeInactive === 'true' || includeInactive === '1';
    return this.catalogService.getCategories(department, showAll);
  }

  @Post('categories')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category or sub-category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  createCategory(
    @Body(new ZodValidationPipe(createCategorySchema))
    dto: CreateCategoryDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.createCategory(dto, admin?.id);
  }

  @Patch('categories/:id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCategorySchema))
    dto: UpdateCategoryDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.updateCategory(id, dto, admin?.id);
  }

  @Delete('categories/:id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  deleteCategory(
    @Param('id') id: string,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.deleteCategory(id, admin?.id);
  }

  @Get('products')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiOperation({
    summary: 'Search & list products',
    description:
      'Search products with filtering, sorting, and pagination. Supports department, category, tag, pre-order, and text search.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching products with pagination metadata',
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
  @ApiResponse({
    status: 200,
    description: 'Total counts breakdown: { all, published, draft }',
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
  @ApiParam({
    name: 'slug',
    description: 'Product slug or UUID',
    example: 'iconic-cable-knit-crewneck-sweater',
  })
  @ApiResponse({
    status: 200,
    description: 'Full product detail specifications and SKU variants',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
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
    description:
      'Product created successfully with variants and inventory items.',
  })
  createProduct(
    @Body(new ZodValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.createProduct(createProductDto, admin?.id);
  }

  @Put('products/:id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiOperation({
    summary: 'Update product details',
    description:
      'Update catalog specifications, pricing, gallery images, and SKU variants of an existing product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID or slug identifier',
    example: '9e169d9c-5036-414a-adf7-f1248625a3a0',
  })
  @ApiBody({
    type: UpdateProductDto,
    description:
      'Product fields to update (supports partial updates, image changes, and SKU additions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.updateProduct(id, dto, admin?.id);
  }

  @Patch('products/:id/status')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiOperation({
    summary: 'Toggle product active/published status',
    description:
      'Updates publication status (isActive: true for Published, false for Draft) of a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '9e169d9c-5036-414a-adf7-f1248625a3a0',
  })
  @ApiBody({
    type: UpdateProductStatusDto,
    description: 'Active status payload',
  })
  @ApiResponse({
    status: 200,
    description: 'Publication status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  toggleProductStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductStatusSchema))
    body: UpdateProductStatusDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.toggleProductStatus(
      id,
      Boolean(body.isActive),
      admin?.id,
    );
  }

  @Delete('products/:id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete or archive a product',
    description:
      'Deletes a product, or archives it if associated with order history.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted or archived successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  deleteProduct(
    @Param('id') id: string,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.catalogService.deleteProduct(id, admin?.id);
  }
}
