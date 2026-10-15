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
import { AdminPermission, Department, type ApiAdminUser } from '@repo/types';
import { CurrentAdmin, RequirePermissions } from '../auth/decorators/index.js';

@ApiTags('Admin Back-Office')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'ดูรายการคำสั่งซื้อของแอดมินทั้งหมด (Admin Orders)',
    description:
      'ดึงรายการคำสั่งซื้อทั้งหมดพร้อมรายการสินค้าและข้อมูลการจัดส่ง',
  })
  @ApiResponse({ status: 200, description: 'รายการคำสั่งซื้อทั้งหมด' })
  async getOrders() {
    return this.adminService.getOrders();
  }

  @Get('inventory')
  @RequirePermissions(AdminPermission.INVENTORY_READ)
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

  @Get('inventory/movements')
  @RequirePermissions(AdminPermission.INVENTORY_READ)
  @ApiOperation({
    summary: 'ดูประวัติการเคลื่อนไหวของสต็อก (Stock Movement History)',
    description:
      'ดึงรายการ Audit Log การเติมสต็อก ปรับยอดสต็อก และตัดสต็อกสินค้า',
  })
  @ApiResponse({
    status: 200,
    description: 'รายการประวัติการเคลื่อนไหวของสต็อก',
  })
  async getStockMovements() {
    return this.adminService.getStockMovements();
  }

  @Post(['inventory/restock', 'inventory/adjust'])
  @RequirePermissions(AdminPermission.INVENTORY_ADJUST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ปรับปรุงสต็อกสินค้าเข้า/ออกคลัง (Restock / Adjust Inventory)',
    description:
      'ปรับจำนวนสต็อกสินค้าในคลัง (บวก/ลบ) พร้อมบันทึก StockMovement Audit Trail อัตโนมัติ',
  })
  @ApiResponse({ status: 200, description: 'ปรับสต็อกสินค้าสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบสินค้า Variant ที่ระบุ' })
  async restock(
    @Body() dto: RestockInventoryDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.adminService.restock({
      ...dto,
      adminId: admin?.id ?? dto.adminId,
    });
  }

  @Post('orders/:identifier/fulfill')
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
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
  @RequirePermissions(AdminPermission.ORDERS_FULFILL)
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
