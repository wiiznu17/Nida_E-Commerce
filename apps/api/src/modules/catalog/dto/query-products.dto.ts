
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortByOption {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  BESTSELLER = 'bestseller',
}

export class QueryProductsDto {
  @ApiPropertyOptional({
    description: 'Search by product name',
    example: 'sweater',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category slug',
    example: 'sweaters-knits',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by department',
    enum: ['WOMEN', 'MEN', 'KIDS', 'BAGS', 'SHOES', 'HOME'],
    example: 'WOMEN',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag (e.g. BESTSELLER, NEW ARRIVAL)',
    example: 'BESTSELLER',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Filter pre-order products only',
    example: false,
  })
  @IsOptional()
  isPreorder?: boolean;

  @ApiPropertyOptional({ enum: SortByOption, default: SortByOption.NEWEST })
  @IsOptional()
  @IsEnum(SortByOption)
  sortBy?: SortByOption = SortByOption.NEWEST;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 12,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}
