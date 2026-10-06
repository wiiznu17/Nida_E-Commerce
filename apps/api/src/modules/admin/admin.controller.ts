import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { RestockInventoryDto } from './dto/restock-inventory.dto.js';
import { FulfillOrderDto } from './dto/fulfill-order.dto.js';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto.js';
import { Department } from '@repo/types';

@ApiTags('Admin Back-Office')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('inventory')
  @ApiOperation({
    summary: 'ดูรายการสต็อกสินค้าคงคลังทั้งหมด (Inventory List)',
    description:
      'ดึงข้อมูลจำนวนสินค้าพร้อมขาย, ยอดจอง, ยอดพรีออเดอร์ และแจ้งเตือนสต็อกใกล้หมด',
  })
  @ApiQuery({ name: 'department', enum: Department, required: false })
  @ApiQuery({ name: 'lowStockOnly', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'รายการสต็อกสินค้า' })
  async getInventory(
    @Query('department') department?: Department,
    @Query('lowStockOnly') lowStockOnly?: boolean,
  ) {
    return this.adminService.getInventory(
      department,
      String(lowStockOnly) === 'true',
    );
  }

  @Post('inventory/restock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'เติมสต็อกสินค้าเข้าคลัง (Restock Inventory)',
    description:
      'เพิ่มจำนวนสินค้าในคลัง พร้อมบันทึก StockMovement Audit Trail อัตโนมัติ',
  })
  @ApiResponse({ status: 200, description: 'เติมสต็อกสินค้าสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบสินค้า Variant ที่ระบุ' })
  async restock(@Body() dto: RestockInventoryDto) {
    return this.adminService.restock(dto);
  }

  @Post('orders/:identifier/fulfill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'แอดมินยืนยันจัดส่งสินค้า (Fulfill Order)',
    description:
      'สร้างรายการพัสดุ (Shipment), สร้างหมายเลขติดตามพัสดุ (Tracking Number), เปลี่ยนสถานะ Order เป็น SHIPPED',
  })
  @ApiParam({
    name: 'identifier',
    description: 'Order ID หรือ Order Number (เช่น NIDA-20260920-ABCD)',
  })
  @ApiResponse({ status: 200, description: 'ยืนยันจัดส่งสินค้าสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  async fulfillOrder(
    @Param('identifier') identifier: string,
    @Body() dto: FulfillOrderDto,
  ) {
    return this.adminService.fulfillOrder(identifier, dto);
  }

  @Post('shipments/:shipmentId/update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'อัปเดตสถานะการจัดส่งพัสดุ (Update Shipment Status)',
    description:
      'บันทึกไทม์ไลน์การจัดส่งพัสดุ (เช่น กำลังนำส่ง, ส่งมอบสำเร็จ) หากสถานะเป็น DELIVERED จะอัปเดตสถานะ Order เป็น DELIVERED ทันที',
  })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'อัปเดตสถานะพัสดุสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลการจัดส่ง' })
  async updateShipmentStatus(
    @Param('shipmentId') shipmentId: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.adminService.updateShipmentStatus(shipmentId, dto);
  }
}
