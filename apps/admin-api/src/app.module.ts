import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { RedisModule } from './core/redis/redis.module.js';
import { MailerModule } from './core/mailer/mailer.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard.js';
import { AdminUsersModule } from './modules/admin-users/admin-users.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { CouponsModule } from './modules/coupons/coupons.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { AuditLogModule } from './modules/audit-log/audit-log.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    MailerModule,
    AuthModule,
    AdminUsersModule,
    CatalogModule,
    CouponsModule,
    OrdersModule,
    AdminModule,
    HealthModule,
    UploadModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
