import {
  Controller,
  Get,
  Header,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminPermission } from '@repo/types';
import {
  analyticsCouponRoiSchema,
  analyticsDeptSchema,
  analyticsOverviewSchema,
  analyticsRevenueTrendSchema,
  analyticsSlowMovingSchema,
  analyticsTopProductsSchema,
  exportAuditLogsSchema,
  exportInventorySchema,
  exportOrdersSchema,
  exportProductsSchema,
  type AnalyticsCouponRoiQuery,
  type AnalyticsDeptQuery,
  type AnalyticsOverviewQuery,
  type AnalyticsRevenueTrendQuery,
  type AnalyticsSlowMovingQuery,
  type AnalyticsTopProductsQuery,
  type ExportAuditLogsQuery,
  type ExportInventoryQuery,
  type ExportOrdersQuery,
  type ExportProductsQuery,
} from '@repo/validators';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import { RequirePermissions } from '../auth/decorators/index.js';
import { AnalyticsService } from './analytics.service.js';

@ApiTags('Analytics & Data Export')
@Controller(['admin/analytics', 'analytics'])
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'แดชบอร์ดภาพรวมสถิติ (Analytics Overview)',
    description:
      'ดึงยอดขายรวม, จำนวนออเดอร์, AOV, อัตราจัดส่งสำเร็จ, สัดส่วนลูกค้าเก่า/ใหม่ พร้อมอัตราเติบโตเทียบรอบก่อนหน้า',
  })
  @ApiResponse({ status: 200, description: 'ข้อมูลภาพรวมสถิติ' })
  async getOverview(
    @Query(new ZodValidationPipe(analyticsOverviewSchema))
    query: AnalyticsOverviewQuery,
  ) {
    return this.analyticsService.getOverview(query);
  }

  @Get('sales-by-department')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'สัดส่วนยอดขายตามแผนก (Sales by Department)',
    description:
      'สัดส่วนรายได้และจำนวนชิ้นที่ขายได้ของ Women, Men, Kids, Bags, Shoes, Home',
  })
  @ApiResponse({ status: 200, description: 'สัดส่วนยอดขายตามแผนก' })
  async getSalesByDepartment(
    @Query(new ZodValidationPipe(analyticsDeptSchema))
    query: AnalyticsDeptQuery,
  ) {
    return this.analyticsService.getSalesByDepartment(query);
  }

  @Get('revenue-trend')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'แนวโน้มรายได้ตามช่วงเวลา (Revenue Trend)',
    description: 'ดึงจุดพิกัดรายได้และจำนวนคำสั่งซื้อรายวัน/รายเดือนสำหรับกราฟเส้น',
  })
  @ApiResponse({ status: 200, description: 'ชุดข้อมูลแนวโน้มรายได้' })
  async getRevenueTrend(
    @Query(new ZodValidationPipe(analyticsRevenueTrendSchema))
    query: AnalyticsRevenueTrendQuery,
  ) {
    return this.analyticsService.getRevenueTrend(query);
  }

  @Get('top-products')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @ApiOperation({
    summary: 'สินค้าขายดีที่สุด (Top Products)',
    description: 'จัดอันดับสินค้าขายดีที่สุดตามรายได้และยอดขายตามช่วงเวลา',
  })
  @ApiResponse({ status: 200, description: 'รายการสินค้าขายดี' })
  async getTopProducts(
    @Query(new ZodValidationPipe(analyticsTopProductsSchema))
    query: AnalyticsTopProductsQuery,
  ) {
    return this.analyticsService.getTopProducts(query);
  }

  @Get('slow-moving-products')
  @RequirePermissions(AdminPermission.INVENTORY_READ)
  @ApiOperation({
    summary: 'สินค้าค้างสต็อก ยอดขายช้า (Slow Moving Products)',
    description:
      'รายการสินค้าที่มีสต็อกแต่ไม่มีการขายในช่วงระยะเวลาที่กำหนด เพื่อวางแผนแคมเปญ',
  })
  @ApiResponse({ status: 200, description: 'รายการสินค้าค้างสต็อก' })
  async getSlowMovingProducts(
    @Query(new ZodValidationPipe(analyticsSlowMovingSchema))
    query: AnalyticsSlowMovingQuery,
  ) {
    return this.analyticsService.getSlowMovingProducts(query);
  }

  @Get('coupon-roi')
  @RequirePermissions(AdminPermission.COUPONS_READ)
  @ApiOperation({
    summary: 'ผลตอบแทนจากการใช้คูปองส่วนลด (Coupon ROI)',
    description:
      'วิเคราะห์จำนวนครั้งการใช้งาน มูลค่าส่วนลดรวม ยอดขายที่เกิดขึ้นจริง และ % ROI ต่อคูปอง',
  })
  @ApiResponse({ status: 200, description: 'รายงาน ROI ของคูปอง' })
  async getCouponRoi(
    @Query(new ZodValidationPipe(analyticsCouponRoiSchema))
    query: AnalyticsCouponRoiQuery,
  ) {
    return this.analyticsService.getCouponRoi(query);
  }

  // ─── CSV Export Endpoints ───────────────────────────────────────────────────

  @Get('export/orders')
  @RequirePermissions(AdminPermission.ORDERS_READ)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="orders-export.csv"')
  @ApiOperation({
    summary: 'ส่งออกข้อมูลคำสั่งซื้อเป็นไฟล์ CSV',
    description:
      'ดาวน์โหลดประวัติคำสั่งซื้อทั้งหมดตามช่วงวันที่ พร้อมรองรับ UTF-8 BOM สำหรับ Excel',
  })
  async exportOrders(
    @Query(new ZodValidationPipe(exportOrdersSchema))
    query: ExportOrdersQuery,
  ): Promise<StreamableFile> {
    const csv = await this.analyticsService.exportOrders(query);
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get('export/products')
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="products-export.csv"')
  @ApiOperation({
    summary: 'ส่งออกข้อมูลรายการสินค้าเป็นไฟล์ CSV',
    description:
      'ดาวน์โหลดรายการ SKU, ราคา, และจำนวนสต็อกคงเหลือ พร้อมตัวกรองแผนกและหมวดหมู่',
  })
  async exportProducts(
    @Query(new ZodValidationPipe(exportProductsSchema))
    query: ExportProductsQuery,
  ): Promise<StreamableFile> {
    const csv = await this.analyticsService.exportProducts(query);
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get('export/inventory')
  @RequirePermissions(AdminPermission.INVENTORY_READ)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="inventory-export.csv"')
  @ApiOperation({
    summary: 'ส่งออกรายงานสต็อกสินค้าคงคลังเป็นไฟล์ CSV',
    description:
      'ดาวน์โหลดรายงานสต็อกทั้งหมด สต็อกใกล้หมด หรือสินค้าหมดสต็อก',
  })
  async exportInventory(
    @Query(new ZodValidationPipe(exportInventorySchema))
    query: ExportInventoryQuery,
  ): Promise<StreamableFile> {
    const csv = await this.analyticsService.exportInventory(query);
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get('export/audit-logs')
  @RequirePermissions(AdminPermission.AUDIT_LOGS_READ)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="audit-logs-export.csv"')
  @ApiOperation({
    summary: 'ส่งออกบันทึกการทำงานของระบบ (Audit Logs) เป็นไฟล์ CSV',
    description:
      'ดาวน์โหลด Security Audit Trail การทำงานของแอดมินตามช่วงเวลาที่กำหนด',
  })
  async exportAuditLogs(
    @Query(new ZodValidationPipe(exportAuditLogsSchema))
    query: ExportAuditLogsQuery,
  ): Promise<StreamableFile> {
    const csv = await this.analyticsService.exportAuditLogs(query);
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }
}
