import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module.js';
import { RedisModule } from './core/redis/redis.module.js';
import { MailerModule } from './core/mailer/mailer.module.js';
import { CustomerAuthModule } from './modules/auth/auth.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { AddressesModule } from './modules/addresses/addresses.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { StoreContentModule } from './modules/content/content.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    MailerModule,
    CustomerAuthModule,
    CatalogModule,
    OrdersModule,
    AddressesModule,
    HealthModule,
    StoreContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
