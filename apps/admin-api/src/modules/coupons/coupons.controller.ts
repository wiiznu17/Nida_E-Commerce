import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CouponsService } from './coupons.service.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';
import { CalculateCheckoutDto } from './dto/calculate-checkout.dto.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { RequirePermissions } from '../auth/decorators/index.js';
import { AdminPermission } from '@repo/types';

@ApiTags('Coupons & Checkout')
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('coupons')
  @RequirePermissions(AdminPermission.COUPONS_READ)
  @ApiOperation({
    summary: 'ดึงรายการคูปองส่วนลดทั้งหมดสำหรับจัดการหลังบ้าน',
    description: 'ส่งคืนรายการคูปองโปรโมชันทั้งหมดพร้อมสถิติการใช้งาน',
  })
  @ApiResponse({ status: 200, description: 'รายการคูปองทั้งหมด' })
  async getAllCoupons() {
    return this.couponsService.getAllCoupons();
  }

  @Post('coupons')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'สร้างคูปองส่วนลดใหม่',
    description:
      'เพิ่มคูปองโปรโมชันใหม่เข้าสู่ระบบ พร้อมกำหนดเงื่อนไขส่วนลดและสิทธิ์การใช้งาน',
  })
  @ApiResponse({ status: 201, description: 'สร้างคูปองสำเร็จ' })
  @ApiResponse({ status: 409, description: 'รหัสคูปองซ้ำในระบบ' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }

  @Patch('coupons/:identifier/toggle')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @ApiOperation({
    summary: 'เปิด/ปิดการใช้งานคูปองส่วนลด',
    description: 'สลับสถานะ isActive ของคูปองโดยระบุ ID หรือ Code',
  })
  @ApiParam({ name: 'identifier', description: 'Coupon ID หรือ Coupon Code' })
  @ApiResponse({ status: 200, description: 'อัปเดตสถานะคูปองสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบคูปองที่ระบุ' })
  async toggleCoupon(@Param('identifier') identifier: string) {
    return this.couponsService.toggleCoupon(identifier);
  }

  @Delete('coupons/:identifier')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @ApiOperation({
    summary: 'ลบคูปองส่วนลดออกจากระบบ',
    description: 'ลบคูปองโปรโมชันถาวรโดยระบุ ID หรือ Code',
  })
  @ApiParam({ name: 'identifier', description: 'Coupon ID หรือ Coupon Code' })
  @ApiResponse({ status: 200, description: 'ลบคูปองสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบคูปองที่ระบุ' })
  async deleteCoupon(@Param('identifier') identifier: string) {
    return this.couponsService.deleteCoupon(identifier);
  }

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
