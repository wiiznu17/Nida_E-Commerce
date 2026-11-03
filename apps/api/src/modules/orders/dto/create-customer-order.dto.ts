import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  PaymentMethod,
  TaxInvoicePayerType,
  TaxInvoiceBranchType,
} from '@repo/types';

export class CustomerTaxInvoiceRequestDto {
  @ApiProperty({
    description:
      'ประเภทผู้เสียภาษี (PERSONAL = บุคคลธรรมดา, COMPANY = นิติบุคคล)',
    enum: TaxInvoicePayerType,
    example: TaxInvoicePayerType.PERSONAL,
  })
  @IsEnum(TaxInvoicePayerType)
  payerType!: TaxInvoicePayerType;

  @ApiProperty({
    description: 'เลขประจำตัวผู้เสียภาษี 13 หลัก หรือเลขบัตรประชาชน',
    example: '1100400123456',
  })
  @IsString()
  @IsNotEmpty()
  taxId!: string;

  @ApiProperty({
    description: 'ชื่อบุคคลธรรมดา หรือ ชื่อบริษัท/นิติบุคคล',
    example: 'บริษัท ตัวอย่าง จำกัด',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'ประเภทสาขา (HEADQUARTERS = สำนักงานใหญ่, BRANCH = สาขา)',
    enum: TaxInvoiceBranchType,
  })
  @IsOptional()
  @IsEnum(TaxInvoiceBranchType)
  branchType?: TaxInvoiceBranchType;

  @ApiPropertyOptional({
    description: 'รหัสสาขา 5 หลัก เช่น 00000 หรือ 00001',
    example: '00000',
  })
  @IsOptional()
  @IsString()
  branchCode?: string;

  @ApiProperty({
    description: 'ที่อยู่จดทะเบียน หรือที่อยู่ตามบัตรประชาชน',
    example: '123/45 ถนนสุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;
}

export class CustomerOrderItemDto {
  @ApiProperty({
    description: 'Variant ID ของสินค้า',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  variantId!: string;

  @ApiProperty({
    description: 'จำนวนที่ต้องการสั่งซื้อ',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'ราคาต่อหน่วยที่ลูกค้าเห็นในตะกร้า (ใช้ตรวจสอบ Price Drift)',
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  expectedPrice?: number;
}

export class CustomerShippingAddressDto {
  @ApiProperty({
    description: 'ชื่อ-นามสกุล ผู้รับ',
    example: 'พิมพิศา วงศ์สวรรค์',
  })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiProperty({ description: 'เบอร์โทรศัพท์ติดต่อ', example: '0891234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({
    description: 'ที่อยู่บรรทัดที่ 1 (บ้านเลขที่, ถนน)',
    example: '123/45 ถนนสุขุมวิท 55',
  })
  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @ApiPropertyOptional({
    description: 'ที่อยู่บรรทัดที่ 2 (อาคาร, ชั้น, หมู่บ้าน)',
    example: 'อาคาร A ชั้น 12 ห้อง 1204',
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ description: 'ตำบล / แขวง', example: 'คลองตันเหนือ' })
  @IsString()
  @IsNotEmpty()
  subdistrict!: string;

  @ApiProperty({ description: 'อำเภอ / เขต', example: 'วัฒนา' })
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

export class CreateCustomerOrderDto {
  @ApiProperty({
    description: 'รายการสินค้าที่สั่งซื้อ',
    type: [CustomerOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomerOrderItemDto)
  items!: CustomerOrderItemDto[];

  @ApiProperty({
    description: 'ที่อยู่สำหรับจัดส่งสินค้า',
    type: CustomerShippingAddressDto,
  })
  @ValidateNested()
  @Type(() => CustomerShippingAddressDto)
  shippingAddress!: CustomerShippingAddressDto;

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
    description: 'อีเมลลูกค้าสำหรับจัดส่งใบเสร็จและติดตามสถานะ',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'ข้อมูลสำหรับขอใบเสร็จรับเงิน/ใบกำกับภาษีเต็มรูป (ม.86/4)',
    type: CustomerTaxInvoiceRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerTaxInvoiceRequestDto)
  taxInvoice?: CustomerTaxInvoiceRequestDto;
}
