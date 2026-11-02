import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CouponsService } from './coupons.service.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import { RateLimit } from '../../core/decorators/rate-limit.decorator.js';
import {
  validateCouponSchema,
  calculateCheckoutSchema,
  type ValidateCouponInput,
  type CalculateCheckoutInput,
} from '@repo/validators';

@ApiTags('Coupons & Checkout')
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('coupons/validate')
  @RateLimit({ limit: 15, windowSeconds: 60, keyPrefix: 'coupon:validate' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate promotional coupon code',
    description:
      'Validates coupon status, expiry, limits, and minimum order amount, returning calculated discount amount.',
  })
  @ApiResponse({ status: 200, description: 'Coupon validation result' })
  async validateCoupon(
    @Body(new ZodValidationPipe(validateCouponSchema))
    dto: ValidateCouponInput,
  ) {
    return this.couponsService.validateCoupon(dto);
  }

  @Post('checkout/calculate')
  @RateLimit({ limit: 20, windowSeconds: 60, keyPrefix: 'checkout:calc' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate checkout totals',
    description:
      'Calculates subtotal, shipping fee, promotional discount, pro-rata distribution, and tax amount.',
  })
  @ApiResponse({ status: 200, description: 'Checkout calculation summary' })
  async calculateCheckout(
    @Body(new ZodValidationPipe(calculateCheckoutSchema))
    dto: CalculateCheckoutInput,
  ) {
    return this.couponsService.calculateCheckout(dto);
  }
}
