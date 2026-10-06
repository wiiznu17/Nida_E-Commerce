// ====================================================
// TransformInterceptor — Unified Success Response
// ====================================================
// ครอบทุก response สำเร็จด้วย { success: true, data: ... }
// เพื่อให้ Frontend มั่นใจว่าทุก response จะมีรูปแบบเดียวกัน
//
// ถ้า Controller return ค่าที่มี `data` + `pagination` อยู่แล้ว
// จะ pass-through โดยไม่ wrap ซ้ำ (สำหรับ PaginatedResponse)

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { ApiResponse } from '@repo/types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If already wrapped (e.g. PaginatedResponse), pass through
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as Record<string, unknown>)['success'] === true
        ) {
          return data as unknown as ApiResponse<T>;
        }

        return {
          success: true as const,
          data,
        };
      }),
    );
  }
}
