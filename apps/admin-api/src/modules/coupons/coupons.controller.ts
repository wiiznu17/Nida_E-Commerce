import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CouponsService } from './coupons.service.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';
import { CalculateCheckoutDto } from './dto/calculate-checkout.dto.js';

@ApiTags('Coupons & Checkout')
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('coupons/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ตรวจสอบความถูกต้องของรหัสคูปองส่วนลด',
    description:
      'เช็คสถานะ วันหมดอายุ สิทธิ์การใช้งาน และยอดสั่งซื้อขั้นต่ำ พร้อมคำนวณส่วนลดที่จะได้รับ',
  })
  @ApiResponse({ status: 200, description: 'ผลการตรวจสอบคูปอง' })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(dto);
  }

  @Post('checkout/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'คำนวณยอดชำระเงินก่อนสั่งซื้อ (Checkout Calculation)',
    description:
      'คำนวณยอดรวม ราคาสินค้า ค่าจัดส่ง ส่วนลดคูปอง (ถ้ามี) การปันส่วนลด และภาษีมูลค่าเพิ่ม',
  })
  @ApiResponse({ status: 200, description: 'รายละเอียดสรุปยอดคำนวณ Checkout' })
  async calculateCheckout(@Body() dto: CalculateCheckoutDto) {
    return this.couponsService.calculateCheckout(dto);
  }
}
