import { describe, it, expect } from 'vitest';
import {
  sanitizeData,
  maskEmail,
  maskPhone,
} from '../../src/core/utils/sanitizer.js';

describe('Admin PI & Sensitive Data Sanitizer', () => {
  it('masks email and phone correctly', () => {
    expect(maskEmail('admin@nida-apparel.com')).toBe('ad***@nida-apparel.com');
    expect(maskPhone('0898765432')).toBe('089-***-5432');
  });

  it('redacts admin passwords and invitation tokens', () => {
    const payload = {
      admin: {
        username: 'superadmin',
        email: 'admin@nida.co',
        password: 'admin-password-123',
        newPassword: 'new-password-456',
      },
      invite: {
        token: 'invite-uuid-token-xyz',
        secret: 'admin-secret-key',
      },
    };

    const sanitized = sanitizeData(payload);

    expect(sanitized.admin.password).toBe('***REDACTED***');
    expect(sanitized.admin.newPassword).toBe('***REDACTED***');
    expect(sanitized.admin.email).toBe('ad***@nida.co');
    expect(sanitized.invite.token).toBe('***REDACTED***');
    expect(sanitized.invite.secret).toBe('***REDACTED***');
    expect(sanitized.admin.username).toBe('superadmin');
  });
});

