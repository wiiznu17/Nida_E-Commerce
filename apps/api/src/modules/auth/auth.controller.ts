import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerAuthService } from './auth.service.js';
import { RequestOtpDto } from './dto/request-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { CustomerJwtGuard } from './guards/customer-jwt.guard.js';
import type { RequestOtpResponse, VerifyOtpResponse, ApiUser } from '@repo/types';

interface AuthenticatedRequest {
  user: ApiUser;
}

@ApiTags('Storefront Customer Authentication')
@Controller('auth')
export class CustomerAuthController {
  constructor(private readonly authService: CustomerAuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request OTP for customer login/registration',
    description: 'Generates and sends a 6-digit OTP code to the provided email address (valid for 5 minutes).',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponse> {
    return this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP code and authenticate',
    description: 'Validates 6-digit OTP, auto-creates customer account if new, and returns JWT access token.',
  })
  @ApiResponse({ status: 200, description: 'Verified and logged in' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    return this.authService.verifyOtp(dto);
  }

  @Get('me')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current customer profile',
    description: 'Returns profile details for the authenticated customer.',
  })
  @ApiResponse({ status: 200, description: 'Customer profile details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: AuthenticatedRequest): Promise<ApiUser> {
    return this.authService.getProfile(req.user.id);
  }
}
