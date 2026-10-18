import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ContentService } from './content.service.js';
import { CurrentAdmin, RequirePermissions } from '../auth/decorators/index.js';
import { AdminPermission } from '@repo/types';
import type { ApiAdminUser } from '@repo/types';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  saveCmsBannerSchema,
  updateStoreSettingsSchema,
  reorderCmsBannersSchema,
  type SaveCmsBannerDto,
  type UpdateStoreSettingsDto,
  type ReorderCmsBannersDto,
} from '@repo/validators';

@ApiTags('Content & CMS')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('home')
  @RequirePermissions(AdminPermission.COUPONS_READ)
  @ApiOperation({
    summary: 'ดึงข้อมูลเนื้อหาหน้าแรกทั้งหมดสำหรับจัดการหลังบ้าน',
    description:
      'ส่งคืนแบนเนอร์ทั้งหมดรวมทั้งที่ปิดใช้งาน และการตั้งค่าร้านค้า',
  })
  @ApiResponse({ status: 200, description: 'ข้อมูลเนื้อหาหน้าแรก' })
  async getAdminHomeContent() {
    return this.contentService.getAdminHomeContent();
  }

  @Get('banners')
  @RequirePermissions(AdminPermission.COUPONS_READ)
  @ApiOperation({ summary: 'ดึงรายการแบนเนอร์ทั้งหมด' })
  async getAllBanners() {
    return this.contentService.getAllBanners();
  }

  @Get('banners/:id')
  @RequirePermissions(AdminPermission.COUPONS_READ)
  @ApiOperation({ summary: 'ดึงข้อมูลแบนเนอร์ตาม ID' })
  @ApiParam({ name: 'id', description: 'Banner UUID' })
  async getBannerById(@Param('id') id: string) {
    return this.contentService.getBannerById(id);
  }

  @Post('banners')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'สร้างแบนเนอร์ใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างแบนเนอร์สำเร็จ' })
  async createBanner(
    @Body(new ZodValidationPipe(saveCmsBannerSchema)) dto: SaveCmsBannerDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.contentService.createBanner(dto, admin?.id);
  }

  @Put('banners/:id')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @ApiOperation({ summary: 'อัปเดตแบนเนอร์ตาม ID' })
  @ApiParam({ name: 'id', description: 'Banner UUID' })
  async updateBanner(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(saveCmsBannerSchema)) dto: SaveCmsBannerDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.contentService.updateBanner(id, dto, admin?.id);
  }

  @Delete('banners/:id')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @ApiOperation({ summary: 'ลบแบนเนอร์' })
  @ApiParam({ name: 'id', description: 'Banner UUID' })
  async deleteBanner(
    @Param('id') id: string,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.contentService.deleteBanner(id, admin?.id);
  }

  @Patch('banners/reorder')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @ApiOperation({ summary: 'จัดเรียงลำดับแบนเนอร์' })
  async reorderBanners(
    @Body(new ZodValidationPipe(reorderCmsBannersSchema))
    dto: ReorderCmsBannersDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.contentService.reorderBanners(dto, admin?.id);
  }

  @Get('settings')
  @RequirePermissions(AdminPermission.COUPONS_READ)
  @ApiOperation({ summary: 'ดึงข้อมูลการตั้งค่าร้านค้าและแถบประกาศ' })
  async getStoreSettings() {
    return this.contentService.getStoreSettings();
  }

  @Put('settings')
  @RequirePermissions(AdminPermission.COUPONS_MANAGE)
  @ApiOperation({ summary: 'อัปเดตการตั้งค่าร้านค้าและแถบประกาศ' })
  async updateStoreSettings(
    @Body(new ZodValidationPipe(updateStoreSettingsSchema))
    dto: UpdateStoreSettingsDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ) {
    return this.contentService.updateStoreSettings(dto, admin?.id);
  }
}
