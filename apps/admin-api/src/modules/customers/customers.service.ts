import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import {
  AccountStatus,
  MembershipTier,
  OrderStatus,
  AuditActionType,
  AdminPermission,
  type ApiAdminCustomerListItem,
  type ApiAdminCustomerDetail,
  type ApiAdminCustomerStats,
} from '@repo/types';
import type {
  AdminCustomerQueryInput,
  UpdateAccountStatusInput,
} from '@repo/validators';
import { Prisma } from '@repo/database';

export interface PaginatedCustomersResult {
  items: ApiAdminCustomerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly auditLog: AuditLogService,
  ) {}

  async getCustomers(
    query: AdminCustomerQueryInput,
  ): Promise<PaginatedCustomersResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.tier) {
      where.tier = query.tier;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    if (query.sortBy === 'fullName') {
      orderBy = [
        { firstName: query.sortOrder },
        { lastName: query.sortOrder },
      ];
    } else if (query.sortBy === 'points') {
      orderBy = { points: query.sortOrder };
    } else if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder };
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          orders: {
            select: {
              status: true,
              totalAmount: true,
            },
          },
        },
      }),
    ]);

    const items: ApiAdminCustomerListItem[] = users.map((user) => {
      const validOrders = user.orders.filter(
        (o) => o.status !== OrderStatus.CANCELLED,
      );
      const totalSpent = validOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0,
      );
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || 'N/A';

      return {
        id: user.id,
        email: user.email,
        phone: user.phone ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        fullName,
        tier: user.tier,
        points: user.points,
        status: user.status,
        statusReason: user.statusReason ?? null,
        suspendedAt: user.suspendedAt?.toISOString() ?? null,
        suspendedUntil: user.suspendedUntil?.toISOString() ?? null,
        ordersCount: validOrders.length,
        totalSpent,
        createdAt: user.createdAt.toISOString(),
      };
    });

    if (query.sortBy === 'totalSpent') {
      items.sort((a, b) =>
        query.sortOrder === 'asc'
          ? a.totalSpent - b.totalSpent
          : b.totalSpent - a.totalSpent,
      );
    } else if (query.sortBy === 'ordersCount') {
      items.sort((a, b) =>
        query.sortOrder === 'asc'
          ? a.ordersCount - b.ordersCount
          : b.ordersCount - a.ordersCount,
      );
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getCustomerStats(): Promise<ApiAdminCustomerStats> {
    const [total, active, suspended, banned, vipCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: AccountStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: AccountStatus.SUSPENDED } }),
      this.prisma.user.count({ where: { status: AccountStatus.BANNED } }),
      this.prisma.user.count({
        where: {
          tier: {
            in: [MembershipTier.VIP_GOLD, MembershipTier.PLATINUM],
          },
        },
      }),
    ]);

    return {
      total,
      active,
      suspended,
      banned,
      vipCount,
    };
  }

  async getCustomerById(id: string): Promise<ApiAdminCustomerDetail> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          take: 5,
          orderBy: { placedAt: 'desc' },
          include: {
            payment: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลลูกค้า');
    }

    const allOrders = await this.prisma.order.findMany({
      where: { userId: id },
      select: {
        status: true,
        totalAmount: true,
      },
    });

    const validOrders = allOrders.filter(
      (o) => o.status !== OrderStatus.CANCELLED,
    );
    const totalSpent = validOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'N/A';

    return {
      id: user.id,
      email: user.email,
      phone: user.phone ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      fullName,
      tier: user.tier,
      points: user.points,
      status: user.status,
      statusReason: user.statusReason ?? null,
      suspendedAt: user.suspendedAt?.toISOString() ?? null,
      suspendedUntil: user.suspendedUntil?.toISOString() ?? null,
      ordersCount: validOrders.length,
      totalSpent,
      createdAt: user.createdAt.toISOString(),
      addresses: user.addresses.map((a) => ({
        id: a.id,
        recipientName: a.recipientName,
        phone: a.phone,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2 ?? undefined,
        subdistrict: a.subdistrict,
        district: a.district,
        province: a.province,
        postalCode: a.postalCode,
        isDefault: a.isDefault,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      recentOrders: user.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.payment?.status ?? 'UNKNOWN',
        totalAmount: Number(o.totalAmount),
        createdAt: o.placedAt.toISOString(),
      })),
    };
  }

  async updateCustomerStatus(
    currentAdminId: string,
    customerId: string,
    dto: UpdateAccountStatusInput,
    currentAdminRoleCode?: string | null,
  ): Promise<ApiAdminCustomerListItem> {
    const user = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลลูกค้า');
    }

    let suspendedAt: Date | null = null;
    let suspendedUntil: Date | null = null;

    if (dto.status === AccountStatus.SUSPENDED) {
      suspendedAt = new Date();
      if (dto.durationMinutes && dto.durationMinutes > 0) {
        suspendedUntil = new Date(
          Date.now() + dto.durationMinutes * 60 * 1000,
        );
      }
    } else if (dto.status === AccountStatus.ACTIVE) {
      suspendedAt = null;
      suspendedUntil = null;
    }

    const updated = await this.prisma.user.update({
      where: { id: customerId },
      data: {
        status: dto.status,
        statusReason: dto.statusReason.trim(),
        suspendedAt,
        suspendedUntil,
      },
      include: {
        orders: {
          select: {
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (updated.status !== AccountStatus.ACTIVE) {
      await Promise.all([
        this.redis.revokeAllCustomerSessions(customerId),
        this.redis.revokeAllUserTokens(customerId),
      ]);
    }

    void this.auditLog.recordLog({
      adminId: currentAdminId,
      actionType: AuditActionType.STATUS_CHANGE,
      targetTable: 'users',
      targetId: updated.id,
      permission: AdminPermission.ADMIN_USERS_MANAGE,
      performedRole: currentAdminRoleCode ?? null,
      oldValuesJson: {
        status: user.status,
        statusReason: user.statusReason ?? null,
        email: user.email,
      },
      newValuesJson: {
        status: updated.status,
        statusReason: updated.statusReason,
        suspendedAt: updated.suspendedAt?.toISOString() ?? null,
        suspendedUntil: updated.suspendedUntil?.toISOString() ?? null,
      },
    });

    const validOrders = updated.orders.filter(
      (o) => o.status !== OrderStatus.CANCELLED,
    );
    const totalSpent = validOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const fullName = [updated.firstName, updated.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'N/A';

    return {
      id: updated.id,
      email: updated.email,
      phone: updated.phone ?? null,
      firstName: updated.firstName ?? null,
      lastName: updated.lastName ?? null,
      fullName,
      tier: updated.tier,
      points: updated.points,
      status: updated.status,
      statusReason: updated.statusReason ?? null,
      suspendedAt: updated.suspendedAt?.toISOString() ?? null,
      suspendedUntil: updated.suspendedUntil?.toISOString() ?? null,
      ordersCount: validOrders.length,
      totalSpent,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
