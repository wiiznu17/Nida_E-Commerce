import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service.js';
import { CustomerJwtGuard } from '../auth/guards/customer-jwt.guard.js';
import type { ApiWishlistResponse, ApiUser } from '@repo/types';

interface AuthenticatedCustomerRequest {
  user: ApiUser;
}

@ApiTags('Storefront Customer Wishlist')
@Controller('wishlist')
@UseGuards(CustomerJwtGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({
    summary: 'Get saved wishlist product IDs for authenticated customer',
  })
  @ApiResponse({ status: 200, description: 'List of wishlist product IDs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWishlist(
    @Req() req: AuthenticatedCustomerRequest,
  ): Promise<ApiWishlistResponse> {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  @ApiOperation({
    summary: 'Add a product to authenticated customer wishlist',
  })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToWishlist(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<{ success: boolean; productId: string }> {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Remove a product from authenticated customer wishlist',
  })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeFromWishlist(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<{ success: boolean; productId: string }> {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }
}
