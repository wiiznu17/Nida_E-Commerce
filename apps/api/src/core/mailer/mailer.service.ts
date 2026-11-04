import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Resend } from 'resend';
import {
  formatOtpEmail,
  formatOrderConfirmationEmail,
  formatOrderShippedEmail,
  formatTaxInvoiceReceiptEmail,
  formatOrderCancelledEmail,
  formatRefundProcessedEmail,
  type OrderShippedEmailData,
  type TaxInvoiceReceiptEmailData,
  type OrderCancelledEmailData,
  type RefundProcessedEmailData,
} from './email-templates.js';

export interface SendOtpEmailOptions {
  to: string;
  otpCode: string;
}

export interface SendOrderConfirmationOptions {
  to: string;
  orderNumber: string;
  totalAmount: number;
}

export type SendOrderShippedEmailOptions = OrderShippedEmailData & {
  to: string;
};

export type SendTaxInvoiceReceiptEmailOptions = TaxInvoiceReceiptEmailData & {
  to: string;
};

export type SendOrderCancelledEmailOptions = OrderCancelledEmailData & {
  to: string;
};

export type SendRefundProcessedEmailOptions = RefundProcessedEmailData & {
  to: string;
};

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend | null = null;
  private fromAddress = 'NIDA Official <onboarding@resend.dev>';

  onModuleInit() {
    const resendApiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;

    if (from) {
      this.fromAddress = from;
    }

    if (!resendApiKey) {
      this.logger.error(
        'RESEND_API_KEY is not configured in environment variables. Mail dispatch will fail.',
      );
      return;
    }

    try {
      this.resend = new Resend(resendApiKey);
      this.logger.log(
        `Resend client initialized successfully (${this.fromAddress})`,
      );
    } catch (err: unknown) {
      this.logger.error(
        `Failed to initialize Resend client: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  getHealthStatus(): {
    status: 'connected' | 'degraded' | 'disconnected';
    message?: string;
    configured: boolean;
  } {
    const isConfigured = Boolean(process.env.RESEND_API_KEY && this.resend);
    if (!isConfigured) {
      return {
        status: 'degraded',
        configured: false,
        message: 'RESEND_API_KEY not configured or client uninitialized',
      };
    }
    return {
      status: 'connected',
      configured: true,
      message: `Active mailer dispatching from ${this.fromAddress}`,
    };
  }

  async sendOtpEmail(options: SendOtpEmailOptions): Promise<void> {
    if (!this.resend) {
      this.logger.error('Cannot dispatch OTP email: RESEND_API_KEY is missing');
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatOtpEmail(options.otpCode);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend OTP dispatch rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch OTP email: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend OTP successfully sent to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Resend OTP unexpected exception: ${message}`);
      throw new InternalServerErrorException(
        `Failed to send OTP email: ${message}`,
      );
    }
  }

  async sendOrderConfirmation(
    options: SendOrderConfirmationOptions,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Order Confirmation: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatOrderConfirmationEmail(
      options.orderNumber,
      options.totalAmount,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend Order Confirmation dispatch rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch order confirmation: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Order Confirmation sent for #${options.orderNumber} to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Resend Order Confirmation unexpected exception: ${message}`,
      );
      throw new InternalServerErrorException(
        `Failed to send order confirmation: ${message}`,
      );
    }
  }

  async sendOrderShippedEmail(
    options: SendOrderShippedEmailOptions,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Order Shipped email: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatOrderShippedEmail(options);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend Order Shipped dispatch rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch order shipped email: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Order Shipped email sent for #${options.orderNumber} to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Resend Order Shipped unexpected exception: ${message}`,
      );
      throw new InternalServerErrorException(
        `Failed to send order shipped email: ${message}`,
      );
    }
  }

  async sendTaxInvoiceReceiptEmail(
    options: SendTaxInvoiceReceiptEmailOptions,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Tax Invoice email: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatTaxInvoiceReceiptEmail(options);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend Tax Invoice dispatch rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch tax invoice email: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Tax Invoice email sent for #${options.invoiceNumber} (Order #${options.orderNumber}) to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Resend Tax Invoice unexpected exception: ${message}`);
      throw new InternalServerErrorException(
        `Failed to send tax invoice email: ${message}`,
      );
    }
  }

  async sendOrderCancelledEmail(
    options: SendOrderCancelledEmailOptions,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Order Cancelled email: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatOrderCancelledEmail(options);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend Order Cancelled dispatch rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch order cancelled email: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Order Cancelled email sent for #${options.orderNumber} to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Resend Order Cancelled unexpected exception: ${message}`,
      );
      throw new InternalServerErrorException(
        `Failed to send order cancelled email: ${message}`,
      );
    }
  }

  async sendRefundProcessedEmail(
    options: SendRefundProcessedEmailOptions,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Refund email: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatRefundProcessedEmail(options);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Resend Refund dispatch rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch refund email: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Refund email sent for #${options.refundNumber} (Order #${options.orderNumber}) to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Resend Refund unexpected exception: ${message}`);
      throw new InternalServerErrorException(
        `Failed to send refund email: ${message}`,
      );
    }
  }
}
