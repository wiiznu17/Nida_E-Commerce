import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoreContentService } from './content.service.js';

@ApiTags('Storefront Content & CMS')
@Controller('content')
export class StoreContentController {
  constructor(private readonly contentService: StoreContentService) {}

  @Get('home')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  @ApiOperation({
    summary: 'ดึงข้อมูลเนื้อหาหน้าแรกของหน้าร้าน',
    description:
      'ส่งคืนรายการ Hero Banners, Promo Ribbon และการตั้งค่าร้านค้าที่ Active',
  })
  @ApiResponse({ status: 200, description: 'ข้อมูลเนื้อหาหน้าแรกสดจากระบบ' })
  async getHomeContent() {
    return this.contentService.getHomeContent();
  }

  @Get('settings')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  @ApiOperation({
    summary: 'ดึงการตั้งค่าร้านค้าและแถบประกาศ',
  })
  async getStoreSettings() {
    return this.contentService.getStoreSettings();
  }
}
