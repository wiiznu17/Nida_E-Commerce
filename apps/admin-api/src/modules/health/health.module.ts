import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [HealthController],
})
export class HealthModule {}
