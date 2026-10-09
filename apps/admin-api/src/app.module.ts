import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { CouponsModule } from './modules/coupons/coupons.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PrismaModule,
    CatalogModule,
    CouponsModule,
    OrdersModule,
    AdminModule,
    HealthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
