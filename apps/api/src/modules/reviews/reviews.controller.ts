import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import {
  CustomerJwtGuard,
  OptionalCustomerJwtGuard,
  AccountStatusGuard,
} from '../auth/guards/index.js';
import { RateLimit } from '../../core/decorators/rate-limit.decorator.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  createReviewSchema,
  reviewQuerySchema,
  type CreateReviewInput,
  type ReviewQueryInput,
} from '@repo/validators';
import type {
  ApiReview,
  ApiProductReviewsResponse,
  ApiEligibleReviewItem,
} from '@repo/types';

interface AuthenticatedCustomerRequest {
  user?: {
    id: string;
    email: string;
    status?: string;
  };
}

@ApiTags('Product Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('products/:productId/reviews')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({
    summary:
      'ดึงรายการรีวิวและสถิติดาวของสินค้า (Get Approved Reviews & Rating Summary)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews and rating summary retrieved successfully',
  })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query(new ZodValidationPipe(reviewQuerySchema)) query: ReviewQueryInput,
    @Req() req: AuthenticatedCustomerRequest,
  ): Promise<ApiProductReviewsResponse> {
    const currentUserId = req.user?.id;
    return this.reviewsService.getProductReviews(
      productId,
      query,
      currentUserId,
    );
  }

  @Get('customer/reviews/eligible')
  @UseGuards(CustomerJwtGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'ดึงรายการสินค้าจากออเดอร์ที่ส่งมอบแล้วและพร้อมให้เขียนรีวิว (Get Eligible Items for Review)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of items eligible for customer review',
  })
  async getEligibleItems(
    @Req() req: AuthenticatedCustomerRequest,
  ): Promise<ApiEligibleReviewItem[]> {
    const userId = req.user!.id;
    return this.reviewsService.getEligibleItemsForReview(userId);
  }

  @Post('products/:productId/reviews')
  @UseGuards(CustomerJwtGuard, AccountStatusGuard)
  @RateLimit({ limit: 5, windowSeconds: 60, keyPrefix: 'review:create' })
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'ส่งรีวิวสินค้าสำหรับผู้ซื้อจริง (Submit Product Review - Verified Buyer Only)',
  })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Only verified buyers can review delivered products',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Already reviewed for this order',
  })
  async createReview(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(createReviewSchema)) dto: CreateReviewInput,
    @Req() req: AuthenticatedCustomerRequest,
  ): Promise<ApiReview> {
    const userId = req.user!.id;
    return this.reviewsService.createReview(userId, productId, dto);
  }

  @Delete('customer/reviews/:id')
  @UseGuards(CustomerJwtGuard, AccountStatusGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ลูกค้าลบรีวิวของตนเอง (Customer Soft-Delete Own Review)',
  })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Cannot delete other users reviews',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async deleteCustomerReview(
    @Param('id') reviewId: string,
    @Req() req: AuthenticatedCustomerRequest,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user!.id;
    return this.reviewsService.deleteCustomerReview(userId, reviewId);
  }
}
