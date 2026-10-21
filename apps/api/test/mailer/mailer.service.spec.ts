import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MailerService } from '../../src/core/mailer/mailer.service.js';
import nodemailer from 'nodemailer';

describe('Customer MailerService', () => {
  let service: MailerService;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new MailerService();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('runs in development logger mode when no SMTP host is configured', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.MAIL_HOST;

    const loggerSpy = vi.spyOn(
      (service as unknown as { logger: { log: ReturnType<typeof vi.fn> } })
        .logger,
      'log',
    );
    service.onModuleInit();

    await service.sendOtpEmail({ to: 'customer@nida.co', otpCode: '123456' });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[MAILER-DEV] CUSTOMER LOGIN OTP DISPATCHED'),
    );
  });

  it('initializes nodemailer transporter and sends email via SMTP when configured', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password123';

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-123' });
    const createTransportSpy = vi
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({
        sendMail: sendMailMock,
      } as unknown as ReturnType<typeof nodemailer.createTransport>);

    service.onModuleInit();
    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
      }),
    );

    await service.sendOtpEmail({ to: 'customer@nida.co', otpCode: '654321' });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@nida.co',
        subject: expect.stringContaining('654321'),
      }),
    );
  });

  it('sends order confirmation via SMTP when transporter is active', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'msg-456' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    service.onModuleInit();
    await service.sendOrderConfirmation({
      to: 'customer@nida.co',
      orderNumber: 'NIDA-2026-0001',
      totalAmount: 4500,
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@nida.co',
        subject: expect.stringContaining('NIDA-2026-0001'),
      }),
    );
  });
});
