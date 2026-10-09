import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSkuVariantDto {
  @ApiProperty({ description: 'Unique SKU Code', example: 'SWTR-WHT-S' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Size', example: 'S' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ description: 'Color name', example: 'Ivory White' })
  @IsString()
  @IsNotEmpty()
  colorName: string;

  @ApiProperty({ description: 'Color hex code', example: '#FFFFFF' })
  @IsString()
  @IsNotEmpty()
  colorHex: string;

  @ApiPropertyOptional({ description: 'Initial available stock', example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Low stock threshold alert', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Price adjustment over base price', example: 0 })
  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;

  @ApiPropertyOptional({ description: 'Barcode string', example: '8850123456789' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Shipping weight in grams', example: 350 })
  @IsOptional()
  @IsNumber()
  weightGrams?: number;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name (English)', example: 'Iconic Cable-Knit Crewneck Sweater' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Product name (Thai)', example: 'สเวตเตอร์ถักเคเบิลไอคอนิค' })
  @IsOptional()
  @IsString()
  nameTh?: string;

  @ApiPropertyOptional({ description: 'Base selling price (USD)', example: 129 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Base selling price (alias for price)', example: 129 })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional({ description: 'Original strike-through price (USD)', example: 179 })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Primary cover image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Secondary hover image URL' })
  @IsOptional()
  @IsString()
  secondaryImage?: string;

  @ApiProperty({ description: 'Category identifier or slug', example: 'apparel' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Department code (WOMEN, MEN, BAGS, SHOES, HOME)', example: 'WOMEN' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Sub-category name (EN)', example: 'Sweaters & Knits' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ description: 'Sub-category name (TH)', example: 'สเวตเตอร์และเสื้อไหมพรม' })
  @IsOptional()
  @IsString()
  subCategoryTh?: string;

  @ApiPropertyOptional({ description: 'Badge or promotional tag (EN)', example: 'BESTSELLER' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Badge or promotional tag (TH)', example: 'สินค้าขายดี' })
  @IsOptional()
  @IsString()
  tagTh?: string;

  @ApiPropertyOptional({ description: 'Product story and description (EN)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Product story and description (TH)' })
  @IsOptional()
  @IsString()
  descriptionTh?: string;

  @ApiPropertyOptional({ description: 'Materials and care guidelines (EN)' })
  @IsOptional()
  @IsString()
  materialsCare?: string;

  @ApiPropertyOptional({ description: 'Materials and care guidelines (TH)' })
  @IsOptional()
  @IsString()
  materialsCareTh?: string;

  @ApiPropertyOptional({ description: 'List of color names', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiPropertyOptional({ description: 'Mapping of color names to dedicated image URLs' })
  @IsOptional()
  @IsObject()
  colorImages?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Whether this product is pre-order', example: false })
  @IsOptional()
  @IsBoolean()
  isPreorder?: boolean;

  @ApiPropertyOptional({ description: 'Expected release / ship date for pre-order' })
  @IsOptional()
  @IsString()
  preorderReleaseDate?: string;

  @ApiPropertyOptional({ description: 'Maximum pre-order unit cap', example: 50 })
  @IsOptional()
  @IsNumber()
  preorderLimit?: number;

  @ApiPropertyOptional({ description: 'Pre-order deposit amount required', example: 50 })
  @IsOptional()
  @IsNumber()
  preorderDepositAmount?: number;

  @ApiPropertyOptional({ description: 'SKU Variant list', type: [CreateSkuVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkuVariantDto)
  skus?: CreateSkuVariantDto[];

  @ApiPropertyOptional({ description: 'Publication status: true for Published, false for Draft', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
