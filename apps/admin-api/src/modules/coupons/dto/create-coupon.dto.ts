import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DiscountType } from '@repo/types';

export class CreateCouponDto {
  @ApiProperty({
    description: 'รหัสคูปองส่วนลด เช่น NIDA20, WELCOME50',
    example: 'NIDA20',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  code!: string;

  @ApiProperty({
    description: 'ประเภทของส่วนลด (PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING)',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({
    description: 'มูลค่าส่วนลด (เช่น 20 สำหรับ 20%, หรือ 50 สำหรับ $50)',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountValue!: number;

  @ApiPropertyOptional({
    description: 'ยอดสั่งซื้อขั้นต่ำในการใช้คูปอง',
    example: 100,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'เพดานส่วนลดสูงสุด (เฉพาะประเภท PERCENTAGE)',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'จำนวนสิทธิ์การใช้งานทั้งหมด',
    example: 500,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalUsageLimit?: number;

  @ApiPropertyOptional({
    description: 'จำนวนสิทธิ์ต่อผู้ใช้งานหนึ่งคน',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  userUsageLimit?: number;

  @ApiPropertyOptional({
    description: 'วันและเวลาที่เริ่มเปิดใช้งาน',
    example: '2026-09-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({
    description: 'วันและเวลาที่หมดอายุคูปอง',
    example: '2026-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsNotEmpty()
  expiresAt!: string;

  @ApiPropertyOptional({
    description: 'สถานะเปิดใช้งานคูปอง',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
