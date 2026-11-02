import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { SkipRateLimit } from '../../core/decorators/rate-limit.decorator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @SkipRateLimit()
  @ApiOperation({ summary: 'Health check probe' })
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      service: 'nida-storefront-api',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };
  }
}
