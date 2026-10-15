import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service.js';
import { InviteAdminUserDto } from './dto/admin-user.dto.js';
import {
  Roles,
  RequirePermissions,
  CurrentAdmin,
} from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  AdminPermission,
  AdminRoleCode,
  type ApiAdminUser,
  type ApiAdminRole,
  type ApiResponse,
  type InviteAdminResponse,
} from '@repo/types';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles(AdminRoleCode.SUPER_ADMIN)
@RequirePermissions(AdminPermission.ADMIN_USERS_MANAGE)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAdminUsers(): Promise<ApiResponse<ApiAdminUser[]>> {
    const data = await this.adminUsersService.getAdminUsers();
    return {
      success: true,
      data,
    };
  }

  @Get('roles')
  async getRoles(): Promise<ApiResponse<ApiAdminRole[]>> {
    const data = await this.adminUsersService.getRoles();
    return {
      success: true,
      data,
    };
  }

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  async inviteAdmin(
    @Body() dto: InviteAdminUserDto,
  ): Promise<ApiResponse<InviteAdminResponse>> {
    const data = await this.adminUsersService.inviteAdmin(dto);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/toggle')
  async toggleActive(
    @Param('id') targetId: string,
    @CurrentAdmin() currentAdmin: ApiAdminUser,
  ): Promise<ApiResponse<ApiAdminUser>> {
    const data = await this.adminUsersService.toggleActiveStatus(
      targetId,
      currentAdmin.id,
    );
    return {
      success: true,
      data,
    };
  }
}
