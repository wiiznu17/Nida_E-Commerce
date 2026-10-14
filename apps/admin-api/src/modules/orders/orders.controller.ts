import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderStatus } from '@repo/database';
import { AdminPermission } from '@repo/types';
import { RequirePermissions } from '../auth/decorators/index.js';

@ApiTags('Orders & Shipments')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'สร้างคำสั่งซื้อใหม่ (Place Order / Checkout)',
    description:
      'ตรวจสอบสินค้า สต็อก คูปอง คำนวณยอดเงิน ตัดสต็อกสินค้าจริง และบันทึกประวัติการสั่งซื้อแบบ Transactional',
  })
  @ApiResponse({ status: 201, description: 'สร้างคำสั่งซื้อสำเร็จ' })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลไม่ถูกต้อง หรือสินค้าในสต็อกไม่เพียงพอ',
  })
  @ApiResponse({ status: 404, description: 'ไม่พบสินค้าบางรายการ' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('orders')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'ดูรายการคำสั่งซื้อทั้งหมด (Get All Orders)',
    description: 'ดึงรายการคำสั่งซื้อทั้งหมดสำหรับแอดมินและประวัติคำสั่งซื้อ',
  })
  @ApiResponse({ status: 200, description: 'รายการคำสั่งซื้อทั้งหมด' })
  async getOrders() {
    return this.ordersService.getOrders();
  }

  @Get('orders/:orderNumber')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'ดูรายละเอียดคำสั่งซื้อตาม Order Number',
    description:
      'ดึงข้อมูลสินค้า ที่อยู่จัดส่ง สถานะการชำระเงิน และรายการพัสดุจัดส่ง',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'หมายเลขคำสั่งซื้อ เช่น NIDA-20260920-ABCD',
  })
  @ApiResponse({ status: 200, description: 'ข้อมูลคำสั่งซื้อ' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }

  @Patch('orders/:id/status')
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
  @ApiOperation({
    summary: 'อัปเดตสถานะคำสั่งซื้อ (Update Order Status)',
    description: 'เปลี่ยนสถานะของคำสั่งซื้อ เช่น PAID, SHIPPED, DELIVERED หรือ CANCELLED',
  })
  @ApiParam({ name: 'id', description: 'Order ID หรือ Order Number' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; courierName?: string; trackingNumber?: string },
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      body.status,
      body.courierName,
      body.trackingNumber,
    );
  }

  @Get('shipments/track/:trackingNumber')
  @ApiOperation({
    summary: 'ติดตามสถานะพัสดุ (Customer Shipment Tracking)',
    description:
      'ตรวจสอบสถานะการจัดส่ง ไทม์ไลน์การเดินทางของพัสดุ (Shipment Logs) ตามเลขพัสดุ หรือหมายเลขคำสั่งซื้อ',
  })
  @ApiParam({
    name: 'trackingNumber',
    description: 'เลข Tracking Number (เช่น TH12345678) หรือหมายเลขคำสั่งซื้อ',
  })
  @ApiResponse({ status: 200, description: 'ข้อมูลสถานะและไทม์ไลน์การจัดส่ง' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลการจัดส่ง' })
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.ordersService.trackShipment(trackingNumber);
  }
}
