// ====================================================
// PrismaModule — Global Database Module
// ====================================================
// ใช้ @Global() เพื่อให้ทุก Feature Module inject PrismaService ได้
// โดยไม่ต้อง import PrismaModule ซ้ำในแต่ละ module

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
