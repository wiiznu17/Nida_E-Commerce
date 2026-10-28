import bcrypt from 'bcryptjs';
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
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const rawPasswordHash = process.env.INITIAL_ADMIN_PASSWORD_HASH;

  let effectivePasswordHash = rawPasswordHash?.trim();
  if (rawPassword && rawPassword.trim()) {
    effectivePasswordHash = await bcrypt.hash(rawPassword.trim(), 10);
  }

  if (isProduction && !effectivePasswordHash) {
    throw new Error(
      '🚨 SECURITY VIOLATION: INITIAL_ADMIN_PASSWORD (or INITIAL_ADMIN_PASSWORD_HASH) is required in production environment!\n' +
        'Please configure INITIAL_ADMIN_PASSWORD in your environment before seeding production.',
    );
  }

  // Non-production fallback (e.g. local staging/dev testing)
  if (!effectivePasswordHash) {
    console.warn(
      '⚠️  [SECURITY NOTICE] Using fallback password ("admin123") because neither INITIAL_ADMIN_PASSWORD nor INITIAL_ADMIN_PASSWORD_HASH was provided. Ensure this is NOT a production deployment.',
    );
    effectivePasswordHash =
      '$2b$10$/45cqjrkP0Gy4P0tjZeBJe5XyQ0u1vpEhkTI1A14DnM2Y9Kxa6dL.'; // admin123
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
