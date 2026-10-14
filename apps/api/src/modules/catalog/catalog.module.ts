import { Module } from '@nestjs/common';
import { CustomerCatalogController } from './catalog.controller.js';
import { CustomerCatalogService } from './catalog.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerCatalogController],
  providers: [CustomerCatalogService],
  exports: [CustomerCatalogService],
})
export class CatalogModule {}
