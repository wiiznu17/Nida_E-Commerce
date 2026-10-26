import { PrismaClient } from '../../generated/prisma/index.js';
import { AdminRoleCode } from '@repo/types';

export async function seedDemoUsers(prisma: PrismaClient) {
  console.log('👤 Seeding Demo Staff Users (Dev only)...');

  const demoStaff = [
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

  for (const user of demoStaff) {
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
      console.log(`  • Demo Staff: ${user.email} (${user.roleCode})`);
    }
  }

  console.log('👤 Seeding Demo Customer Users (Dev only)...');
  const demoCustomerPasswordHash =
    '$2b$10$8HQhIcyxqjsoBIBq8yfWEuQlnnYBd/234ySY8Ak5AnbIqhmUNNWVO'; // Password123!

  await prisma.user.upsert({
    where: { email: 'phannida@nida.com' },
    update: { passwordHash: demoCustomerPasswordHash, isVerified: true },
    create: {
      email: 'phannida@nida.com',
      firstName: 'Phannida',
      lastName: 'Wissanu',
      phone: '0812345678',
      passwordHash: demoCustomerPasswordHash,
      isVerified: true,
      tier: 'VIP_GOLD',
      points: 1250,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: { passwordHash: demoCustomerPasswordHash, isVerified: true },
    create: {
      email: 'customer@example.com',
      firstName: 'Demo',
      lastName: 'Customer',
      phone: '0899999999',
      passwordHash: demoCustomerPasswordHash,
      isVerified: true,
      tier: 'REGULAR',
      points: 200,
    },
  });
  console.log('  • Demo Customers: phannida@nida.com / customer@example.com');
}
