import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MailerService } from '../../src/core/mailer/mailer.service.js';
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

  it('sends order shipped email with tracking details', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';
    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'msg_shipped_222' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendOrderShippedEmail({
      to: 'buyer@example.com',
      orderNumber: 'ORD-2026-99',
      recipientName: 'Somchai Jaidee',
      courierName: 'Flash Express',
      trackingNumber: 'TH0123456789',
      trackingUrl: 'https://flashexpress.com/track/TH0123456789',
      items: [
        {
          title: 'Silk Minimalist Shirt',
          variantSummary: 'Black / M',
          quantity: 2,
          price: 2500,
        },
      ],
      shippingAddressSummary: 'Bangkok 10110',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'buyer@example.com',
        subject: expect.stringContaining('ORD-2026-99'),
        html: expect.stringContaining('TH0123456789'),
      }),
    );
  });

  it('sends tax invoice receipt email with VAT breakdown', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';
    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'msg_tax_333' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendTaxInvoiceReceiptEmail({
      to: 'corporate@example.com',
      orderNumber: 'ORD-888',
      invoiceNumber: 'INV-202611-00001',
      issuedAt: '04/11/2026',
      buyerName: 'Acme Holding Co., Ltd.',
      buyerTaxId: '0105559000111',
      preVatAmount: 10000,
      vatAmount: 700,
      totalAmount: 10700,
      viewUrl: 'https://store.nida.co/profile/orders/ORD-888',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'corporate@example.com',
        subject: expect.stringContaining('INV-202611-00001'),
        html: expect.stringContaining('Acme Holding Co., Ltd.'),
      }),
    );
  });

  it('sends order cancelled and refund processed emails', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';
    service.onModuleInit();

    const resendInstance = (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend;
    const sendMock = vi.fn().mockResolvedValue({
      data: { id: 'msg_refund_444' },
      error: null,
    });
    resendInstance.emails.send = sendMock;

    await service.sendOrderCancelledEmail({
      to: 'customer@example.com',
      orderNumber: 'ORD-777',
      reason: 'Order timed out',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@example.com',
        subject: expect.stringContaining('ORD-777'),
      }),
    );

    await service.sendRefundProcessedEmail({
      to: 'customer@example.com',
      orderNumber: 'ORD-777',
      refundNumber: 'REF-ORD-777-1',
      amount: 1500,
      reason: 'Out of stock',
      paymentMethod: 'Credit Card (Omise)',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@example.com',
        subject: expect.stringContaining('ORD-777'),
        html: expect.stringContaining('REF-ORD-777-1'),
      }),
    );
  });
});
