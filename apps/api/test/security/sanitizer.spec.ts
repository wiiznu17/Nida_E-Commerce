import { describe, it, expect } from 'vitest';
import {
  sanitizeData,
  maskEmail,
  maskPhone,
} from '../../src/core/utils/sanitizer.js';

describe('PII & Sensitive Data Sanitizer', () => {
  it('masks email addresses correctly', () => {
    expect(maskEmail('customer@domain.com')).toBe('cu***@domain.com');
    expect(maskEmail('a@b.com')).toBe('a***@b.com');
    expect(maskEmail('invalid-email')).toBe('invalid-email');
  });

  it('masks phone numbers correctly', () => {
    expect(maskPhone('0812345678')).toBe('081-***-5678');
    expect(maskPhone('+66812345678')).toBe('+66***78');
  });

  it('redacts sensitive fields in nested payloads', () => {
    const payload = {
      user: {
        email: 'member@nida.co',
        phone: '0891234567',
        password: 'super-secret-password',
        currentPassword: 'old-password',
      },
      payment: {
        cardNumber: '4111222233334444',
        cvv: '123',
        omiseToken: 'tokn_test_123456',
      },
      auth: {
        otpCode: '654321',
        token: 'raw-jwt-token-string',
      },
      product: {
        id: 'prd-101',
        name: 'Luxury Cashmere Sweater',
        price: 4900,
      },
    };

    const sanitized = sanitizeData(payload);

    expect(sanitized.user.password).toBe('***REDACTED***');
    expect(sanitized.user.currentPassword).toBe('***REDACTED***');
    expect(sanitized.user.email).toBe('me***@nida.co');
    expect(sanitized.user.phone).toBe('089-***-4567');
    expect(sanitized.payment.cardNumber).toBe('***REDACTED***');
    expect(sanitized.payment.cvv).toBe('***REDACTED***');
    expect(sanitized.payment.omiseToken).toBe('***REDACTED***');
    expect(sanitized.auth.otpCode).toBe('***REDACTED***');
    expect(sanitized.auth.token).toBe('***REDACTED***');
    expect(sanitized.product.name).toBe('Luxury Cashmere Sweater');
    expect(sanitized.product.price).toBe(4900);
  });

  it('handles circular references gracefully without crashing', () => {
    const circularObj: Record<string, unknown> = { name: 'test' };
    circularObj['self'] = circularObj;

    const sanitized = sanitizeData(circularObj);
    expect(sanitized.name).toBe('test');
    expect(sanitized['self']).toBe('[Circular]');
  });
});

