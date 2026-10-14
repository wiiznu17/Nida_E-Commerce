import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import { Roles, RequirePermissions } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  AdminPermission,
  AdminRoleCode,
  type ApiAuditLog,
  type ApiResponse,
  type AuditLogStats,
  type PaginatedResponse,
} from '@repo/types';

@Controller('admin/audit-logs')
@UseGuards(RolesGuard)
@Roles(AdminRoleCode.SUPER_ADMIN)
@RequirePermissions(AdminPermission.AUDIT_LOGS_READ)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAuditLogs(
    @Query() query: AuditLogQueryDto,
  ): Promise<PaginatedResponse<ApiAuditLog>> {
    return this.auditLogService.getAuditLogs(query);
  }

  @Get('stats')
  async getAuditLogStats(): Promise<ApiResponse<AuditLogStats>> {
    const stats = await this.auditLogService.getAuditLogStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getAuditLogById(
    @Param('id') id: string,
  ): Promise<ApiResponse<ApiAuditLog>> {
    const data = await this.auditLogService.getAuditLogById(id);
    return {
      success: true,
      data,
    };
  }
}
