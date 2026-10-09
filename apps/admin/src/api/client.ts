/**
 * Core HTTP API Client for Nida Admin
 *
 * Best Practice: Centralized request wrapper with base URL handling,
 * header management, response extraction, and progress tracking.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
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

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    // Auto-unwrap NestJS TransformInterceptor response: { success: true, data: T }
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data as T;
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed', 0, err);
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
      let data: any = xhr.responseText;
      if (isJson) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          // fallback to raw text
        }
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        // Auto-unwrap NestJS { success: true, data: ... }
        if (data && typeof data === 'object' && 'data' in data) {
          resolve(data.data as T);
        } else {
          resolve(data as T);
        }
      } else {
        const errorMsg =
          (typeof data === 'object' && data?.message) ||
          `Upload failed with status code ${xhr.status}`;
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
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, onProgress?: (percent: number) => void) =>
    upload<T>(endpoint, formData, onProgress),
};
