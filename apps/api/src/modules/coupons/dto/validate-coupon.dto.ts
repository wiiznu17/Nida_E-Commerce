// ====================================================
// ValidateCouponDto — DTO ตรวจสอบความถูกต้องของคูปอง
// ====================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ValidateCouponDto {
  @ApiProperty({
    description: 'รหัสคูปองส่วนลด',
    example: 'WELCOME10',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  code!: string;

  @ApiProperty({
    description: 'ยอดสั่งซื้อรวม (subtotal) ก่อนหักส่วนลด',
    example: 1500,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderAmount!: number;

  @ApiPropertyOptional({
    description: 'User ID ของผู้ใช้ (เพื่อเช็ค quota การใช้ต่อคน)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
