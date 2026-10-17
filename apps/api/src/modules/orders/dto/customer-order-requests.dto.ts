import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  CreateCancellationRequestDto,
  CreateReturnRequestDto,
} from '@repo/types';

export class CustomerCreateCancellationDto
  implements CreateCancellationRequestDto
{
  @ApiProperty({
    description: 'เหตุผลในการขอยกเลิกคำสั่งซื้อ',
    example: 'สั่งสินค้าผิดสี/ไซส์',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({
    description: 'รายละเอียดเพิ่มเติมจากลูกค้า',
    example: 'ต้องการเปลี่ยนเป็นสีดำ ไซส์ M แทนค่ะ',
  })
  @IsOptional()
  @IsString()
  customerNote?: string;
}

export class CustomerReturnItemDto {
  @ApiProperty({
    description: 'ID ของ OrderItem ในคำสั่งซื้อนี้',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID()
  orderItemId!: string;

  @ApiProperty({
    description: 'จำนวนชิ้นที่ต้องการส่งคืน',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

export class CustomerCreateReturnDto implements CreateReturnRequestDto {
  @ApiProperty({
    description: 'เหตุผลในการขอคืนสินค้า',
    example: 'สินค้าชำรุด มีตำหนิ',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({
    description: 'รายละเอียดเพิ่มเติมจากลูกค้า',
    example: 'กระดุมหลุดตั้งแต่เปิดห่อพัสดุ',
  })
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiProperty({
    description: 'รายการสินค้าและจำนวนที่ต้องการส่งคืน',
    type: [CustomerReturnItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomerReturnItemDto)
  items!: CustomerReturnItemDto[];
}
