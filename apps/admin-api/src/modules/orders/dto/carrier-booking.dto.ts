import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { CarrierCode } from '@repo/types';

export const SUPPORTED_CARRIER_CODES: CarrierCode[] = [
  'KERRY_EXPRESS',
  'FLASH_EXPRESS',
  'THAILAND_POST_EMS',
  'DHL_EXPRESS',
];

export class CarrierBookingDto {
  @ApiProperty({
    description: 'รหัสผู้ให้บริการขนส่งที่ต้องการจองเลขพัสดุ',
    enum: [
      'KERRY_EXPRESS',
      'FLASH_EXPRESS',
      'THAILAND_POST_EMS',
      'DHL_EXPRESS',
    ],
    example: 'FLASH_EXPRESS',
  })
  @IsIn(SUPPORTED_CARRIER_CODES, {
    message:
      'carrierCode must be one of: KERRY_EXPRESS, FLASH_EXPRESS, THAILAND_POST_EMS, DHL_EXPRESS',
  })
  carrierCode!: CarrierCode;
}
