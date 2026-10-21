import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
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
  CustomerCreateCancellationDto,
  CustomerCreateReturnDto,
  CustomerSubmitReturnShipmentDto,
} from './dto/customer-order-requests.dto.js';
import {
  CustomerJwtGuard,
  OptionalCustomerJwtGuard,
} from '../auth/guards/customer-jwt.guard.js';
import type { ApiOrder, TrackingResult, PaymentMethod } from '@repo/types';

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

  @Post('track')
  @ApiOperation({ summary: 'Track order with order number and phone' })
  @ApiResponse({
    status: 200,
    description: 'Tracking timeline and carrier status',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async trackOrderByQuery(
    @Body() body: { orderNumber: string; phone?: string },
  ): Promise<TrackingResult> {
    return this.ordersService.trackOrder(body.orderNumber, body.phone);
  }

  @Post('webhook/omise')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive and process Omise webhook events' })
  async handleOmiseWebhook(
    @Body() event: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    return this.ordersService.handleOmiseWebhook(event);
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

  @Get(':orderNumber/omise-status')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Sync and retrieve latest Omise payment status' })
  async getOmiseStatus(
    @Param('orderNumber') orderNumber: string,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<{
    order: ApiOrder;
    chargeStatus?: string;
    failureMessage?: string;
  }> {
    const userId = req.user?.id;
    return this.ordersService.syncOmiseChargeStatus(orderNumber, userId);
  }

  @Post(':orderNumber/omise-simulate-pay')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Sandbox only: simulate PromptPay charge payment' })
  async simulateOmisePay(
    @Param('orderNumber') orderNumber: string,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.simulateOmisePay(orderNumber, userId);
  }

  @Patch(':orderNumber/payment-method')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Update payment method for pending order' })
  @ApiResponse({ status: 200, description: 'Payment method updated' })
  @ApiResponse({ status: 400, description: 'Order not eligible' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updatePaymentMethod(
    @Param('orderNumber') orderNumber: string,
    @Body() body: { paymentMethod: PaymentMethod },
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.updatePaymentMethod(
      orderNumber,
      body.paymentMethod,
      userId,
    );
  }

  @Post(':orderNumber/pay')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Complete or simulate payment for an order' })
  @ApiResponse({ status: 200, description: 'Payment successful' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async payOrder(
    @Param('orderNumber') orderNumber: string,
    @Body()
    body: {
      paymentMethod?: PaymentMethod;
      omiseToken?: string;
      cardLast4?: string;
      cardBrand?: string;
    },
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<{
    order: ApiOrder;
    authorizeUri?: string | null;
    qrDownloadUri?: string | null;
    expiresAt?: string | null;
  }> {
    const userId = req.user?.id;
    return this.ordersService.payOrder(orderNumber, userId, body);
  }

  @Post(':orderNumber/cancellation-request')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Submit pre-fulfillment cancellation request' })
  @ApiResponse({ status: 201, description: 'Cancellation request submitted' })
  @ApiResponse({
    status: 400,
    description: 'Order not eligible or pending request exists',
  })
  async requestCancellation(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: CustomerCreateCancellationDto,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.requestCancellation(orderNumber, dto, userId);
  }

  @Post(':orderNumber/return-request')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({ summary: 'Submit post-delivery return request' })
  @ApiResponse({ status: 201, description: 'Return request submitted' })
  @ApiResponse({
    status: 400,
    description: 'Order not eligible or active return exists',
  })
  async requestReturn(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: CustomerCreateReturnDto,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.requestReturn(orderNumber, dto, userId);
  }

  @Post(':orderNumber/returns/:returnRequestId/shipment')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({
    summary: 'Customer submits return shipment tracking & courier info',
  })
  @ApiResponse({
    status: 200,
    description: 'Return shipment tracking recorded',
  })
  @ApiResponse({
    status: 400,
    description: 'Return request not approved or invalid tracking',
  })
  async submitReturnShipment(
    @Param('orderNumber') orderNumber: string,
    @Param('returnRequestId') returnRequestId: string,
    @Body() dto: CustomerSubmitReturnShipmentDto,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.submitReturnShipment(
      orderNumber,
      returnRequestId,
      dto,
      userId,
    );
  }

  @Post(':orderNumber/accept')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiOperation({
    summary: 'Customer confirms delivery and accepts order (COMPLETED)',
  })
  @ApiResponse({ status: 200, description: 'Order completed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Order not eligible for acceptance',
  })
  async acceptOrder(
    @Param('orderNumber') orderNumber: string,
    @Request() req: AuthenticatedCustomerRequest,
  ): Promise<ApiOrder> {
    const userId = req.user?.id;
    return this.ordersService.acceptOrder(orderNumber, userId);
  }
}
