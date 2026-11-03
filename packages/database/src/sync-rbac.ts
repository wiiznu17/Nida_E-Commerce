import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';
import { syncRbac } from './seeds/common/seed-rbac.js';

const prisma = new PrismaClient();

async function main() {
  await syncRbac(prisma);
}

main()
  .catch((e) => {
    console.error('❌ RBAC sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

