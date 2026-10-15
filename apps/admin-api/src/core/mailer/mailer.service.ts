import { Injectable, Logger } from '@nestjs/common';

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
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async sendAdminInvitation(options: SendInviteEmailOptions): Promise<void> {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      this.logger
        .log(`\n======================================================================
[MAILER-DEV] INVITATION EMAIL DISPATCHED
To: ${options.to} (${options.fullName})
Subject: Welcome to Nida Admin Portal — Setup Your Password
Setup URL: ${options.setupUrl}
(Copy and paste this link into your browser to activate this account)
======================================================================`);
    } else {
      // In production, integrate SMTP or provider API
      this.logger.log(`Admin invitation sent to: ${options.to}`);
    }
  }

  async sendPasswordReset(
    options: SendResetPasswordEmailOptions,
  ): Promise<void> {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      this.logger
        .log(`\n======================================================================
[MAILER-DEV] PASSWORD RESET EMAIL DISPATCHED
To: ${options.to}
Subject: Reset Your Password — Nida Back-Office
Reset URL: ${options.resetUrl}
(Copy and paste this link into your browser to reset your password)
======================================================================`);
    } else {
      // In production, integrate SMTP or provider API
      this.logger.log(`Password reset email sent to: ${options.to}`);
    }
  }
}
