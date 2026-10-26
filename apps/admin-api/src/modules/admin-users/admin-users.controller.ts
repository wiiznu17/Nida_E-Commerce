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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
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
  type ApiResponse as ApiGenericResponse,
  type InviteAdminResponse,
} from '@repo/types';

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles(AdminRoleCode.SUPER_ADMIN)
@RequirePermissions(AdminPermission.ADMIN_USERS_MANAGE)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all admin users',
    description:
      'Retrieve all back-office administrative staff accounts with their assigned roles.',
  })
  @ApiResponse({ status: 200, description: 'List of admin users' })
  async getAdminUsers(): Promise<ApiGenericResponse<ApiAdminUser[]>> {
    const data = await this.adminUsersService.getAdminUsers();
    return {
      success: true,
      data,
    };
  }

  @Get('roles')
  @ApiOperation({
    summary: 'List system roles',
    description:
      'Retrieve predefined administrative roles and their permission sets.',
  })
  @ApiResponse({ status: 200, description: 'List of system roles' })
  async getRoles(): Promise<ApiGenericResponse<ApiAdminRole[]>> {
    const data = await this.adminUsersService.getRoles();
    return {
      success: true,
      data,
    };
  }

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite new admin user',
    description:
      'Generate an invitation token and send onboarding setup email to new staff member.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation created and dispatched',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async inviteAdmin(
    @Body() dto: InviteAdminUserDto,
    @CurrentAdmin() currentAdmin: ApiAdminUser | null,
  ): Promise<ApiGenericResponse<InviteAdminResponse>> {
    const data = await this.adminUsersService.inviteAdmin(
      dto,
      currentAdmin?.id,
      currentAdmin?.role?.roleCode,
    );
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/toggle')
  @ApiOperation({
    summary: 'Toggle admin active status',
    description:
      'Activate or suspend an admin user account. Super admin cannot suspend themselves.',
  })
  @ApiParam({ name: 'id', description: 'Admin user UUID' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot suspend own account' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  async toggleActive(
    @Param('id') targetId: string,
    @CurrentAdmin() currentAdmin: ApiAdminUser,
  ): Promise<ApiGenericResponse<ApiAdminUser>> {
    const data = await this.adminUsersService.toggleActiveStatus(
      targetId,
      currentAdmin.id,
      currentAdmin.role?.roleCode,
    );
    return {
      success: true,
      data,
    };
  }
}
