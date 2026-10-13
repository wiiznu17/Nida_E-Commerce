import { describe, it, expect, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError } from '@repo/types';
import { HttpExceptionFilter } from '../../src/core/filters/http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  const createMockHost = (jsonSpy: ReturnType<typeof vi.fn>, statusSpy: ReturnType<typeof vi.fn>): ArgumentsHost => {
    const mockResponse = {
      status: statusSpy.mockReturnValue({ json: jsonSpy }),
      json: jsonSpy,
    } as unknown as Response;

    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
        getNext: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  };

  it('should format a standard NotFoundException into unified ApiError', () => {
    const filter = new HttpExceptionFilter();
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn();
    const host = createMockHost(jsonSpy, statusSpy);

    const exception = new NotFoundException('Product not found');
    filter.catch(exception, host);

    expect(statusSpy).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const body = jsonSpy.mock.calls[0][0] as ApiError;
    expect(body).toEqual({
      success: false,
      statusCode: 404,
      error: 'Not Found',
      message: 'Product not found',
    });
    expect(body.issues).toBeUndefined();
  });

  it('should format a Zod validation exception with issues array', () => {
    const filter = new HttpExceptionFilter();
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn();
    const host = createMockHost(jsonSpy, statusSpy);

    const validationIssues = ['title: Title is required', 'price: Price must be at least 0'];
    const exception = new BadRequestException({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: validationIssues,
    });

    filter.catch(exception, host);

    expect(statusSpy).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = jsonSpy.mock.calls[0][0] as ApiError;
    expect(body).toEqual({
      success: false,
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: validationIssues,
    });
  });

  it('should format NestJS class-validator message array into issues array', () => {
    const filter = new HttpExceptionFilter();
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn();
    const host = createMockHost(jsonSpy, statusSpy);

    const classValidatorMessages = ['email must be an email', 'name should not be empty'];
    const exception = new BadRequestException({
      statusCode: 400,
      error: 'Bad Request',
      message: classValidatorMessages,
    });

    filter.catch(exception, host);

    expect(statusSpy).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = jsonSpy.mock.calls[0][0] as ApiError;
    expect(body).toEqual({
      success: false,
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      issues: classValidatorMessages,
    });
  });

  it('should handle unhandled unexpected errors as 500 without leaking stack traces', () => {
    const filter = new HttpExceptionFilter();
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn();
    const host = createMockHost(jsonSpy, statusSpy);

    const unhandledError = new Error('Database connection failed');
    filter.catch(unhandledError, host);

    expect(statusSpy).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = jsonSpy.mock.calls[0][0] as ApiError;
    expect(body).toEqual({
      success: false,
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected server error occurred',
    });
    expect(body.issues).toBeUndefined();
  });
});
