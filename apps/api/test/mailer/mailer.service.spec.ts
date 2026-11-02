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

describe('Customer MailerService (Resend Direct API)', () => {
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

  it('throws InternalServerErrorException when RESEND_API_KEY is missing on sendOtpEmail', async () => {
    service.onModuleInit();

    await expect(
      service.sendOtpEmail({ to: 'customer@nida.co', otpCode: '123456' }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('throws InternalServerErrorException when RESEND_API_KEY is missing on sendOrderConfirmation', async () => {
    service.onModuleInit();

    await expect(
      service.sendOrderConfirmation({
        to: 'customer@nida.co',
        orderNumber: 'NIDA-001',
        totalAmount: 1500,
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('sends OTP email via Resend API when RESEND_API_KEY is configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';
    process.env.MAIL_FROM = 'NIDA Official <onboarding@resend.dev>';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'msg_otp_999' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendOtpEmail({ to: 'customer@nida.co', otpCode: '887766' });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'NIDA Official <onboarding@resend.dev>',
        to: 'customer@nida.co',
        subject: expect.stringContaining('887766'),
      }),
    );
  });

  it('throws InternalServerErrorException when Resend API rejects OTP email', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    resendInstance.emails.send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Domain not verified' },
    });

    await expect(
      service.sendOtpEmail({ to: 'customer@nida.co', otpCode: '887766' }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('sends order confirmation via Resend API when configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'msg_order_111' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendOrderConfirmation({
      to: 'customer@nida.co',
      orderNumber: 'NIDA-2026-0001',
      totalAmount: 4500,
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@nida.co',
        subject: expect.stringContaining('NIDA-2026-0001'),
      }),
    );
  });

  it('throws InternalServerErrorException when Resend API fails on order confirmation', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';

    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    resendInstance.emails.send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    });

    await expect(
      service.sendOrderConfirmation({
        to: 'customer@nida.co',
        orderNumber: 'NIDA-2026-0001',
        totalAmount: 4500,
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
