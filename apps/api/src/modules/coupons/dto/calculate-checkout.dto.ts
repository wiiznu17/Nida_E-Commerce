// ====================================================
// CalculateCheckoutDto — DTO คำนวณยอดชำระเงิน Checkout
// ====================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CheckoutItemDto {
  @ApiProperty({
    description: 'Variant ID ของสินค้า',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    description: 'จำนวนที่สั่งซื้อ (ขั้นต่ำ 1)',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

export class CalculateCheckoutDto {
  @ApiProperty({
    description: 'รายการสินค้าในตะกร้าที่จะชำระเงิน',
    type: [CheckoutItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiPropertyOptional({
    description: 'รหัสคูปองส่วนลด (ถ้ามี)',
    example: 'WELCOME10',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'User ID ของผู้สั่งซื้อ (ถ้าล็อกอินอยู่)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
