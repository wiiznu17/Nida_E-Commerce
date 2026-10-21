import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import type { CreateAddressDto as ICreateAddressDto } from '@repo/types';

export class CreateAddressDto implements ICreateAddressDto {
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

  @ApiPropertyOptional({
    description: 'ตั้งเป็นที่อยู่จัดส่งเริ่มต้นหรือไม่',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
