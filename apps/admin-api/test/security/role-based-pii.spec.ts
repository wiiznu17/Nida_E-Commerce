import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { of } from 'rxjs';
import {
  AdminRoleCode,
  AdminPermission,
  AuditActionType,
  type ApiAdminUser,
} from '@repo/types';
import { RoleBasedPiiInterceptor } from '../../src/core/interceptors/role-based-pii.interceptor.js';
import { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';

describe('RoleBasedPiiInterceptor', () => {
  let interceptor: RoleBasedPiiInterceptor;
  let mockAuditLogService: { recordLog: ReturnType<typeof vi.fn> };

  const mockOrder = {
    id: 'ord-123',
    orderNumber: 'NIDA-20261103-TEST',
    totalAmount: 4900,
    customerEmail: 'customer@example.com',
    shippingAddress: {
      recipientName: 'Somchai Prasert',
      phone: '0812345678',
      addressLine1: '123/45 Sukhumvit 55',
      province: 'Bangkok',
      postalCode: '10110',
    },
    user: {
      email: 'customer@example.com',
      phone: '0812345678',
    },
  };

  beforeEach(() => {
    mockAuditLogService = {
      recordLog: vi.fn().mockResolvedValue({ id: 'log-1' }),
    };
    interceptor = new RoleBasedPiiInterceptor(
      mockAuditLogService as unknown as AuditLogService,
    );
  });

  function createMockContext(
    user: Partial<ApiAdminUser> | null,
    query: Record<string, string> = {},
  ): ExecutionContext {
    const request = {
      user,
      query,
      params: { orderNumber: 'NIDA-20261103-TEST' },
      ip: '198.51.100.2',
      headers: { 'user-agent': 'Vitest-Agent/1.0' },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  function createMockCallHandler(data: unknown): CallHandler {
    return {
      handle: () => of(data),
    };
  }

  it('masks customer PII by default on normal browse without recording audit log', async () => {
    const unprivilegedUser: Partial<ApiAdminUser> = {
      id: 'staff-1',
      role: {
        id: 'r-1',
        roleCode: AdminRoleCode.ORDER_MANAGER,
        roleName: 'Order Manager',
        permissions: [AdminPermission.ORDERS_READ],
      },
    };

    const context = createMockContext(unprivilegedUser, {});
    const handler = createMockCallHandler(mockOrder);

    const result = await new Promise((resolve, reject) => {
      interceptor.intercept(context, handler).subscribe({
        next: resolve,
        error: reject,
      });
    });

    const masked = result as typeof mockOrder;
    expect(masked.shippingAddress.phone).toBe('081-***-5678');
    expect(masked.shippingAddress.addressLine1).toBe('*** Sukhumvit 55');
    expect(masked.customerEmail).toBe('cu***@example.com');
    expect(masked.user.phone).toBe('081-***-5678');
    expect(masked.totalAmount).toBe(4900);

    expect(mockAuditLogService.recordLog).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when an unprivileged admin attempts revealPii=true', async () => {
    const unprivilegedUser: Partial<ApiAdminUser> = {
      id: 'staff-1',
      role: {
        id: 'r-1',
        roleCode: AdminRoleCode.ORDER_MANAGER,
        roleName: 'Order Manager',
        permissions: [AdminPermission.ORDERS_READ],
      },
    };

    const context = createMockContext(unprivilegedUser, { revealPii: 'true' });
    const handler = createMockCallHandler(mockOrder);

    expect(() => interceptor.intercept(context, handler)).toThrowError(
      ForbiddenException,
    );
    expect(mockAuditLogService.recordLog).not.toHaveBeenCalled();
  });

  it('allows Super Admin with revealPii=true to see unmasked PII and records AuditLog', async () => {
    const superAdminUser: Partial<ApiAdminUser> = {
      id: 'super-admin-1',
      role: {
        id: 'r-super',
        roleCode: AdminRoleCode.SUPER_ADMIN,
        roleName: 'Super Administrator',
        permissions: Object.values(AdminPermission),
      },
    };

    const context = createMockContext(superAdminUser, { revealPii: 'true' });
    const handler = createMockCallHandler(mockOrder);

    const result = await new Promise((resolve, reject) => {
      interceptor.intercept(context, handler).subscribe({
        next: resolve,
        error: reject,
      });
    });

    const unmasked = result as typeof mockOrder;
    expect(unmasked.shippingAddress.phone).toBe('0812345678');
    expect(unmasked.shippingAddress.addressLine1).toBe('123/45 Sukhumvit 55');
    expect(unmasked.customerEmail).toBe('customer@example.com');

    expect(mockAuditLogService.recordLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'super-admin-1',
        actionType: AuditActionType.READ,
        targetTable: 'orders',
        targetId: 'NIDA-20261103-TEST',
        permission: AdminPermission.CUSTOMERS_PII_READ,
        performedRole: AdminRoleCode.SUPER_ADMIN,
        ipAddress: '198.51.100.2',
      }),
    );
  });

  it('allows staff with explicit CUSTOMERS_PII_READ permission with revealPii=true', async () => {
    const privilegedStaff: Partial<ApiAdminUser> = {
      id: 'cs-lead-1',
      role: {
        id: 'r-cs',
        roleCode: 'CS_LEAD',
        roleName: 'Customer Support Lead',
        permissions: [
          AdminPermission.ORDERS_READ,
          AdminPermission.CUSTOMERS_PII_READ,
        ],
      },
    };

    const context = createMockContext(privilegedStaff, { revealPii: 'true' });
    const handler = createMockCallHandler(mockOrder);

    const result = await new Promise((resolve, reject) => {
      interceptor.intercept(context, handler).subscribe({
        next: resolve,
        error: reject,
      });
    });

    const unmasked = result as typeof mockOrder;
    expect(unmasked.shippingAddress.phone).toBe('0812345678');

    expect(mockAuditLogService.recordLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'cs-lead-1',
        actionType: AuditActionType.READ,
        targetTable: 'orders',
        targetId: 'NIDA-20261103-TEST',
        permission: AdminPermission.CUSTOMERS_PII_READ,
      }),
    );
  });

  it('masks paginated order items correctly', async () => {
    const paginatedOrders = {
      items: [mockOrder],
      total: 1,
      page: 1,
      pageSize: 10,
    };

    const context = createMockContext(null, {});
    const handler = createMockCallHandler(paginatedOrders);

    const result = await new Promise((resolve, reject) => {
      interceptor.intercept(context, handler).subscribe({
        next: resolve,
        error: reject,
      });
    });

    const res = result as typeof paginatedOrders;
    expect(res.items[0]?.shippingAddress.phone).toBe('081-***-5678');
    expect(res.items[0]?.shippingAddress.addressLine1).toBe('*** Sukhumvit 55');
  });

  describe('Analytics Data Export Audit Logging', () => {
    it('records AuditActionType.EXPORT with targetTable and metadata', async () => {
      const { AnalyticsController } =
        await import('../../src/modules/analytics/analytics.controller.js');
      const mockAnalyticsService = {
        exportOrders: vi
          .fn()
          .mockResolvedValue('orderNumber,amount\nNIDA-1,100'),
        exportProducts: vi.fn().mockResolvedValue('sku,name\nSKU-1,Item'),
      };

      const controller = new AnalyticsController(
        mockAnalyticsService as never,
        mockAuditLogService as never,
      );

      const adminUser: Partial<ApiAdminUser> = {
        id: 'admin-exporter',
        role: {
          id: 'r-1',
          roleCode: AdminRoleCode.SUPER_ADMIN,
          roleName: 'Super Administrator',
          permissions: [AdminPermission.ORDERS_READ],
        },
      };

      const mockReq = {
        ip: '203.0.113.195',
        headers: { 'user-agent': 'Chrome/Export' },
      };

      await controller.exportOrders(
        {} as never,
        adminUser as ApiAdminUser,
        mockReq as never,
      );

      expect(mockAuditLogService.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-exporter',
          actionType: AuditActionType.EXPORT,
          targetTable: 'orders',
          targetId: 'csv_export',
          ipAddress: '203.0.113.195',
        }),
      );
    });
  });
});
