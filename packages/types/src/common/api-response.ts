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
  issues?: string[];
  details?: Record<string, unknown>;
}
