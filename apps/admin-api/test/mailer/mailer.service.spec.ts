import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MailerService } from '../../src/core/mailer/mailer.service.js';
import nodemailer from 'nodemailer';

describe('Admin MailerService', () => {
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

    await service.sendAdminInvitation({
      to: 'staff@nida.co',
      fullName: 'John Staff',
      setupUrl: 'https://admin.nida.co/setup-password?token=123',
    });
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[MAILER-DEV] INVITATION EMAIL DISPATCHED'),
    );
  });

  it('initializes nodemailer transporter and sends invitation via SMTP when configured', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';

    const sendMailMock = vi
      .fn()
      .mockResolvedValue({ messageId: 'msg-admin-1' });
    const createTransportSpy = vi
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({
        sendMail: sendMailMock,
      } as unknown as ReturnType<typeof nodemailer.createTransport>);

    service.onModuleInit();
    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 465,
        secure: true,
      }),
    );

    await service.sendAdminInvitation({
      to: 'admin@nida.co',
      fullName: 'Jane Admin',
      setupUrl: 'https://admin.nida.co/setup?token=xyz',
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@nida.co',
        subject: expect.stringContaining('Nida Admin Portal'),
      }),
    );
  });

  it('sends password reset via SMTP when transporter is active', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    const sendMailMock = vi
      .fn()
      .mockResolvedValue({ messageId: 'msg-reset-1' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    service.onModuleInit();
    await service.sendPasswordReset({
      to: 'admin@nida.co',
      resetUrl: 'https://admin.nida.co/reset-password?token=abc',
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@nida.co',
        subject: expect.stringContaining('รีเซ็ตรหัสผ่าน'),
      }),
    );
  });
});
