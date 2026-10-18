import { Module } from '@nestjs/common';
import { StoreContentController } from './content.controller.js';
import { StoreContentService } from './content.service.js';

@Module({
  controllers: [StoreContentController],
  providers: [StoreContentService],
  exports: [StoreContentService],
})
export class StoreContentModule {}
