import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerAuthService } from './auth.service.js';
import {
  RequestOtpDto,
  VerifyOtpDto,
  CustomerRefreshTokenDto,
  UpdateCustomerProfileDto,
  RequestEmailChangeDto,
  VerifyEmailChangeDto,
} from './dto/index.js';
import { CustomerJwtGuard } from './guards/customer-jwt.guard.js';
import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  CustomerRefreshResponse,
  ApiUser,
} from '@repo/types';

interface AuthenticatedRequest {
  user: ApiUser;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}

interface RawRequest {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}

@ApiTags('Storefront Customer Authentication')
@Controller('auth')
export class CustomerAuthController {
  constructor(private readonly authService: CustomerAuthService) {}

  private extractClientMeta(req: RawRequest) {
    const rawForwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof rawForwarded === 'string'
        ? rawForwarded.split(',')[0]?.trim()
        : Array.isArray(rawForwarded)
          ? rawForwarded[0]?.trim()
          : undefined) ??
      req.ip ??
      req.socket?.remoteAddress ??
      'unknown';

    const rawUserAgent = req.headers['user-agent'];
    const userAgent =
      typeof rawUserAgent === 'string' ? rawUserAgent : undefined;

    return { ip, userAgent };
  }

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request OTP for customer login/registration',
    description:
      'Generates and sends a 6-digit OTP code to the provided email address (valid for 5 minutes).',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async requestOtp(
    @Body() dto: RequestOtpDto,
    @Req() req: RawRequest,
  ): Promise<RequestOtpResponse> {
    const { ip } = this.extractClientMeta(req);
    return this.authService.requestOtp(dto, ip);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP code and authenticate',
    description:
      'Validates 6-digit OTP, auto-creates customer account if new, and returns access and refresh tokens.',
  })
  @ApiResponse({ status: 200, description: 'Verified and logged in' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: RawRequest,
  ): Promise<VerifyOtpResponse> {
    const meta = this.extractClientMeta(req);
    return this.authService.verifyOtp(dto, meta);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token with refresh token rotation',
    description:
      'Rotates customer refresh token and returns a newly signed short-lived access token.',
  })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  @ApiResponse({ status: 401, description: 'Session expired or invalid' })
  async refreshTokens(
    @Body() dto: CustomerRefreshTokenDto,
    @Req() req: RawRequest,
  ): Promise<CustomerRefreshResponse> {
    const meta = this.extractClientMeta(req);
    return this.authService.refreshTokens(dto, meta);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout current customer session',
    description: 'Revokes the active refresh token session.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Body() dto?: Partial<CustomerRefreshTokenDto>,
  ): Promise<{ success: boolean }> {
    return this.authService.logout(dto?.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign out customer from all devices',
    description: 'Revokes all active sessions and refresh tokens for this customer.',
  })
  @ApiResponse({ status: 200, description: 'All sessions revoked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean }> {
    return this.authService.logoutAll(req.user.id);
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

  @Patch('profile')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update customer personal profile details',
    description:
      'Persists first name, last name, and phone updates to the database.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<ApiUser> {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Post('request-email-change')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request OTP to change primary account email',
    description:
      'Dispatches a verification OTP to the proposed new email address.',
  })
  @ApiResponse({ status: 200, description: 'OTP dispatched' })
  @ApiResponse({ status: 400, description: 'Email already in use or identical' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async requestEmailChange(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestEmailChangeDto,
  ): Promise<RequestOtpResponse> {
    return this.authService.requestEmailChange(req.user.id, dto);
  }

  @Post('verify-email-change')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and switch primary account email',
    description:
      'Validates OTP, updates customer email in the database, and revokes previous sessions for security.',
  })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyEmailChange(
    @Req() req: AuthenticatedRequest,
    @Body() dto: VerifyEmailChangeDto,
  ): Promise<VerifyOtpResponse> {
    const meta = this.extractClientMeta(req);
    return this.authService.verifyEmailChange(req.user.id, dto, meta);
  }
}
