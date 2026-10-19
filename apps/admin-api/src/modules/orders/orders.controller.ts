import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto.js';
import { CarrierBookingDto } from './dto/carrier-booking.dto.js';
import { TrackOrderQueryDto } from './dto/track-order.dto.js';
import {
  ProcessRefundRequestDto,
  ReviewCancellationDto,
  ReviewReturnDto,
} from './dto/refund-and-requests.dto.js';
import { OrderStatus } from '@repo/database';
import {
  AdminPermission,
  CancellationRequestStatus,
  ReturnStatus,
  type ApiAdminUser,
} from '@repo/types';
import { RequirePermissions, Public, CurrentAdmin } from '../auth/decorators/index.js';

import { LogisticsService } from './logistics/index.js';
import { PaymentGatewayService } from './payment-gateway/index.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  adminOrderQuerySchema,
  adminCancellationQuerySchema,
  adminReturnQuerySchema,
  type AdminOrderQueryInput,
  type AdminCancellationQueryInput,
  type AdminReturnQueryInput,
} from '@repo/validators';

@ApiTags('Orders & Shipments')
@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly logisticsService: LogisticsService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

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
    description: 'ดึงรายการคำสั่งซื้อทั้งหมดสำหรับแอดมินพร้อมรองรับการค้นหา กรองสถานะ และแบ่งหน้า',
  })
  @ApiResponse({ status: 200, description: 'รายการคำสั่งซื้อและข้อมูลการแบ่งหน้า' })
  async getOrders(
    @Query(new ZodValidationPipe(adminOrderQuerySchema))
    query: AdminOrderQueryInput,
  ) {
    return this.ordersService.getOrders(query);
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
    description:
      'เปลี่ยนสถานะของคำสั่งซื้อ เช่น PAID, SHIPPED, DELIVERED หรือ CANCELLED',
  })
  @ApiParam({ name: 'id', description: 'Order ID หรือ Order Number' })
  @ApiResponse({ status: 200, description: 'อัปเดตสถานะคำสั่งซื้อสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      body.status,
      body.courierName,
      body.trackingNumber,
      body.transactionReference,
      body.overrideReason,
    );
  }


  @Post('orders/:id/carrier-booking')
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
  @ApiOperation({
    summary: 'จองเลขพัสดุผ่านระบบขนส่งอัตโนมัติ (Carrier API Booking)',
    description:
      'จำลองการยิง API ไปยังระบบขนส่ง (Kerry / Flash / ไปรษณีย์ไทย / DHL) เพื่อจอง Tracking Number สร้าง Shipment และปรับสถานะออเดอร์เป็น SHIPPED',
  })
  @ApiParam({ name: 'id', description: 'Order ID หรือ Order Number' })
  @ApiResponse({
    status: 200,
    description: 'จองเลขพัสดุสำเร็จ พร้อมอัปเดตข้อมูลการจัดส่ง',
  })
  async bookCarrierShipment(
    @Param('id') id: string,
    @Body() dto: CarrierBookingDto,
  ) {
    return this.ordersService.fulfillWithCarrier(id, dto.carrierCode);
  }

  @Public()
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

  @Public()
  @Get('orders/track/:orderNumber')
  @ApiOperation({
    summary: 'ติดตามสถานะคำสั่งซื้อและพัสดุตามเลขที่ออเดอร์',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'หมายเลขคำสั่งซื้อ (เช่น NIDA-20261016-KZNO)',
  })
  async trackOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.trackShipment(orderNumber);
  }

  @Public()
  @Post('orders/track')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ติดตามสถานะคำสั่งซื้อแบบ Query (Guest Order Tracking)',
  })
  async trackOrderByPost(@Body() dto: TrackOrderQueryDto) {
    return this.ordersService.trackShipment(dto.orderNumber);
  }

  @Post('orders/:id/refund')
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
  @ApiOperation({
    summary: 'ดำเนินการคืนเงินคำสั่งซื้อ (Process Order Refund)',
    description:
      'ยิงคำขอคืนเงินไปยัง Payment Gateway (Omise), ปรับสถานะธุรกรรม, และดึงสต็อกกลับเข้าคลัง',
  })
  @ApiParam({ name: 'id', description: 'Order ID หรือ Order Number' })
  @ApiResponse({ status: 200, description: 'ดำเนินการคืนเงินสำเร็จ' })
  async processRefund(
    @Param('id') id: string,
    @Body() dto: ProcessRefundRequestDto,
    @CurrentAdmin() admin?: ApiAdminUser,
  ) {
    return this.ordersService.processRefund(id, dto, admin?.id);
  }

  @Get('cancellation-requests')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'ดูรายการคำขอยกเลิกคำสั่งซื้อทั้งหมด (Get Cancellation Requests)',
  })
  async getCancellationRequests(
    @Query(new ZodValidationPipe(adminCancellationQuerySchema))
    query: AdminCancellationQueryInput,
  ) {
    return this.ordersService.getCancellationRequests(query);
  }

  @Post('cancellation-requests/:id/review')
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
  @ApiOperation({
    summary: 'พิจารณาคำขอยกเลิกคำสั่งซื้อ (Review Cancellation Request)',
  })
  @ApiParam({ name: 'id', description: 'Cancellation Request ID' })
  async reviewCancellationRequest(
    @Param('id') id: string,
    @Body() dto: ReviewCancellationDto,
    @CurrentAdmin() admin?: ApiAdminUser,
  ) {
    return this.ordersService.reviewCancellationRequest(id, dto, admin?.id);
  }

  @Get('return-requests')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'ดูรายการคำขอคืนสินค้าทั้งหมด (Get Return Requests)',
  })
  async getReturnRequests(
    @Query(new ZodValidationPipe(adminReturnQuerySchema))
    query: AdminReturnQueryInput,
  ) {
    return this.ordersService.getReturnRequests(query);
  }

  @Post('return-requests/:id/review')
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
  @ApiOperation({
    summary: 'พิจารณาหรือจัดการคำขอคืนสินค้า (Review Return Request)',
  })
  @ApiParam({ name: 'id', description: 'Return Request ID' })
  async reviewReturnRequest(
    @Param('id') id: string,
    @Body() dto: ReviewReturnDto,
    @CurrentAdmin() admin?: ApiAdminUser,
  ) {
    return this.ordersService.reviewReturnRequest(id, dto, admin?.id);
  }


  @Public()
  @Post('webhooks/shippop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'รับสถานะ Real-time จากขนส่งผ่าน SHIPPOP Webhook',
    description:
      'รับสถานะพัสดุจาก SHIPPOP พร้อมตรวจสอบ Deduplication Key และบันทึกลง shipment_logs',
  })
  async handleShippopWebhook(
    @Body() payload: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.logisticsService.handleWebhook(payload, headers);
  }

  @Public()
  @Post('webhooks/omise')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'รับผลการชำระเงินจาก Omise Webhook',
    description:
      'รับเหตุการณ์ charge.complete จาก Omise พร้อมตรวจสอบ Event Deduplication และอัปเดตสถานะออเดอร์',
  })
  async handleOmiseWebhook(
    @Body() payload: unknown,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.paymentGatewayService.handleWebhook(payload, headers);
  }
}

