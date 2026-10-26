import type {
  ApiError as ApiErrorResponse,
  PriceMismatchItem,
} from '@repo/types';
import { ApiError } from './client';

export interface ExtractedApiError {
  message: string;
  issues: string[];
  status?: number;
  code?: string;
  mismatches?: PriceMismatchItem[];
}

/**
 * Extracts a normalized user-friendly error message and validation issue list
 * from an unknown caught error using the unified @repo/types ApiError contract.
 *
 * Adheres strictly to Zero `any` policy and eliminates sloppy fallback chaining.
 */
export function extractApiError(
  err: unknown,
  fallbackMessage?: string,
): ExtractedApiError {
  const defaultFallback =
    fallbackMessage ?? 'An unexpected error occurred. Please try again.';
  let message = defaultFallback;
  let issues: string[] = [];
  let status: number | undefined;
  let code: string | undefined;
  let mismatches: PriceMismatchItem[] | undefined;

  if (err instanceof ApiError) {
    status = err.status;

    if (typeof err.message === 'string' && err.message.trim().length > 0) {
      message = err.message;
    }

    if (typeof err.data === 'object' && err.data !== null) {
      const payload = err.data as Partial<ApiErrorResponse> & {
        code?: string;
        mismatches?: PriceMismatchItem[];
      };

      if (typeof payload.code === 'string') {
        code = payload.code;
      }

      if (Array.isArray(payload.mismatches)) {
        mismatches = payload.mismatches;
      }

      if (Array.isArray(payload.issues)) {
        issues = payload.issues;
      }

      if (
        typeof payload.message === 'string' &&
        payload.message.trim().length > 0
      ) {
        message = payload.message;
      }
    }
  } else if (err instanceof Error) {
    if (err.message.trim().length > 0) {
      message = err.message;
    }
  } else if (typeof err === 'string' && err.trim().length > 0) {
    message = err;
  }

  return {
    message,
    issues,
    status,
    code,
    mismatches,
  };
}
