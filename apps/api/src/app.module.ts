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
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    MailerModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          password: process.env.REDIS_PASSWORD ?? 'redis123',
          maxRetriesPerRequest: null,
        },
      }),
    }),
    CustomerAuthModule,
    CatalogModule,
    OrdersModule,
    AddressesModule,
    HealthModule,
    StoreContentModule,
    OrderLifecycleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
