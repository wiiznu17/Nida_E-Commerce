import { PrismaClient } from './generated/prisma/index.js';
import {
  AdminPermission,
  AdminRoleCode,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_DEFINITIONS,
} from '@repo/types';

export async function syncRbac(prisma: PrismaClient) {
  console.log('🛡️  Syncing RBAC Permissions and Roles...');

  // 1. Upsert all permissions
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

  // 2. Roles metadata
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
      description: 'Manages stock balance, inventory movements, and warehouse restock',
    },
    [AdminRoleCode.ORDER_MANAGER]: {
      name: 'Order & Fulfillment Officer',
      description: 'Manages customer orders, shipments, tracking, and fulfillment',
    },
    [AdminRoleCode.MARKETING_ADMIN]: {
      name: 'Marketing & Promotions Admin',
      description: 'Manages coupons, marketing tags, discounts, and campaigns',
    },
  };

  // 3. Upsert Roles & RolePermissions
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

    // Clean existing role permissions and re-link
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

  // 4. Ensure demo staff users exist for testing
  const demoUsers = [
    {
      username: 'inventory_mgr',
      email: 'inventory@nida-apparel.com',
      fullName: 'Somchai Inventory',
      department: 'Warehouse & Logistics',
      roleCode: AdminRoleCode.INVENTORY_MANAGER,
    },
    {
      username: 'order_officer',
      email: 'fulfillment@nida-apparel.com',
      fullName: 'Areeya Fulfillment',
      department: 'Order Processing',
      roleCode: AdminRoleCode.ORDER_MANAGER,
    },
    {
      username: 'marketing_mgr',
      email: 'marketing@nida-apparel.com',
      fullName: 'Panida Marketing',
      department: 'Brand Marketing',
      roleCode: AdminRoleCode.MARKETING_ADMIN,
    },
  ];

  for (const user of demoUsers) {
    const role = await prisma.role.findUnique({
      where: { roleCode: user.roleCode },
    });
    if (role) {
      await prisma.adminUser.upsert({
        where: { email: user.email },
        update: {
          fullName: user.fullName,
          department: user.department,
          roleId: role.id,
        },
        create: {
          username: user.username,
          email: user.email,
          passwordHash:
            '$2b$10$/45cqjrkP0Gy4P0tjZeBJe5XyQ0u1vpEhkTI1A14DnM2Y9Kxa6dL.', // admin123
          fullName: user.fullName,
          department: user.department,
          roleId: role.id,
        },
      });
    }
  }

  console.log('✨ RBAC synchronization completed successfully.');
}

if (process.argv[1]?.endsWith('seed-rbac.ts')) {
  const prisma = new PrismaClient();
  syncRbac(prisma)
    .catch((err) => {
      console.error('Failed to sync RBAC:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
