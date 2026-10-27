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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CustomerLoginDto,
  CustomerRegisterDto,
  CustomerForgotPasswordDto,
  CustomerResetPasswordDto,
  CustomerResendOtpDto,
  RequestOtpDto,
  VerifyOtpDto,
  CustomerRefreshTokenDto,
  UpdateCustomerProfileDto,
  CustomerChangePasswordDto,
} from './dto/index.js';
import { CustomerJwtGuard } from './guards/customer-jwt.guard.js';
import { CustomerAuthService } from './auth.service.js';
import type {
  RequestOtpResponse,
  CustomerOtpChallengeResponse,
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

  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if customer email already exists',
    description: 'Returns { exists: true/false } for frontend validation.',
  })
  @ApiResponse({ status: 200, description: 'Email existence status' })
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ exists: boolean }> {
    return this.authService.checkEmail(email);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 1: Register customer with password and send OTP challenge',
    description:
      'Checks duplicate email, hashes password, saves pending customer, and dispatches 6-digit verification OTP.',
  })
  @ApiResponse({ status: 200, description: 'OTP challenge sent successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() dto: CustomerRegisterDto,
    @Req() req: RawRequest,
  ): Promise<CustomerOtpChallengeResponse> {
    const { ip } = this.extractClientMeta(req);
    return this.authService.register(dto, ip);
  }

  @Post('register/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 2: Verify registration OTP and issue session tokens',
    description:
      'Validates 6-digit OTP, marks customer account verified, and returns JWT access and refresh tokens.',
  })
  @ApiResponse({ status: 200, description: 'Registration completed and logged in' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyRegisterOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: RawRequest,
  ): Promise<VerifyOtpResponse> {
    const meta = this.extractClientMeta(req);
    return this.authService.verifyRegisterOtp(dto, meta);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 1: Authenticate email and password, then send OTP challenge',
    description:
      'Verifies customer password with bcrypt, then dispatches 6-digit OTP code to email.',
  })
  @ApiResponse({ status: 200, description: 'Credentials verified, OTP dispatched' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or password' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async login(
    @Body() dto: CustomerLoginDto,
    @Req() req: RawRequest,
  ): Promise<CustomerOtpChallengeResponse> {
    const { ip } = this.extractClientMeta(req);
    return this.authService.login(dto, ip);
  }

  @Post('login/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 2: Verify login OTP code and issue session tokens',
    description:
      'Validates 6-digit OTP and returns authenticated JWT access and refresh tokens.',
  })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyLoginOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: RawRequest,
  ): Promise<VerifyOtpResponse> {
    const meta = this.extractClientMeta(req);
    return this.authService.verifyLoginOtp(dto, meta);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP code for active login or register flow',
  })
  @ApiResponse({ status: 200, description: 'New OTP dispatched' })
  async resendOtp(
    @Body() dto: CustomerResendOtpDto,
    @Req() req: RawRequest,
  ): Promise<CustomerOtpChallengeResponse> {
    const { ip } = this.extractClientMeta(req);
    return this.authService.resendOtp(dto, ip);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset OTP code',
  })
  @ApiResponse({ status: 200, description: 'Reset OTP dispatched' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async forgotPassword(
    @Body() dto: CustomerForgotPasswordDto,
    @Req() req: RawRequest,
  ): Promise<CustomerOtpChallengeResponse> {
    const { ip } = this.extractClientMeta(req);
    return this.authService.forgotPassword(dto, ip);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP code and reset customer password',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async resetPassword(
    @Body() dto: CustomerResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.authService.resetPassword(dto);
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
    description:
      'Revokes all active sessions and refresh tokens for this customer.',
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

  @Post('change-password')
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password for authenticated customer',
    description:
      'Verifies current password and updates to new password hash.',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CustomerChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.authService.changePassword(req.user.id, dto);
  }
}
