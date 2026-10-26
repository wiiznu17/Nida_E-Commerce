import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import type {
  ApiAuditLog,
  AuditActionType,
  AuditLogStats,
  PaginatedResponse,
} from '@repo/types';
import { Prisma } from '@repo/database';

export interface RecordAuditLogParams {
  adminId?: string | null;
  actionType: AuditActionType;
  targetTable: string;
  targetId: string;
  permission?: string | null;
  performedRole?: string | null;
  oldValuesJson?: Record<string, unknown> | null;
  newValuesJson?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const auditAdminSelect = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  department: true,
  role: {
    select: {
      roleCode: true,
    },
  },
} as const;

type AuditLogWithAdmin = Prisma.AdminAuditLogGetPayload<{
  include: {
    admin: {
      select: typeof auditAdminSelect;
    };
  };
}>;

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordLog(params: RecordAuditLogParams): Promise<ApiAuditLog | null> {
    try {
      const log = await this.prisma.adminAuditLog.create({
        data: {
          adminId: params.adminId ?? null,
          actionType: params.actionType,
          targetTable: params.targetTable,
          targetId: params.targetId,
          permission: params.permission ?? null,
          performedRole: params.performedRole ?? null,
          oldValuesJson: params.oldValuesJson
            ? (params.oldValuesJson as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          newValuesJson: params.newValuesJson
            ? (params.newValuesJson as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
        },
        include: {
          admin: {
            select: auditAdminSelect,
          },
        },
      });

      return this.mapAuditLog(log);
    } catch (error: unknown) {
      this.logger.error('Failed to record system audit log', error);
      return null;
    }
  }

  async getAuditLogs(
    query: AuditLogQueryDto,
  ): Promise<PaginatedResponse<ApiAuditLog>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AdminAuditLogWhereInput = {};

    if (query.targetTable) {
      where.targetTable = {
        equals: query.targetTable.trim(),
        mode: 'insensitive',
      };
    }

    if (query.actionType) {
      where.actionType = query.actionType;
    }

    if (query.permission) {
      where.permission = {
        contains: query.permission.trim(),
        mode: 'insensitive',
      };
    }

    if (query.adminId) {
      where.adminId = query.adminId.trim();
    }

    if (query.username) {
      const usernameTerm = query.username.trim();
      where.admin = {
        is: {
          username: { equals: usernameTerm, mode: 'insensitive' },
        },
      };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { targetId: { contains: searchTerm, mode: 'insensitive' } },
        { targetTable: { contains: searchTerm, mode: 'insensitive' } },
        { ipAddress: { contains: searchTerm, mode: 'insensitive' } },
        { permission: { contains: searchTerm, mode: 'insensitive' } },
        {
          admin: {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { username: { contains: searchTerm, mode: 'insensitive' } },
              { fullName: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.adminAuditLog.count({ where }),
      this.prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: auditAdminSelect,
          },
        },
      }),
    ]);

    return {
      success: true,
      data: items.map((item) => this.mapAuditLog(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAuditLogById(id: string): Promise<ApiAuditLog> {
    const log = await this.prisma.adminAuditLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: auditAdminSelect,
        },
      },
    });

    if (!log) {
      throw new NotFoundException(`Audit log record '${id}' not found`);
    }

    return this.mapAuditLog(log);
  }

  async getAuditLogStats(): Promise<AuditLogStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, topActionGroup, topTableGroup] =
      await Promise.all([
        this.prisma.adminAuditLog.count(),
        this.prisma.adminAuditLog.count({
          where: { createdAt: { gte: todayStart } },
        }),
        this.prisma.adminAuditLog.groupBy({
          by: ['actionType'],
          _count: { actionType: true },
          orderBy: { _count: { actionType: 'desc' } },
          take: 1,
        }),
        this.prisma.adminAuditLog.groupBy({
          by: ['targetTable'],
          _count: { targetTable: true },
          orderBy: { _count: { targetTable: 'desc' } },
          take: 1,
        }),
      ]);

    return {
      totalLogs,
      todayLogs,
      topActionType: (topActionGroup[0]?.actionType as AuditActionType) ?? null,
      topTargetTable: topTableGroup[0]?.targetTable ?? null,
    };
  }

  private mapAuditLog(item: AuditLogWithAdmin): ApiAuditLog {
    return {
      id: item.id,
      adminId: item.adminId,
      admin: item.admin
        ? {
            id: item.admin.id,
            email: item.admin.email,
            username: item.admin.username,
            fullName: item.admin.fullName,
            roleCode: item.admin.role?.roleCode,
            department: item.admin.department,
          }
        : null,
      actionType: item.actionType as AuditActionType,
      targetTable: item.targetTable,
      targetId: item.targetId,
      permission: item.permission,
      performedRole: item.performedRole,
      oldValuesJson: item.oldValuesJson as Record<string, unknown> | null,
      newValuesJson: item.newValuesJson as Record<string, unknown> | null,
      ipAddress: item.ipAddress,
      userAgent: item.userAgent,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
