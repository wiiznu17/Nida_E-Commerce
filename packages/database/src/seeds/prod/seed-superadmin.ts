import { PrismaClient } from '../../generated/prisma/index.js';

export async function seedSuperAdmin(prisma: PrismaClient) {
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { roleCode: 'SUPER_ADMIN' },
  });

  const existingSuperAdmin = await prisma.adminUser.findFirst({
    where: { roleId: superAdminRole.id },
  });

  if (existingSuperAdmin) {
    console.log(
      `ℹ️  Super Admin already exists: ${existingSuperAdmin.email}. Skipping creation.`,
    );
    return existingSuperAdmin;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail =
    process.env.INITIAL_ADMIN_EMAIL ?? 'admin@nida-apparel.com';
  const adminUsername = process.env.INITIAL_ADMIN_USERNAME ?? 'superadmin';
  const passwordHash = process.env.INITIAL_ADMIN_PASSWORD_HASH;

  if (isProduction && !passwordHash) {
    throw new Error(
      '🚨 SECURITY VIOLATION: INITIAL_ADMIN_PASSWORD_HASH is required in production environment!\n' +
        'Please generate a secure bcrypt hash and configure INITIAL_ADMIN_PASSWORD_HASH in your environment before seeding production.',
    );
  }

  // Non-production fallback (e.g. local staging/dev testing)
  const effectivePasswordHash =
    passwordHash ??
    '$2b$10$/45cqjrkP0Gy4P0tjZeBJe5XyQ0u1vpEhkTI1A14DnM2Y9Kxa6dL.'; // admin123

  if (!passwordHash) {
    console.warn(
      '⚠️  [SECURITY NOTICE] Using fallback password ("admin123") because INITIAL_ADMIN_PASSWORD_HASH was not provided. Ensure this is NOT a production deployment.',
    );
  }

  const createdAdmin = await prisma.adminUser.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      passwordHash: effectivePasswordHash,
      fullName: 'NIDA Super Administrator',
      department: 'Executive HQ',
      roleId: superAdminRole.id,
    },
  });

  console.log(
    `✅ Created initial Super Admin: ${createdAdmin.email} (${createdAdmin.username})`,
  );
  return createdAdmin;
}
