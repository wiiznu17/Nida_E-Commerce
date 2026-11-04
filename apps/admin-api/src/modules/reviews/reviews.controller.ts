import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminReviewsService } from './reviews.service.js';
import {
  AdminPermission,
  type ApiAdminUser,
  type ApiReview,
  type PaginatedResponse,
} from '@repo/types';
import { CurrentAdmin, RequirePermissions } from '../auth/decorators/index.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  adminReviewQuerySchema,
  adminUpdateReviewStatusSchema,
  adminReplyReviewSchema,
  type AdminReviewQueryInput,
  type AdminUpdateReviewStatusInput,
  type AdminReplyReviewInput,
} from '@repo/validators';

@ApiTags('Product Reviews Management')
@Controller('reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: AdminReviewsService) {}

  @Get()
  @RequirePermissions(AdminPermission.CATALOG_READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'ดึงรายการรีวิวสินค้าทั้งหมดพร้อมฟิลเตอร์ (List All Product Reviews)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of reviews' })
  async getReviews(
    @Query(new ZodValidationPipe(adminReviewQuerySchema))
    query: AdminReviewQueryInput,
  ): Promise<PaginatedResponse<ApiReview>> {
    return this.reviewsService.getReviews(query);
  }

  @Patch(':id/status')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'เปิด/ปิดการแสดงผลรีวิว (Toggle Review Visibility - Approved/Hidden)',
  })
  @ApiResponse({ status: 200, description: 'Review status updated' })
  async toggleReviewStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateReviewStatusSchema))
    dto: AdminUpdateReviewStatusInput,
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<ApiReview> {
    return this.reviewsService.toggleReviewStatus(id, dto, admin.id);
  }

  @Post(':id/reply')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'แอดมินตอบกลับรีวิวลูกค้า (Official Brand Reply)',
  })
  @ApiResponse({ status: 200, description: 'Reply saved successfully' })
  async replyToReview(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminReplyReviewSchema))
    dto: AdminReplyReviewInput,
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<ApiReview> {
    return this.reviewsService.replyToReview(id, dto, admin.id);
  }

  @Delete(':id')
  @RequirePermissions(AdminPermission.CATALOG_WRITE)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ลบรีวิวที่ไม่เหมาะสม (Delete Review with Audit Logging)',
  })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(
    @Param('id') id: string,
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.reviewsService.deleteReview(id, admin.id);
  }
}

