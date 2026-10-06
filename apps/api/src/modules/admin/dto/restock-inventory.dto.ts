
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RestockInventoryDto {
  @ApiProperty({
    description: 'Variant ID ของสินค้าที่ต้องการเติมสต็อก',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    description: 'จำนวนสินค้าที่เติมเข้าคลัง (ขั้นต่ำ 1 ชิ้น)',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    description:
      'เหตุผลหรือหมายเหตุการเติมสต็อก (เช่น ล็อตผลิตใหม่ PO-2026-001)',
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
