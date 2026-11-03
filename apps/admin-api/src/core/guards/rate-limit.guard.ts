import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RedisService } from '../redis/redis.service.js';
import {
  RATE_LIMIT_KEY,
  SKIP_RATE_LIMIT_KEY,
  type RateLimitOptions,
} from '../decorators/rate-limit.decorator.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipped = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isSkipped) {
      return true;
    }

    const routeOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Default to Tier 1: Global Safety Net (120 req / 60s per IP)
    const options: RateLimitOptions = routeOptions ?? {
      limit: 120,
      windowSeconds: 60,
      keyPrefix: 'global',
    };

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const identifier = options.getIdentifier ? options.getIdentifier(req) : ip;

    const rateKey = `${options.keyPrefix || 'global'}:${identifier}`;
    const rateCheck = await this.redis.checkRateLimit(
      rateKey,
      options.limit,
      options.windowSeconds,
    );

    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-RateLimit-Limit', options.limit);
      res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);
    }

    if (!rateCheck.allowed) {
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Retry-After', rateCheck.retryAfter);
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          errorCode: 'TOO_MANY_REQUESTS',
          message:
            options.message ||
            `คำขอถี่เกินไป กรุณารอ ${rateCheck.retryAfter} วินาทีก่อนลองใหม่อีกครั้ง (Rate limit exceeded. Please wait ${rateCheck.retryAfter} seconds.)`,
          details: {
            retryAfterSeconds: rateCheck.retryAfter,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
