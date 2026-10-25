import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { RedisModule } from './core/redis/redis.module.js';
import { MailerModule } from './core/mailer/mailer.module.js';
import { CustomerAuthModule } from './modules/auth/auth.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { AddressesModule } from './modules/addresses/addresses.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { StoreContentModule } from './modules/content/content.module.js';
import { OrderLifecycleModule } from './modules/order-lifecycle/index.js';
import { WishlistModule } from './modules/wishlist/wishlist.module.js';
import { CouponsModule } from './modules/coupons/coupons.module.js';
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
    CustomerAuthModule,
    CatalogModule,
    OrdersModule,
    AddressesModule,
    HealthModule,
    StoreContentModule,
    OrderLifecycleModule,
    WishlistModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
