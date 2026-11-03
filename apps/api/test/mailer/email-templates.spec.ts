import { describe, it, expect } from 'vitest';
import {
  formatOtpEmail,
  formatOrderConfirmationEmail,
} from '../../src/core/mailer/email-templates.js';

describe('Customer Email Templates Formatter', () => {
  it('formats OTP email template correctly with code and disclaimer', () => {
    const formatted = formatOtpEmail('554433');

    expect(formatted.subject).toContain('554433');
    expect(formatted.text).toContain('554433');
    expect(formatted.text).toContain('5 นาที');
    expect(formatted.html).toContain('554433');
    expect(formatted.html).toContain('N I D A');
    expect(formatted.html).toContain('Modern Heritage Apparel');
  });

  it('formats Order Confirmation email template correctly with order details', () => {
    const formatted = formatOrderConfirmationEmail('NIDA-2026-9999', 12500);

    expect(formatted.subject).toContain('NIDA-2026-9999');
    expect(formatted.text).toContain('NIDA-2026-9999');
    expect(formatted.text).toContain('12,500');
    expect(formatted.html).toContain('NIDA-2026-9999');
    expect(formatted.html).toContain('12,500');
  });
});
