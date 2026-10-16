import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TrackOrderQueryDto {
  @ApiProperty({
    description: 'หมายเลขคำสั่งซื้อ หรือ Tracking Number',
    example: 'NIDA-20261016-KZNO',
  })
  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @ApiPropertyOptional({
    description: 'เบอร์โทรศัพท์ผู้รับ (ทางเลือกสำหรับการยืนยัน)',
    example: '0812345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
