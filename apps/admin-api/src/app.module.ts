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
import { BullModule } from '@nestjs/bullmq';
import { AuditLogModule } from './modules/audit-log/audit-log.module.js';
import { ContentModule } from './modules/content/content.module.js';
import { OrderLifecycleModule } from './modules/order-lifecycle/index.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    MailerModule,
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
          try {
            const parsed = new URL(redisUrl);
            const isTls = parsed.protocol === 'rediss:';
            return {
              connection: {
                host: parsed.hostname,
                port: Number(parsed.port || (isTls ? 6380 : 6379)),
                username: parsed.username
                  ? decodeURIComponent(parsed.username)
                  : undefined,
                password: parsed.password
                  ? decodeURIComponent(parsed.password)
                  : undefined,
                tls: isTls ? { rejectUnauthorized: false } : undefined,
                maxRetriesPerRequest: null,
              },
            };
          } catch {
            // fallback to host/port
          }
        }
        return {
          connection: {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
            password: process.env.REDIS_PASSWORD ?? 'redis123',
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    AuthModule,
    AdminUsersModule,
    CatalogModule,
    CouponsModule,
    OrdersModule,
    AdminModule,
    HealthModule,
    UploadModule,
    AuditLogModule,
    ContentModule,
    OrderLifecycleModule,
    AnalyticsModule,
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
