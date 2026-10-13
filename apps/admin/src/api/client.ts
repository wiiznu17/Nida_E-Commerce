/**
 * Core HTTP API Client for Nida Admin
 *
 * Best Practice: Centralized request wrapper with base URL handling,
 * header management, response extraction, silent refresh with rotation,
 * and concurrent request queueing.
 */

import { API_BASE_URL } from '../config';

export { API_BASE_URL };

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

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
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

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('nida_auth_token') : null;

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

    // Check for HTTP 401 Unauthorized for silent refresh
    const isAuthBypassEndpoint =
      endpoint.includes('/auth/admin/login') ||
      endpoint.includes('/auth/admin/refresh') ||
      endpoint.includes('/auth/admin/setup-password') ||
      endpoint.includes('/auth/admin/reset-password') ||
      endpoint.includes('/auth/admin/verify-token');

    if (response.status === 401 && !isRetry && !isAuthBypassEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          return request<T>(
            endpoint,
            {
              ...options,
              headers: {
                ...(options.headers as Record<string, string>),
                Authorization: `Bearer ${newToken}`,
              },
            },
            true,
          );
        });
      }

      isRefreshing = true;
      const currentRefreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('nida_refresh_token')
          : null;

      if (!currentRefreshToken) {
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nida_auth_token');
          localStorage.removeItem('nida_refresh_token');
          window.dispatchEvent(new Event('nida_auth_expired'));
        }
        throw new ApiError('Session has expired, please log in', 401);
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/admin/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh token rejected');
        }

        const refreshData = await refreshResponse.json();
        const newAccessToken: string = refreshData.data?.accessToken;
        const newRefreshToken: string = refreshData.data?.refreshToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('nida_auth_token', newAccessToken);
          localStorage.setItem('nida_refresh_token', newRefreshToken);
        }

        processQueue(null, newAccessToken);

        return request<T>(
          endpoint,
          {
            ...options,
            headers: {
              ...(options.headers as Record<string, string>),
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
          true,
        );
      } catch (refreshErr: unknown) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nida_auth_token');
          localStorage.removeItem('nida_refresh_token');
          window.dispatchEvent(new Event('nida_auth_expired'));
        }
        throw new ApiError('Session expired, please sign in again', 401);
      } finally {
        isRefreshing = false;
      }
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as { message: unknown }).message === 'string'
          ? (data as { message: string }).message
          : null) ?? `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    // Preserve PaginatedResponse structure ({ success: true, data: T[], pagination: PaginationMeta })
    if (data && typeof data === 'object' && 'pagination' in data) {
      return data as T;
    }

    // Auto-unwrap standard NestJS TransformInterceptor response: { success: true, data: T }
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data as T;
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(msg, 0, err);
  }
}

/**
 * Upload method using XMLHttpRequest to track upload progress (0 - 100%)
 */
function upload<T>(
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('nida_auth_token') : null;
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      const isJson = xhr.getResponseHeader('content-type')?.includes('application/json');
      let data: unknown = xhr.responseText;
      if (isJson) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          // fallback to raw text
        }
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (data && typeof data === 'object' && 'data' in data) {
          resolve((data as { data: T }).data);
        } else {
          resolve(data as T);
        }
      } else {
        const errorMsg =
          (typeof data === 'object' &&
          data !== null &&
          'message' in data &&
          typeof (data as { message: unknown }).message === 'string'
            ? (data as { message: string }).message
            : null) ?? `Upload failed with status code ${xhr.status}`;
        reject(new ApiError(errorMsg, xhr.status, data));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError(`Network connection error to ${url}`, 0));
    };

    xhr.send(formData);
  });
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, onProgress?: (percent: number) => void) =>
    upload<T>(endpoint, formData, onProgress),
};
