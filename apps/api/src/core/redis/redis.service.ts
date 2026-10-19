import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';

interface MemoryItem {
  value: string;
  expiresAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  private readonly memoryStore = new Map<string, MemoryItem>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const password = process.env.REDIS_PASSWORD;

    try {
      this.client = new Redis(redisUrl, {
        password: password || undefined,
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (err: unknown) => {
        this.isConnected = false;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Redis connection failed: ${msg}. Using in-memory fallback.`,
        );
      });

      if (this.client) {
        await this.client.connect().catch(() => {
          this.isConnected = false;
        });
      }
    } catch {
      this.isConnected = false;
      this.logger.warn(
        'Could not connect to Redis server. Operating in in-memory fallback mode.',
      );
    }

    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredMemoryItems(),
      60_000,
    );
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.client) {
      await this.client.quit().catch(() => {});
      this.client = null;
    }
  }

  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;

    if (this.isConnected && this.client) {
      try {
        const count = await this.client.incr(windowKey);
        if (count === 1) {
          await this.client.expire(windowKey, windowSeconds);
        }
        const remaining = Math.max(0, limit - count);
        return {
          allowed: count <= limit,
          remaining,
          retryAfter: windowSeconds,
        };
      } catch (err: unknown) {
        this.logger.warn(
          `Redis rate-limit check failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Memory Fallback
    const item = this.memoryStore.get(windowKey);
    let count = 1;
    if (item && item.expiresAt > Date.now()) {
      count = Number(item.value) + 1;
      item.value = String(count);
    } else {
      this.memoryStore.set(windowKey, {
        value: '1',
        expiresAt: Date.now() + windowSeconds * 1000,
      });
    }

    const remaining = Math.max(0, limit - count);
    return {
      allowed: count <= limit,
      remaining,
      retryAfter: windowSeconds,
    };
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err: unknown) {
        this.logger.warn(
          `Redis get failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    const item = this.memoryStore.get(key);
    if (item && item.expiresAt > Date.now()) {
      return item.value;
    }
    return null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis set failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    this.memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err: unknown) {
        this.logger.warn(
          `Redis del failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    this.memoryStore.delete(key);
  }

  async ttl(key: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.ttl(key);
      } catch (err: unknown) {
        this.logger.warn(
          `Redis ttl failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    const item = this.memoryStore.get(key);
    if (item && item.expiresAt > Date.now()) {
      return Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));
    }
    return -2;
  }

  private cleanupExpiredMemoryItems() {
    const now = Date.now();
    for (const [key, item] of this.memoryStore.entries()) {
      if (item.expiresAt <= now) {
        this.memoryStore.delete(key);
      }
    }
  }
}

