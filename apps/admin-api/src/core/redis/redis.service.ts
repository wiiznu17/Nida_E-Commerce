import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Redis } from 'ioredis';
import type { RedisSessionData } from '@repo/types';

interface MemoryItem {
  value: string;
  expiresAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export interface InviteTokenPayload {
  adminId: string;
  email: string;
  fullName: string;
  roleId: string;
  department?: string;
}

export interface ResetTokenPayload {
  adminId: string;
  email: string;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  private readonly memoryStore = new Map<string, MemoryItem>();
  private readonly memorySets = new Map<string, Set<string>>();

  onModuleInit(): void {
    const redisUrl = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST ?? 'localhost';
    const port = Number(process.env.REDIS_PORT ?? 6379);
    const password = process.env.REDIS_PASSWORD ?? 'redis123';

    try {
      const retryStrategy = (times: number) => {
        if (times > 3) {
          this.logger.warn(
            'Redis reconnection attempts exhausted, operating in memory fallback mode',
          );
          return null;
        }
        return Math.min(times * 200, 1000);
      };

      this.client = redisUrl
        ? new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy,
          })
        : new Redis({
            host,
            port,
            password: password.length > 0 ? password : undefined,
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy,
          });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Redis connected successfully to ${host}:${port}`);
      });

      this.client.on('error', (err: unknown) => {
        this.isConnected = false;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Redis connection error: ${msg}. Utilizing resilient in-memory fallback`,
        );
      });

      this.client.connect().catch((err: unknown) => {
        this.isConnected = false;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Initial Redis connection failed: ${msg}. In-memory store activated`,
        );
      });
    } catch (err: unknown) {
      this.isConnected = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to initialize Redis client: ${msg}. In-memory fallback engaged`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
    }
  }

  // REFRESH TOKEN SESSION MANAGEMENT

  async setSession(
    tokenId: string,
    data: RedisSessionData,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `admin:refresh:${tokenId}`;
    const payload = JSON.stringify(data);

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, payload, 'EX', ttlSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis setSession failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.set(key, {
      value: payload,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async getSession(tokenId: string): Promise<RedisSessionData | null> {
    const key = `admin:refresh:${tokenId}`;

    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as RedisSessionData;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis getSession failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return JSON.parse(item.value) as RedisSessionData;
  }

  async deleteSession(tokenId: string): Promise<void> {
    const key = `admin:refresh:${tokenId}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis deleteSession failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.delete(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Redis delByPattern failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    const escaped = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, '.*');
    const regex = new RegExp(`^${escaped}$`);
    for (const key of this.memoryStore.keys()) {
      if (regex.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  // USER MULTI-DEVICE SESSION TRACKING

  async addSessionToUser(adminId: string, tokenId: string): Promise<void> {
    const key = `admin:user_sessions:${adminId}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.sadd(key, tokenId);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis addSessionToUser failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    let set = this.memorySets.get(key);
    if (!set) {
      set = new Set<string>();
      this.memorySets.set(key, set);
    }
    set.add(tokenId);
  }

  async removeSessionFromUser(adminId: string, tokenId: string): Promise<void> {
    const key = `admin:user_sessions:${adminId}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.srem(key, tokenId);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis removeSessionFromUser failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const set = this.memorySets.get(key);
    if (set) {
      set.delete(tokenId);
    }
  }

  async getUserSessions(adminId: string): Promise<string[]> {
    const key = `admin:user_sessions:${adminId}`;

    if (this.isConnected && this.client) {
      try {
        return await this.client.smembers(key);
      } catch (err: unknown) {
        this.logger.warn(
          `Redis getUserSessions failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const set = this.memorySets.get(key);
    if (!set) return [];
    return Array.from(set);
  }

  async revokeAllUserSessions(adminId: string): Promise<void> {
    const tokens = await this.getUserSessions(adminId);
    const sessionKeys = tokens.map((t) => `admin:refresh:${t}`);
    const userSetKey = `admin:user_sessions:${adminId}`;

    if (this.isConnected && this.client) {
      try {
        const keysToDelete = [...sessionKeys, userSetKey];
        if (keysToDelete.length > 0) {
          await this.client.del(...keysToDelete);
        }
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis revokeAllUserSessions failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    for (const key of sessionKeys) {
      this.memoryStore.delete(key);
    }
    this.memorySets.delete(userSetKey);
  }

  // INVITATION ONE-TIME TOKENS

  async setInviteToken(
    token: string,
    data: InviteTokenPayload,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `admin:invite:${token}`;
    const payload = JSON.stringify(data);

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, payload, 'EX', ttlSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis setInviteToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.set(key, {
      value: payload,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async getInviteToken(token: string): Promise<InviteTokenPayload | null> {
    const key = `admin:invite:${token}`;

    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as InviteTokenPayload;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis getInviteToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return JSON.parse(item.value) as InviteTokenPayload;
  }

  async deleteInviteToken(token: string): Promise<void> {
    const key = `admin:invite:${token}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis deleteInviteToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.delete(key);
  }

  // PASSWORD RESET ONE-TIME TOKENS

  async setResetToken(
    token: string,
    data: ResetTokenPayload,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `admin:reset_password:${token}`;
    const payload = JSON.stringify(data);

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, payload, 'EX', ttlSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis setResetToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.set(key, {
      value: payload,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async getResetToken(token: string): Promise<ResetTokenPayload | null> {
    const key = `admin:reset_password:${token}`;

    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as ResetTokenPayload;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis getResetToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return JSON.parse(item.value) as ResetTokenPayload;
  }

  async deleteResetToken(token: string): Promise<void> {
    const key = `admin:reset_password:${token}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis deleteResetToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.delete(key);
  }

  // BRUTE-FORCE RATE LIMITING

  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const redisKey =
      key.startsWith('login:') ||
      key.startsWith('rl:') ||
      key.startsWith('global:')
        ? key
        : `login:rate:${key}`;

    if (this.isConnected && this.client) {
      try {
        const count = await this.client.incr(redisKey);
        if (count === 1) {
          await this.client.expire(redisKey, windowSeconds);
        }
        const ttl = await this.client.ttl(redisKey);

        return {
          allowed: count <= limit,
          remaining: Math.max(0, limit - count),
          retryAfter: ttl > 0 ? ttl : windowSeconds,
        };
      } catch (err: unknown) {
        this.logger.warn(
          `Redis checkRateLimit failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const now = Date.now();
    const item = this.memoryStore.get(redisKey);
    let currentCount = 1;
    let expiresAt = now + windowSeconds * 1000;

    if (item && now < item.expiresAt) {
      currentCount = Number(item.value) + 1;
      expiresAt = item.expiresAt;
    }

    this.memoryStore.set(redisKey, {
      value: String(currentCount),
      expiresAt,
    });

    const remainingSec = Math.max(1, Math.ceil((expiresAt - now) / 1000));

    return {
      allowed: currentCount <= limit,
      remaining: Math.max(0, limit - currentCount),
      retryAfter: remainingSec,
    };
  }

  async clearRateLimit(key: string): Promise<void> {
    const redisKey =
      key.startsWith('login:') ||
      key.startsWith('rl:') ||
      key.startsWith('global:')
        ? key
        : `login:rate:${key}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.del(redisKey);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis clearRateLimit failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.delete(redisKey);
  }

  // GENERIC CACHE METHODS

  async cacheGet<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        if (raw !== null) {
          return JSON.parse(raw) as T;
        }
        return null;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis cacheGet failed for ${key}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() >= item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    try {
      return JSON.parse(item.value) as T;
    } catch {
      return null;
    }
  }

  async cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis cacheSet failed for ${key}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async cacheDelByPattern(pattern: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.client.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100,
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.client.del(...keys);
          }
        } while (cursor !== '0');
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis cacheDelByPattern failed for ${pattern}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.memoryStore.keys()) {
      if (regex.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  async blacklistToken(token: string, exp: number): Promise<void> {
    const hash = createHash('sha256').update(token).digest('hex');
    const key = `jwt:bl:${hash}`;
    const remainingSeconds = Math.max(1, exp - Math.floor(Date.now() / 1000));

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, 'revoked', 'EX', remainingSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis blacklistToken failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.set(key, {
      value: 'revoked',
      expiresAt: Date.now() + remainingSeconds * 1000,
    });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const hash = createHash('sha256').update(token).digest('hex');
    const key = `jwt:bl:${hash}`;

    if (this.isConnected && this.client) {
      try {
        const result = await this.client.exists(key);
        return result === 1;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis isTokenBlacklisted failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return false;
    }
    return true;
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const key = `jwt:revoked_before:${userId}`;
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = 7 * 86400;

    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, String(now), 'EX', ttlSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis revokeAllUserTokens failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    this.memoryStore.set(key, {
      value: String(now),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async getUserRevocationTimestamp(userId: string): Promise<number | null> {
    const key = `jwt:revoked_before:${userId}`;

    if (this.isConnected && this.client) {
      try {
        const val = await this.client.get(key);
        if (!val) return null;
        const parsed = Number(val);
        return Number.isFinite(parsed) ? parsed : null;
      } catch (err: unknown) {
        this.logger.warn(
          `Redis getUserRevocationTimestamp failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    const parsed = Number(item.value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
