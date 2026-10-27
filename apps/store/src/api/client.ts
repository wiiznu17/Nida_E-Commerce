/**
 * Core HTTP API Client for Nida Customer Storefront
 *
 * Pattern: Centralized request wrapper with base URL handling,
 * header management, JWT token injection, query parameter serialization,
 * silent token refresh rotation on HTTP 401, and unified ApiError response handling.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export class ApiError<T = unknown> extends Error {
  status?: number;
  data?: T;

  constructor(message: string, status?: number, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
  _isRetry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshCustomerToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  const storedRefreshToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('nida_customer_refresh_token')
      : null;

  if (!storedRefreshToken) {
    isRefreshing = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nida_customer_jwt_token');
      localStorage.removeItem('nida_customer_refresh_token');
      localStorage.removeItem('nida_customer_user_cache');
      window.dispatchEvent(new CustomEvent('nida:auth:session_expired'));
    }
    throw new ApiError('Session has expired, please log in', 401);
  }

  try {
    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!refreshRes.ok) {
      throw new Error('Refresh token rejected');
    }

    const rawJson = await refreshRes.json();
    const unwrap =
      rawJson && typeof rawJson === 'object' && 'data' in rawJson
        ? (rawJson as { data: { accessToken: string; refreshToken: string } })
            .data
        : (rawJson as { accessToken: string; refreshToken: string });

    if (!unwrap?.accessToken || !unwrap?.refreshToken) {
      throw new Error('Invalid refresh response payload');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_customer_jwt_token', unwrap.accessToken);
      localStorage.setItem('nida_customer_refresh_token', unwrap.refreshToken);
      window.dispatchEvent(
        new CustomEvent('nida:auth:token_rotated', {
          detail: {
            accessToken: unwrap.accessToken,
            refreshToken: unwrap.refreshToken,
          },
        }),
      );
    }

    processQueue(null, unwrap.accessToken);
    return unwrap.accessToken;
  } catch (refreshErr: unknown) {
    processQueue(refreshErr, null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nida_customer_jwt_token');
      localStorage.removeItem('nida_customer_refresh_token');
      localStorage.removeItem('nida_customer_user_cache');
      window.dispatchEvent(new CustomEvent('nida:auth:session_expired'));
    }
    throw new ApiError('Session expired, please sign in again', 401);
  } finally {
    isRefreshing = false;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    params,
    headers = {},
    token: explicitToken,
    _isRetry,
    ...rest
  } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Token resolution: freshest localStorage token > explicit parameter
  const token =
    (typeof window !== 'undefined'
      ? localStorage.getItem('nida_customer_jwt_token')
      : null) ?? explicitToken;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: defaultHeaders,
    });

    // Handle silent refresh on 401 Unauthorized using singleton lock queue
    if (
      response.status === 401 &&
      !_isRetry &&
      !url.includes('/auth/refresh') &&
      !url.includes('/auth/logout') &&
      !url.includes('/auth/request-otp') &&
      !url.includes('/auth/verify-otp') &&
      typeof window !== 'undefined'
    ) {
      try {
        const newAccessToken = await refreshCustomerToken();
        // Retry original request with newly rotated token
        return await request<T>(endpoint, {
          ...options,
          token: newAccessToken,
          _isRetry: true,
        });
      } catch (err: unknown) {
        throw err instanceof ApiError
          ? err
          : new ApiError('Session expired, please sign in again', 401);
      }
    }

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');

    let bodyData: unknown = null;
    if (isJson) {
      try {
        bodyData = await response.json();
      } catch {
        // Fallback to text or empty object
      }
    } else {
      try {
        bodyData = await response.text();
      } catch {
        // Fallback
      }
    }

    if (response.ok) {
      // Auto-unwrap NestJS standard response wrapper `{ data: ... }` if present
      if (
        bodyData &&
        typeof bodyData === 'object' &&
        'data' in bodyData &&
        !('pagination' in bodyData)
      ) {
        return (bodyData as { data: T }).data;
      }
      return bodyData as T;
    }

    // Handle HTTP error response
    let errorMessage = `HTTP error ${response.status}`;
    if (bodyData && typeof bodyData === 'object') {
      const errorObj = bodyData as Record<string, unknown>;
      if (typeof errorObj.message === 'string') {
        errorMessage = errorObj.message;
      } else if (
        Array.isArray(errorObj.message) &&
        errorObj.message.length > 0
      ) {
        errorMessage = String(errorObj.message[0]);
      }
    }

    throw new ApiError(errorMessage, response.status, bodyData);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    const networkMsg =
      err instanceof Error ? err.message : `Network connection error to ${url}`;
    throw new ApiError(networkMsg, 0);
  }
}

export const apiClient = {
  get: <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    token?: string | null,
  ) => request<T>(endpoint, { method: 'GET', params, token }),

  post: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      token,
    }),

  put: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      token,
    }),

  patch: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      token,
    }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
