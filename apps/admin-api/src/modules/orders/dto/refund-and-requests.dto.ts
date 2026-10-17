import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessRefundRequestDto {
  @ApiPropertyOptional({
    description: 'ยอดเงินที่ต้องการคืน (หากไม่ระบุจะคืนตามยอดคงเหลือสูงสุด)',
    example: 2500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty({
    description: 'เหตุผลในการคืนเงิน',
    example: 'ลูกค้ายกเลิกคำสั่งซื้อก่อนจัดส่ง',
  })
  @IsString()
  @MinLength(3)
  reason!: string;

  @ApiPropertyOptional({
    description: 'นำสินค้ากลับเข้าสต็อกหรือไม่',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  restockInventory?: boolean = true;
}

export class ReviewCancellationDto {
  @ApiProperty({
    description: 'ผลการพิจารณาคำขอยกเลิก (APPROVE หรือ REJECT)',
    enum: ['APPROVE', 'REJECT'],
  })
  @IsEnum(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({
    description: 'หมายเหตุการพิจารณาของแอดมิน',
    example: 'อนุมัติยกเลิกและคืนเงินผ่านระบบเรียบร้อย',
  })
  @IsOptional()
  @IsString()
  adminNote?: string;

  @ApiPropertyOptional({
    description: 'นำสินค้ากลับเข้าสต็อกหรือไม่เมื่ออนุมัติ',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  restockInventory?: boolean = true;
}

export class ReviewReturnDto {
  @ApiProperty({
    description: 'ขั้นตอนการจัดการคำขอคืนสินค้า (APPROVE, REJECT หรือ COMPLETE)',
    enum: ['APPROVE', 'REJECT', 'COMPLETE'],
  })
  @IsEnum(['APPROVE', 'REJECT', 'COMPLETE'])
  action!: 'APPROVE' | 'REJECT' | 'COMPLETE';

  @ApiPropertyOptional({
    description: 'หมายเหตุการพิจารณาของแอดมิน',
  })
  @IsOptional()
  @IsString()
  adminNote?: string;

  @ApiPropertyOptional({
    description: 'นำสินค้ากลับเข้าสต็อกหรือไม่เมื่อจบกระบวนการคืน',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  restockInventory?: boolean = true;

  @ApiPropertyOptional({
    description: 'ยอดเงินคืนที่ระบุ (กรณี Complete)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  refundAmount?: number;
}
