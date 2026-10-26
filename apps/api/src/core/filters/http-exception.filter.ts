import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError } from '@repo/types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';
    let code: string | undefined;
    let mismatches: ApiError['mismatches'] | undefined;
    let issues: string[] = [];
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, unknown>;

        if (typeof res['error'] === 'string' && res['error'].length > 0) {
          error = res['error'];
        }

        if (typeof res['code'] === 'string' && res['code'].length > 0) {
          code = res['code'];
        }

        if (Array.isArray(res['mismatches'])) {
          mismatches = res['mismatches'] as ApiError['mismatches'];
        }

        if (Array.isArray(res['issues'])) {
          issues = res['issues'].filter(
            (i): i is string => typeof i === 'string',
          );
        } else if (Array.isArray(res['message'])) {
          issues = res['message'].filter(
            (i): i is string => typeof i === 'string',
          );
        } else if (
          typeof res['details'] === 'object' &&
          res['details'] !== null &&
          Array.isArray(
            (res['details'] as Record<string, unknown>)['validation'],
          )
        ) {
          issues = (
            (res['details'] as Record<string, unknown>)[
              'validation'
            ] as unknown[]
          ).filter((i): i is string => typeof i === 'string');
        }

        if (typeof res['message'] === 'string' && res['message'].length > 0) {
          message = res['message'];
        } else if (issues.length > 0) {
          message = 'Validation failed';
        }

        if (typeof res['details'] === 'object' && res['details'] !== null) {
          details = res['details'] as Record<string, unknown>;
        }
      }

      error = this.getErrorName(statusCode);
    } else {
      this.logger.error('Unhandled exception:', exception);
      message = 'An unexpected server error occurred';
      if (process.env.NODE_ENV !== 'production') {
        details = {
          devError:
            exception instanceof Error ? exception.message : String(exception),
          devStack: exception instanceof Error ? exception.stack : undefined,
        };
      }
    }

    const body: ApiError = {
      success: false,
      statusCode,
      error,
      message,
      ...(code && { code }),
      ...(mismatches && mismatches.length > 0 && { mismatches }),
      ...(issues.length > 0 && { issues }),
      ...(details && { details }),
    };

    response.status(statusCode).json(body);
  }

  private getErrorName(statusCode: number): string {
    const names: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return names[statusCode] ?? 'Error';
  }
}
