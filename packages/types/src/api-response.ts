// ====================================================
// @repo/types — Generic API Response Wrappers
// ====================================================

/**
 * Standard successful API response wrapper.
 * ทุก endpoint คืนรูปแบบนี้เพื่อความสม่ำเสมอ
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated response สำหรับ list endpoints
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard error response
 */
export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Union type สำหรับ Frontend ที่รับทั้ง success และ error
 */
export type ApiResult<T> = ApiResponse<T> | ApiError;
