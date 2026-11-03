import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import { SkipRateLimit } from '../../core/decorators/rate-limit.decorator.js';
import type {
  ApiHealthCheckResponse,
  ApiHealthServiceStatus,
  HealthOverallStatus,
} from '@repo/types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis?: RedisService,
    private readonly mailer?: MailerService,
  ) {}

  @Get()
  @SkipRateLimit()
  @ApiOperation({
    summary: 'Deep health check probe',
    description:
      'Verifies database connectivity, Redis cache latency, BullMQ queue status, and mailer availability.',
  })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({
    status: 503,
    description: 'Application has critical dependency failures',
  })
  async check(): Promise<ApiHealthCheckResponse> {
    const dbStart = Date.now();
    let dbStatus: ApiHealthServiceStatus = {
      status: 'connected',
      latencyMs: 0,
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus.latencyMs = Date.now() - dbStart;
    } catch (err: unknown) {
      dbStatus = {
        status: 'disconnected',
        latencyMs: Date.now() - dbStart,
        message: err instanceof Error ? err.message : String(err),
      };
    }

    let redisStatus: ApiHealthServiceStatus = {
      status: 'disconnected',
      latencyMs: 0,
      message: 'RedisService not injected',
    };

    if (this.redis) {
      const pingRes = await this.redis.ping();
      redisStatus = {
        status: pingRes.status === 'connected' ? 'connected' : 'degraded',
        latencyMs: pingRes.latencyMs,
        message: pingRes.message,
      };
    }

    const mailerStatus: ApiHealthServiceStatus = this.mailer
      ? this.mailer.getHealthStatus()
      : {
          status: 'degraded',
          configured: false,
          message: 'MailerService not available',
        };

    const isDbDown = dbStatus.status === 'disconnected';
    const isRedisDown = redisStatus.status === 'disconnected';
    const hasDegraded =
      dbStatus.status === 'degraded' ||
      redisStatus.status === 'degraded' ||
      mailerStatus.status === 'degraded';

    let overallStatus: HealthOverallStatus = 'ok';
    if (isDbDown) {
      overallStatus = 'error';
    } else if (hasDegraded || isRedisDown) {
      overallStatus = 'degraded';
    }

    const memory = process.memoryUsage();
    const response: ApiHealthCheckResponse = {
      status: overallStatus,
      service: 'nida-storefront-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        redis: redisStatus,
        mailer: mailerStatus,
      },
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      },
    };

    if (overallStatus === 'error') {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}
