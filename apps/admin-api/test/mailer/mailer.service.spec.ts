import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MailerService } from '../../src/core/mailer/mailer.service.js';
import { Resend } from 'resend';
import { InternalServerErrorException } from '@nestjs/common';

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: vi.fn(),
      };
    },
  };
});

describe('Admin MailerService (Resend Direct API)', () => {
  let service: MailerService;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new MailerService();
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('throws InternalServerErrorException when RESEND_API_KEY is missing on sendAdminInvitation', async () => {
    service.onModuleInit();

    await expect(
      service.sendAdminInvitation({
        to: 'staff@nida.co',
        fullName: 'John Staff',
        setupUrl: 'https://admin.nida.co/setup?token=123',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('throws InternalServerErrorException when RESEND_API_KEY is missing on sendPasswordReset', async () => {
    service.onModuleInit();

    await expect(
      service.sendPasswordReset({
        to: 'admin@nida.co',
        resetUrl: 'https://admin.nida.co/reset?token=xyz',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('sends invitation via Resend API when RESEND_API_KEY is configured', async () => {
    process.env.RESEND_API_KEY = 're_admin_test_123';
    process.env.MAIL_FROM = 'NIDA Back-Office <onboarding@resend.dev>';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'email_admin_invite_123' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendAdminInvitation({
      to: 'admin@nida.co',
      fullName: 'Jane Admin',
      setupUrl: 'https://admin.nida.co/setup?token=xyz',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'NIDA Back-Office <onboarding@resend.dev>',
        to: 'admin@nida.co',
        subject: expect.stringContaining('Nida Admin Portal'),
      }),
    );
  });

  it('throws InternalServerErrorException when Resend API rejects admin invitation', async () => {
    process.env.RESEND_API_KEY = 're_admin_test_123';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    resendInstance.emails.send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid recipient address' },
    });

    await expect(
      service.sendAdminInvitation({
        to: 'admin@nida.co',
        fullName: 'Jane Admin',
        setupUrl: 'https://admin.nida.co/setup?token=xyz',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('sends password reset via Resend API when configured', async () => {
    process.env.RESEND_API_KEY = 're_admin_test_123';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'email_admin_reset_456' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendPasswordReset({
      to: 'admin@nida.co',
      resetUrl: 'https://admin.nida.co/reset-password?token=abc',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@nida.co',
        subject: expect.stringContaining('รีเซ็ตรหัสผ่าน'),
      }),
    );
  });

  it('throws InternalServerErrorException when Resend API rejects password reset', async () => {
    process.env.RESEND_API_KEY = 're_admin_test_123';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    resendInstance.emails.send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Account restricted' },
    });

    await expect(
      service.sendPasswordReset({
        to: 'admin@nida.co',
        resetUrl: 'https://admin.nida.co/reset-password?token=abc',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
