import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
  private transporter: Transporter | null = null;
  private fromAddress = '"NIDA Back-Office" <noreply@nidabrand.com>';

  onModuleInit() {
    const host = process.env.SMTP_HOST ?? process.env.MAIL_HOST;
    const port = Number(process.env.SMTP_PORT ?? process.env.MAIL_PORT ?? 587);
    const user = process.env.SMTP_USER ?? process.env.MAIL_USER;
    const pass = process.env.SMTP_PASSWORD ?? process.env.MAIL_PASSWORD;
    const from = process.env.SMTP_FROM ?? process.env.MAIL_FROM;

    if (from) {
      this.fromAddress = from;
    }

    if (host) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user && pass ? { user, pass } : undefined,
        });
        this.logger.log(
          `SMTP Transport initialized for ${host}:${port} (${this.fromAddress})`,
        );
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to initialize SMTP transport: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else {
      this.logger.log(
        'No SMTP host configured. Mailer running in development logger mode.',
      );
    }
  }

  async sendAdminInvitation(options: SendInviteEmailOptions): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: 'ยินดีต้อนรับสู่ Nida Admin Portal — ตั้งค่ารหัสผ่านของคุณ',
          text: `เรียนคุณ ${options.fullName}\n\nกรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านและเปิดใช้งานบัญชีของคุณ:\n${options.setupUrl}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
                <p style="font-size: 11px; letter-spacing: 2px; color: #8C7A6B; margin-top: 5px; text-transform: uppercase;">Back-Office Portal</p>
              </div>
              <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #EAE3D9;">
                <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 15px;">คำเชิญเข้าสู่ระบบแอดมิน</h2>
                <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
                  เรียนคุณ <strong>${options.fullName}</strong>,<br>
                  บัญชีผู้ดูแลระบบของคุณได้รับการสร้างเรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านและเริ่มใช้งานระบบ
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${options.setupUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 12px 30px; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
                    ตั้งรหัสผ่านบัญชี
                  </a>
                </div>
                <p style="font-size: 11px; color: #999999; word-break: break-all; margin-top: 25px;">
                  หรือคัดลอกลิงก์นี้เปิดบนเบราว์เซอร์: ${options.setupUrl}
                </p>
              </div>
            </div>
          `,
        });
        this.logger.log(`SMTP Admin invitation sent to: ${options.to}`);
        return;
      } catch (err: unknown) {
        this.logger.error(
          `Failed to dispatch SMTP Admin Invitation to ${options.to}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Fallback: development logger
    this.logger
      .log(`\n======================================================================
[MAILER-DEV] INVITATION EMAIL DISPATCHED
To: ${options.to} (${options.fullName})
Subject: Welcome to Nida Admin Portal — Setup Your Password
Setup URL: ${options.setupUrl}
(Copy and paste this link into your browser to activate this account)
======================================================================`);
  }

  async sendPasswordReset(
    options: SendResetPasswordEmailOptions,
  ): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: 'รีเซ็ตรหัสผ่านบัญชี — Nida Back-Office',
          text: `คุณได้ทำการร้องขอรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 15 นาที):\n${options.resetUrl}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
              </div>
              <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #EAE3D9;">
                <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 15px;">คำขอรีเซ็ตรหัสผ่าน</h2>
                <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
                  คุณได้ส่งคำขอรีเซ็ตรหัสผ่านสำหรับเข้าใช้งานระบบ Nida Back-Office กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้มีอายุ 15 นาที
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${options.resetUrl}" style="background-color: #2B1810; color: #FFFFFF; text-decoration: none; padding: 12px 30px; font-size: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
                    รีเซ็ตรหัสผ่าน
                  </a>
                </div>
                <p style="font-size: 11px; color: #999999; word-break: break-all;">
                  หากคุณไม่ได้ส่งคำขอนี้ โปรดติดต่อผู้ดูแลระบบสูงสุดทันที
                </p>
              </div>
            </div>
          `,
        });
        this.logger.log(`SMTP Password reset sent to: ${options.to}`);
        return;
      } catch (err: unknown) {
        this.logger.error(
          `Failed to dispatch SMTP Password Reset to ${options.to}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Fallback: development logger
    this.logger
      .log(`\n======================================================================
[MAILER-DEV] PASSWORD RESET EMAIL DISPATCHED
To: ${options.to}
Subject: Reset Your Password — Nida Back-Office
Reset URL: ${options.resetUrl}
(Copy and paste this link into your browser to reset your password)
======================================================================`);
  }
}
