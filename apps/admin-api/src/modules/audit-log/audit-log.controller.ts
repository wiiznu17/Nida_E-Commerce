import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import { Roles, RequirePermissions } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  AdminPermission,
  AdminRoleCode,
  type ApiAuditLog,
  type ApiResponse as ApiGenericResponse,
  type AuditLogStats,
  type PaginatedResponse,
} from '@repo/types';

@ApiTags('Audit Logs')
@Controller('admin/audit-logs')
@UseGuards(RolesGuard)
@Roles(AdminRoleCode.SUPER_ADMIN)
@RequirePermissions(AdminPermission.AUDIT_LOGS_READ)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({
    summary: 'Search & query audit logs',
    description: 'Retrieve paginated system audit trails, filtered by table, action type, admin ID, date range, and keyword.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of audit trail entries' })
  async getAuditLogs(
    @Query() query: AuditLogQueryDto,
  ): Promise<PaginatedResponse<ApiAuditLog>> {
    return this.auditLogService.getAuditLogs(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get audit log statistics',
    description: 'Retrieve aggregate audit statistics breakdown for past 24 hours, top actors, and critical mutations.',
  })
  @ApiResponse({ status: 200, description: 'Audit statistics summary' })
  async getAuditLogStats(): Promise<ApiGenericResponse<AuditLogStats>> {
    const stats = await this.auditLogService.getAuditLogStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get audit log detail',
    description: 'Retrieve full diff details, actor identity, request IP, and user-agent for a specific audit entry.',
  })
  @ApiParam({ name: 'id', description: 'Audit log entry UUID' })
  @ApiResponse({ status: 200, description: 'Audit log entry details' })
  @ApiResponse({ status: 404, description: 'Audit log entry not found' })
  async getAuditLogById(
    @Param('id') id: string,
  ): Promise<ApiGenericResponse<ApiAuditLog>> {
    const data = await this.auditLogService.getAuditLogById(id);
    return {
      success: true,
      data,
    };
  }
}
