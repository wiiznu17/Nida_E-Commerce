import { describe, it, expect } from 'vitest';
import {
  formatAdminInvitationEmail,
  formatPasswordResetEmail,
} from '../../src/core/mailer/email-templates.js';

describe('Admin Email Templates Formatter', () => {
  it('formats Admin Invitation email template correctly with setup URL', () => {
    const formatted = formatAdminInvitationEmail(
      'Somchai Manager',
      'https://admin.nida.co/setup?token=xyz123',
    );

    expect(formatted.subject).toContain('ยินดีต้อนรับสู่ Nida Admin Portal');
    expect(formatted.text).toContain('Somchai Manager');
    expect(formatted.text).toContain(
      'https://admin.nida.co/setup?token=xyz123',
    );
    expect(formatted.html).toContain('Somchai Manager');
    expect(formatted.html).toContain(
      'https://admin.nida.co/setup?token=xyz123',
    );
    expect(formatted.html).toContain('Back-Office Portal');
  });

  it('formats Password Reset email template correctly with reset URL', () => {
    const formatted = formatPasswordResetEmail(
      'https://admin.nida.co/reset-password?token=secret999',
    );

    expect(formatted.subject).toContain('รีเซ็ตรหัสผ่าน');
    expect(formatted.text).toContain(
      'https://admin.nida.co/reset-password?token=secret999',
    );
    expect(formatted.text).toContain('15 นาที');
    expect(formatted.html).toContain(
      'https://admin.nida.co/reset-password?token=secret999',
    );
  });
});
