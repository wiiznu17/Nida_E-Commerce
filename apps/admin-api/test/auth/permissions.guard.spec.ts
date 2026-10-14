import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../../src/modules/auth/guards/permissions.guard.js';
import { AdminPermission, AdminRoleCode, type ApiAdminUser } from '@repo/types';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const createMockContext = (user?: ApiAdminUser): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: vi.fn(),
        getNext: vi.fn(),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('allows access when no permissions are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext();

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('allows access when required permissions list is empty', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createMockContext();

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('denies access when user is not authenticated', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminPermission.CATALOG_READ]);
    const context = createMockContext(undefined);

    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(false);
  });

  it('unconditionally allows SUPER_ADMIN regardless of required permissions', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      AdminPermission.CATALOG_WRITE,
      AdminPermission.ADMIN_USERS_MANAGE,
    ]);

    const superAdminUser: ApiAdminUser = {
      id: 'admin-1',
      username: 'thanakorn',
      email: 'thanakorn@nida.co.th',
      fullName: 'Thanakorn Admin',
      department: 'Executive',
      role: {
        id: 'role-1',
        roleCode: AdminRoleCode.SUPER_ADMIN,
        roleName: 'Super Administrator',
        description: 'Full access',
        permissions: [],
      },
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const context = createMockContext(superAdminUser);
    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('allows access when user possesses all required permissions', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      AdminPermission.INVENTORY_READ,
      AdminPermission.INVENTORY_ADJUST,
    ]);

    const inventoryUser: ApiAdminUser = {
      id: 'admin-2',
      username: 'inventory_mgr',
      email: 'inventory@nida.co.th',
      fullName: 'Inventory Manager',
      department: 'Logistics',
      role: {
        id: 'role-2',
        roleCode: AdminRoleCode.INVENTORY_MANAGER,
        roleName: 'Inventory Manager',
        description: 'Stock management',
        permissions: [
          AdminPermission.CATALOG_READ,
          AdminPermission.INVENTORY_READ,
          AdminPermission.INVENTORY_ADJUST,
          AdminPermission.ORDERS_READ,
        ],
      },
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const context = createMockContext(inventoryUser);
    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('denies access when user lacks any required permission', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      AdminPermission.COUPONS_MANAGE,
    ]);

    const inventoryUser: ApiAdminUser = {
      id: 'admin-2',
      username: 'inventory_mgr',
      email: 'inventory@nida.co.th',
      fullName: 'Inventory Manager',
      department: 'Logistics',
      role: {
        id: 'role-2',
        roleCode: AdminRoleCode.INVENTORY_MANAGER,
        roleName: 'Inventory Manager',
        description: 'Stock management',
        permissions: [
          AdminPermission.CATALOG_READ,
          AdminPermission.INVENTORY_READ,
          AdminPermission.INVENTORY_ADJUST,
        ],
      },
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const context = createMockContext(inventoryUser);
    const canActivate = guard.canActivate(context);

    expect(canActivate).toBe(false);
  });
});
