import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import {
  AdminLoginDto,
  RefreshTokenDto,
  SetupPasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AdminLogoutDto,
} from './dto/auth.dto.js';
import { Public, CurrentAdmin } from './decorators/index.js';
import type {
  AdminLoginResponse,
  AdminRefreshResponse,
  ApiAdminUser,
  ApiResponse as ApiGenericResponse,
  VerifyTokenResponse,
} from '@repo/types';

@ApiTags('Auth')
@Controller('auth/admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description:
      'Authenticate an admin staff member with identifier (username/email) and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful with tokens and user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
  })
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
  ): Promise<ApiGenericResponse<AdminLoginResponse>> {
    const ip = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const data = await this.authService.login(dto, { ip, userAgent });
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Issue a new short-lived access token using a valid refresh token.',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Refresh token expired or revoked' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<ApiGenericResponse<AdminRefreshResponse>> {
    const ip = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const data = await this.authService.refresh(dto, { ip, userAgent });
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Get('verify-token')
  @ApiOperation({
    summary: 'Verify invitation or password reset token',
    description:
      'Verify if a one-time token is valid, unexpired, and not yet claimed.',
  })
  @ApiQuery({
    name: 'token',
    description: 'One-time token string',
    required: true,
  })
  @ApiQuery({
    name: 'type',
    enum: ['invite', 'reset'],
    description: 'Token purpose type',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({
    status: 400,
    description: 'Invalid, malformed, or expired token',
  })
  async verifyToken(
    @Query('token') token: string,
    @Query('type') type: 'invite' | 'reset',
  ): Promise<ApiGenericResponse<VerifyTokenResponse>> {
    if (!token || !type || !['invite', 'reset'].includes(type)) {
      throw new BadRequestException(
        'Token and type (invite/reset) are required',
      );
    }

    const data = await this.authService.verifyToken(token, type);
    return {
      success: true,
      data,
    };
  }

  @Public()
  @Post('setup-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Setup initial password (Claim invitation)',
    description:
      'Set an initial password for a newly invited admin user using an invitation token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password setup completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid token or weak password' })
  async setupPassword(
    @Body() dto: SetupPasswordDto,
  ): Promise<ApiGenericResponse<{ message: string }>> {
    const result = await this.authService.setupPassword(dto);
    return {
      success: true,
      data: { message: result.message },
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset link',
    description:
      'Trigger a password reset email to a registered admin address.',
  })
  @ApiResponse({ status: 200, description: 'Reset email initiated' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ApiGenericResponse<{ message: string }>> {
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      data: { message: result.message },
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Complete password reset using a verified reset token and new password.',
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token or weak password' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiGenericResponse<{ message: string }>> {
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      data: { message: result.message },
    };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current admin profile',
    description:
      'Retrieve profile and permissions for the currently authenticated admin session.',
  })
  @ApiResponse({ status: 200, description: 'Current admin profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<ApiGenericResponse<ApiAdminUser>> {
    return {
      success: true,
      data: admin,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin logout',
    description: 'Revoke the active session or specific refresh token.',
  })
  @ApiBody({ type: AdminLogoutDto, required: false })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Body() body: AdminLogoutDto,
    @CurrentAdmin() admin: ApiAdminUser | null,
  ): Promise<ApiGenericResponse<{ message: string }>> {
    await this.authService.logout(body?.refreshToken, admin?.id);
    return {
      success: true,
      data: { message: 'ออกจากระบบเรียบร้อยแล้ว' },
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from all devices',
    description:
      'Revoke all active refresh tokens and sessions for this admin user.',
  })
  @ApiResponse({ status: 200, description: 'All active sessions invalidated' })
  async logoutAll(
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<ApiGenericResponse<{ message: string }>> {
    await this.authService.logoutAll(admin.id);
    return {
      success: true,
      data: { message: 'ออกจากระบบทุกอุปกรณ์เรียบร้อยแล้ว' },
    };
  }
}
