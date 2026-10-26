import { PrismaClient } from '../../generated/prisma/index.js';
import {
  AdminRoleCode,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_DEFINITIONS,
} from '@repo/types';

export async function syncRbac(prisma: PrismaClient) {
  console.log('🛡️  Syncing RBAC Permissions and Roles (Pure Master Data)...');

  // Upsert all system permissions
  const permissionMap: Record<string, string> = {};
  for (const def of PERMISSION_DEFINITIONS) {
    const perm = await prisma.permission.upsert({
      where: { permissionCode: def.code },
      update: {
        module: def.module,
        description: def.descriptionKey,
      },
      create: {
        permissionCode: def.code,
        module: def.module,
        description: def.descriptionKey,
      },
    });
    permissionMap[def.code] = perm.id;
  }
  console.log(`✅ Upserted ${PERMISSION_DEFINITIONS.length} permissions.`);

  // Roles metadata
  const roleMetadata: Record<
    AdminRoleCode,
    { name: string; description: string }
  > = {
    [AdminRoleCode.SUPER_ADMIN]: {
      name: 'Super Administrator',
      description: 'Full system control, settings, and staff administration',
    },
    [AdminRoleCode.INVENTORY_MANAGER]: {
      name: 'Inventory & Warehouse Manager',
      description:
        'Manages stock balance, inventory movements, and warehouse restock',
    },
    [AdminRoleCode.ORDER_MANAGER]: {
      name: 'Order & Fulfillment Officer',
      description:
        'Manages customer orders, shipments, tracking, and fulfillment',
    },
    [AdminRoleCode.MARKETING_ADMIN]: {
      name: 'Marketing & Promotions Admin',
      description: 'Manages coupons, marketing tags, discounts, and campaigns',
    },
  };

  // Upsert Roles & RolePermissions
  for (const [roleCodeKey, permissions] of Object.entries(
    ROLE_DEFAULT_PERMISSIONS,
  )) {
    const roleCode = roleCodeKey as AdminRoleCode;
    const meta = roleMetadata[roleCode];

    const role = await prisma.role.upsert({
      where: { roleCode },
      update: {
        roleName: meta.name,
        description: meta.description,
      },
      create: {
        roleCode,
        roleName: meta.name,
        description: meta.description,
      },
    });

    // Clean existing role permissions and re-link with defined permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    const rolePermissionsData = permissions.map((p) => ({
      roleId: role.id,
      permissionId: permissionMap[p],
    }));

    await prisma.rolePermission.createMany({
      data: rolePermissionsData,
      skipDuplicates: true,
    });

    console.log(
      `  • Role [${roleCode}] linked with ${permissions.length} permissions`,
    );
  }

  console.log('✨ RBAC synchronization completed successfully (no demo users injected).');
}
