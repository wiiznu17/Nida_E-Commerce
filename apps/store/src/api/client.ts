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

  // Token resolution: explicit parameter > customer localStorage session
  const token =
    explicitToken ??
    (typeof window !== 'undefined'
      ? localStorage.getItem('nida_customer_jwt_token')
      : null);

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

    // Handle silent refresh on 401 Unauthorized
    if (
      response.status === 401 &&
      !_isRetry &&
      !url.includes('/auth/refresh') &&
      !url.includes('/auth/logout') &&
      !url.includes('/auth/request-otp') &&
      !url.includes('/auth/verify-otp') &&
      typeof window !== 'undefined'
    ) {
      const storedRefreshToken = localStorage.getItem(
        'nida_customer_refresh_token',
      );
      if (storedRefreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (refreshRes.ok) {
            const rawJson = await refreshRes.json();
            const unwrap =
              rawJson && typeof rawJson === 'object' && 'data' in rawJson
                ? (
                    rawJson as {
                      data: { accessToken: string; refreshToken: string };
                    }
                  ).data
                : (rawJson as { accessToken: string; refreshToken: string });

            if (unwrap?.accessToken && unwrap?.refreshToken) {
              localStorage.setItem(
                'nida_customer_jwt_token',
                unwrap.accessToken,
              );
              localStorage.setItem(
                'nida_customer_refresh_token',
                unwrap.refreshToken,
              );

              // Retry original request with newly rotated token
              return await request<T>(endpoint, {
                ...options,
                token: unwrap.accessToken,
                _isRetry: true,
              });
            }
          }
        } catch {
          // Token rotation failed
        }

        // Clear session if refresh failed completely
        localStorage.removeItem('nida_customer_jwt_token');
        localStorage.removeItem('nida_customer_refresh_token');
        localStorage.removeItem('nida_customer_user_cache');
        window.dispatchEvent(new CustomEvent('nida:auth:session_expired'));
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
