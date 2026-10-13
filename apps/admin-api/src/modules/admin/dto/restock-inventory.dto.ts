import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockChangeType } from '@repo/types';

export class RestockInventoryDto {
  @ApiProperty({
    description: 'Variant ID, Inventory ID หรือ SKU Code ของสินค้าที่ต้องการปรับสต็อก',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiPropertyOptional({
    description: 'SKU Code ของสินค้า (ทางเลือก)',
    example: 'NIDA-JKT-BLK-M',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    description: 'จำนวนสินค้าที่ต้องการปรับ (เป็นบวกเพื่อเติมสต็อก หรือติดลบเพื่อปรับลดยอดสต็อก)',
    example: 10,
  })
  @IsInt()
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'ประเภทการเปลี่ยนแปลงสต็อก (RESTOCK, ADJUSTMENT, DAMAGE)',
    enum: StockChangeType,
    example: StockChangeType.RESTOCK,
  })
  @IsOptional()
  @IsEnum(StockChangeType)
  changeType?: StockChangeType;

  @ApiProperty({
    description:
      'เหตุผลหรือหมายเหตุการปรับสต็อก (เช่น ล็อตผลิตใหม่ PO-2026-001 หรือ ปรับลดสินค้าชำรุด)',
    example: 'ล็อตสินค้าใหม่เข้าคลัง PO-2026-001',
  })
  @IsString()
  @IsNotEmpty()
  reasonNote!: string;

  @ApiPropertyOptional({
    description: 'Admin ID ของเจ้าหน้าที่ผู้ดำเนินการ',
    example: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @IsOptional()
  @IsUUID()
  adminId?: string;
}
