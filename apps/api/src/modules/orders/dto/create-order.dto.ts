
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaymentMethod } from '@repo/types';

export class OrderItemInputDto {
  @ApiProperty({
    description: 'Variant ID ของสินค้า',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    description: 'จำนวนที่ต้องการสั่งซื้อ (ขั้นต่ำ 1)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

export class ShippingAddressDto {
  @ApiProperty({ description: 'ชื่อ-นามสกุล ผู้รับ', example: 'สมชาย ใจดี' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiProperty({ description: 'เบอร์โทรศัพท์ติดต่อ', example: '0812345678' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({
    description: 'ที่อยู่บรรทัดที่ 1 (บ้านเลขที่, ถนน)',
    example: '123/45 ถนนสุขุมวิท',
  })
  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @ApiPropertyOptional({
    description: 'ที่อยู่บรรทัดที่ 2 (อาคาร, ชั้น, หมู่บ้าน)',
    example: 'อาคาร A ชั้น 5',
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ description: 'ตำบล / แขวง', example: 'คลองเตย' })
  @IsString()
  @IsNotEmpty()
  subdistrict!: string;

  @ApiProperty({ description: 'อำเภอ / เขต', example: 'คลองเตย' })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ description: 'จังหวัด', example: 'กรุงเทพมหานคร' })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiProperty({ description: 'รหัสไปรษณีย์', example: '10110' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'รายการสินค้าที่สั่งซื้อ',
    type: [OrderItemInputDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];

  @ApiProperty({
    description: 'ที่อยู่สำหรับจัดส่งสินค้า',
    type: ShippingAddressDto,
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @ApiProperty({
    description: 'ช่องทางการชำระเงิน',
    enum: PaymentMethod,
    example: PaymentMethod.PROMPTPAY,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'รหัสคูปองส่วนลด',
    example: 'WELCOME10',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'User ID ผู้สั่งซื้อ (ถ้าเป็นสมาชิก)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
