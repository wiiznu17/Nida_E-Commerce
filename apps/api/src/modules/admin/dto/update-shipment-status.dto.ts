
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ShipmentStatus } from '@repo/types';

export class UpdateShipmentStatusDto {
  @ApiProperty({
    description: 'สถานะการจัดส่งใหม่',
    enum: ShipmentStatus,
    example: ShipmentStatus.IN_TRANSIT,
  })
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @ApiProperty({
    description: 'หัวข้อสถานะสำหรับแสดงใน Timeline ของลูกค้า',
    example: 'พัสดุอยู่ระหว่างการขนส่งไปยังศูนย์กระจายสินค้าปลายทาง',
  })
  @IsString()
  @IsNotEmpty()
  statusTitle!: string;

  @ApiPropertyOptional({
    description: 'รายละเอียดเพิ่มเติม',
    example: 'พัสดุออกจากศูนย์คัดแยกสินค้าหลัก',
  })
  @IsOptional()
  @IsString()
  statusDescription?: string;

  @ApiPropertyOptional({
    description: 'พิกัดหรือสถานที่ ณ เวลาที่บันทึก',
    example: 'ศูนย์คัดแยกสินค้าหลัก (บางนา)',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
