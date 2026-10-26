import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerCartService } from './cart.service.js';
import { CustomerJwtGuard } from '../auth/guards/customer-jwt.guard.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  mergeCartSchema,
  updateCartItemSchema,
  type MergeCartInput,
  type UpdateCartItemInput,
} from '@repo/validators';
import type { ServerCartResponse } from '@repo/types';

interface AuthenticatedCustomerRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Storefront Cart')
@ApiBearerAuth()
@UseGuards(CustomerJwtGuard)
@Controller('cart')
export class CustomerCartController {
  constructor(private readonly cartService: CustomerCartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer cart from database' })
  @ApiResponse({ status: 200, description: 'User cart items with live details' })
  async getCart(
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ServerCartResponse> {
    return this.cartService.getCart(req.user.id);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge local guest cart items into customer cart on login' })
  @ApiResponse({ status: 200, description: 'Merged cart items' })
  async mergeCart(
    @Request() req: AuthenticatedCustomerRequest,
    @Body(new ZodValidationPipe(mergeCartSchema)) dto: MergeCartInput,
  ): Promise<ServerCartResponse> {
    return this.cartService.mergeCart(req.user.id, dto);
  }

  @Put('items')
  @ApiOperation({ summary: 'Update or add item in customer cart' })
  @ApiResponse({ status: 200, description: 'Updated cart items' })
  async updateItem(
    @Request() req: AuthenticatedCustomerRequest,
    @Body(new ZodValidationPipe(updateCartItemSchema)) dto: UpdateCartItemInput,
  ): Promise<ServerCartResponse> {
    return this.cartService.updateItem(req.user.id, dto);
  }

  @Delete('items/:variantId')
  @ApiOperation({ summary: 'Remove variant item from customer cart' })
  @ApiResponse({ status: 200, description: 'Cart items after removal' })
  async removeItem(
    @Request() req: AuthenticatedCustomerRequest,
    @Param('variantId') variantId: string,
  ): Promise<ServerCartResponse> {
    return this.cartService.removeItem(req.user.id, variantId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire customer cart' })
  @ApiResponse({ status: 200, description: 'Empty cart' })
  async clearCart(
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ServerCartResponse> {
    return this.cartService.clearCart(req.user.id);
  }
}
