import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Department } from '@repo/database';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name (EN)',
    example: 'Dresses & Jumpsuits',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Category name (TH)',
    example: 'ชุดเดรสและจั๊มสูท',
  })
  nameTh?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if omitted)',
    example: 'dresses-jumpsuits',
  })
  slug?: string;

  @ApiProperty({
    description: 'Department code',
    enum: Department,
    example: Department.WOMEN,
  })
  department!: Department;

  @ApiPropertyOptional({
    description: 'Parent category UUID (if this is a subcategory)',
    example: null,
  })
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Description (EN)',
    example: 'Elegant daytime and evening dresses',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Description (TH)',
    example: 'ชุดเดรสสำหรับกลางวันและงานกลางคืน',
  })
  descriptionTh?: string;

  @ApiPropertyOptional({
    description: 'Promotional banner tag (EN)',
    example: 'NEW ARRIVAL',
  })
  bannerTag?: string;

  @ApiPropertyOptional({
    description: 'Promotional banner tag (TH)',
    example: 'สินค้ามาใหม่',
  })
  bannerTagTh?: string;

  @ApiPropertyOptional({
    description: 'Banner image URL',
    example: 'https://images.unsplash.com/...',
  })
  bannerImage?: string;

  @ApiPropertyOptional({
    description: 'Display sort order',
    example: 1,
    default: 0,
  })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is active and visible in storefront',
    example: true,
    default: true,
  })
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category name (EN)' })
  name?: string;

  @ApiPropertyOptional({ description: 'Category name (TH)' })
  nameTh?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Department code', enum: Department })
  department?: Department;

  @ApiPropertyOptional({ description: 'Parent category UUID' })
  parentId?: string;

  @ApiPropertyOptional({ description: 'Description (EN)' })
  description?: string;

  @ApiPropertyOptional({ description: 'Description (TH)' })
  descriptionTh?: string;

  @ApiPropertyOptional({ description: 'Promotional banner tag (EN)' })
  bannerTag?: string;

  @ApiPropertyOptional({ description: 'Promotional banner tag (TH)' })
  bannerTagTh?: string;

  @ApiPropertyOptional({ description: 'Banner image URL' })
  bannerImage?: string;

  @ApiPropertyOptional({ description: 'Display sort order' })
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is active and visible in storefront' })
  isActive?: boolean;
}
