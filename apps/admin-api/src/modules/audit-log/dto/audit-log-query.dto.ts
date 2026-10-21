import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditActionType } from '@repo/types';

export class AuditLogQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
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
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'Filter by affected database table (e.g. products, orders, categories)',
    example: 'products',
  })
  @IsOptional()
  @IsString()
  targetTable?: string;

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: AuditActionType,
    example: AuditActionType.UPDATE,
  })
  @IsOptional()
  @IsEnum(AuditActionType)
  actionType?: AuditActionType;

  @ApiPropertyOptional({
    description: 'Filter by admin permission',
    example: 'CATALOG_WRITE',
  })
  @IsOptional()
  @IsString()
  permission?: string;

  @ApiPropertyOptional({
    description: 'Filter by actor admin UUID',
    example: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @IsOptional()
  @IsString()
  adminId?: string;

  @ApiPropertyOptional({
    description: 'Search string across action summary and details',
    example: 'Product updated',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start date ISO string (inclusive)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date ISO string (inclusive)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
