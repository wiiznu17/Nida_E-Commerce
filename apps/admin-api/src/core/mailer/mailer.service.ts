import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Resend } from 'resend';
import {
  formatAdminInvitationEmail,
  formatPasswordResetEmail,
} from './email-templates.js';

export interface SendInviteEmailOptions {
  to: string;
  fullName: string;
  setupUrl: string;
}

export interface SendResetPasswordEmailOptions {
  to: string;
  resetUrl: string;
}

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend | null = null;
  private fromAddress = 'NIDA Back-Office <onboarding@resend.dev>';

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

  async sendAdminInvitation(options: SendInviteEmailOptions): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Admin Invitation: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatAdminInvitationEmail(
      options.fullName,
      options.setupUrl,
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
          `Resend Admin Invitation rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch admin invitation: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Admin Invitation successfully sent to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Resend Admin Invitation exception: ${message}`);
      throw new InternalServerErrorException(
        `Failed to send admin invitation: ${message}`,
      );
    }
  }

  async sendPasswordReset(
    options: SendResetPasswordEmailOptions,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.error(
        'Cannot dispatch Password Reset: RESEND_API_KEY is missing',
      );
      throw new InternalServerErrorException(
        'Email service is not configured (RESEND_API_KEY missing)',
      );
    }

    const { subject, text, html } = formatPasswordResetEmail(options.resetUrl);

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
          `Resend Password Reset rejected for ${options.to}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to dispatch password reset email: ${error.message}`,
        );
      }

      this.logger.log(
        `Resend Password Reset successfully sent to: ${options.to} (Message ID: ${data?.id ?? 'n/a'})`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Resend Password Reset exception: ${message}`);
      throw new InternalServerErrorException(
        `Failed to send password reset email: ${message}`,
      );
    }
  }
}
