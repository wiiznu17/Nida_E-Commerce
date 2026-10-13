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
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import {
  AdminLoginDto,
  RefreshTokenDto,
  SetupPasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto.js';
import { Public, CurrentAdmin } from './decorators/index.js';
import type {
  AdminLoginResponse,
  AdminRefreshResponse,
  ApiAdminUser,
  ApiResponse,
  VerifyTokenResponse,
} from '@repo/types';

@Controller('auth/admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AdminLoginResponse>> {
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
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AdminRefreshResponse>> {
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
  async verifyToken(
    @Query('token') token: string,
    @Query('type') type: 'invite' | 'reset',
  ): Promise<ApiResponse<VerifyTokenResponse>> {
    if (!token || !type || !['invite', 'reset'].includes(type)) {
      throw new BadRequestException('Token and type (invite/reset) are required');
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
  async setupPassword(
    @Body() dto: SetupPasswordDto,
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.authService.setupPassword(dto);
    return {
      success: true,
      data: { message: result.message },
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      data: { message: result.message },
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      data: { message: result.message },
    };
  }

  @Get('me')
  async getMe(
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<ApiResponse<ApiAdminUser>> {
    return {
      success: true,
      data: admin,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() body: { refreshToken?: string },
    @CurrentAdmin() admin: ApiAdminUser | null,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.authService.logout(body.refreshToken, admin?.id);
    return {
      success: true,
      data: { message: 'ออกจากระบบเรียบร้อยแล้ว' },
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentAdmin() admin: ApiAdminUser,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.authService.logoutAll(admin.id);
    return {
      success: true,
      data: { message: 'ออกจากระบบทุกอุปกรณ์เรียบร้อยแล้ว' },
    };
  }
}
