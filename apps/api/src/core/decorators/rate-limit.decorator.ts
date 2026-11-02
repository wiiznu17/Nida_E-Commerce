import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

export const RATE_LIMIT_KEY = 'RATE_LIMIT_KEY';
export const SKIP_RATE_LIMIT_KEY = 'SKIP_RATE_LIMIT_KEY';

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  keyPrefix?: string; // key ที่จะใช้ใน redis
  message?: string; // message ที่จะส่งไปตอน rate limit
  getIdentifier?: (req: Request) => string; // ฟังก์ชันที่จะใช้ในการระบุตัวตน
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true); //

