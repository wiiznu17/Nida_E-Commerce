// ====================================================
// FulfillOrderDto — DTO สำหรับแอดมินยืนยันจัดส่งสินค้า
// ====================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class FulfillOrderDto {
  @ApiProperty({
    description:
      'ชื่อผู้ให้บริการขนส่ง เช่น Flash Express, Kerry, Thailand Post, DHL',
    example: 'Flash Express',
  })
  @IsString()
  @IsNotEmpty()
  courierName!: string;

  @ApiProperty({
    description: 'หมายเลขติดตามพัสดุ (Tracking Number)',
    example: 'TH0123456789A',
  })
  @IsString()
  @IsNotEmpty()
  trackingNumber!: string;

  @ApiPropertyOptional({
    description: 'วัน-เวลาที่คาดว่าจะจัดส่งถึงลูกค้า (ISO Date)',
    example: '2026-09-23T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiPropertyOptional({
    description: 'ข้อความบันทึกเริ่มต้นสำหรับไทม์ไลน์พัสดุ',
    example: 'พัสดุได้รับการบรรจุและส่งมอบให้ผู้ให้บริการขนส่งแล้ว',
  })
  @IsOptional()
  @IsString()
  initialStatusTitle?: string;

  @ApiPropertyOptional({
    description: 'Admin ID ของเจ้าหน้าที่ผู้กดยืนยันจัดส่ง',
    example: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @IsOptional()
  @IsUUID()
  adminId?: string;
}
