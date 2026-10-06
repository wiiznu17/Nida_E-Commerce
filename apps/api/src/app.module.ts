// ====================================================
// AppModule — Root Module
// ====================================================
// รวมทุก Feature Module + Core Infrastructure
// PrismaModule เป็น @Global() จึง import ครั้งเดียวที่นี่

import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { CouponsModule } from './modules/coupons/coupons.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    // --- Core ---
    PrismaModule,

    // --- Feature Modules ---
    CatalogModule,
    CouponsModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
