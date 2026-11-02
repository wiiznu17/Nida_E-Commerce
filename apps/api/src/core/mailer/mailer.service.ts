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
}
