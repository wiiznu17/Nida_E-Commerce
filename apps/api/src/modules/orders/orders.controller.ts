import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerOrdersService } from './orders.service.js';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto.js';
import {
  CustomerJwtGuard,
  OptionalCustomerJwtGuard,
} from '../auth/guards/customer-jwt.guard.js';
import type { ApiOrder, TrackingResult } from '@repo/types';

interface AuthenticatedCustomerRequest {
  user?: {
    id: string;
    email: string;
  };
}

@ApiTags('Storefront Orders')
@Controller('orders')
export class CustomerOrdersController {
  constructor(private readonly ordersService: CustomerOrdersService) {}

  @Post()
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({
    summary:
      'Create a new storefront customer order with atomic stock deduction',
  })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock or invalid coupon',
  })
  async createOrder(
    @Body() dto: CreateCustomerOrderDto,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const authenticatedUserId = req.user?.id;
    return this.ordersService.createOrder(dto, authenticatedUserId);
  }

  @Get('my-orders')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order history for logged-in customer' })
  @ApiResponse({ status: 200, description: 'List of customer orders' })
  async getMyOrders(
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder[]> {
    const userId = req.user!.id;
    return this.ordersService.getMyOrders(userId);
  }

  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Track order shipment and delivery status' })
  @ApiResponse({
    status: 200,
    description: 'Tracking timeline and carrier status',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async trackOrder(
    @Param('orderNumber') orderNumber: string,
  ): Promise<TrackingResult> {
    return this.ordersService.trackOrder(orderNumber);
  }

  @Get(':orderNumber')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Get order detail by order number' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.getOrderByNumber(orderNumber, userId);
  }
}
