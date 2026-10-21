import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
  private transporter: Transporter | null = null;
  private fromAddress = '"NIDA Official" <noreply@nidabrand.com>';

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

  async sendOtpEmail(options: SendOtpEmailOptions): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: `รหัสยืนยันการเข้าสู่ระบบ NIDA — OTP: ${options.otpCode}`,
          text: `รหัส OTP สำหรับเข้าสู่ระบบ NIDA ของคุณคือ: ${options.otpCode} (รหัสนี้มีอายุ 5 นาที โปรดอย่าเปิดเผยแก่ผู้อื่น)`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
                <p style="font-size: 11px; letter-spacing: 2px; color: #8C7A6B; margin-top: 5px; text-transform: uppercase;">Modern Heritage Apparel</p>
              </div>
              <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #EAE3D9; text-align: center;">
                <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 15px;">รหัสยืนยันตัวตนสำหรับเข้าสู่ระบบ</h2>
                <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">
                  กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันตัวตนในระบบ Nida Storefront รหัสนี้สามารถใช้งานได้ภายใน 5 นาที
                </p>
                <div style="background-color: #FAF7F2; border: 1px dashed #D4C5B9; padding: 18px 24px; display: inline-block; margin-bottom: 25px;">
                  <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #2B1810;">${options.otpCode}</span>
                </div>
                <p style="font-size: 11px; color: #999999; margin: 0;">
                  หากคุณไม่ได้เป็นผู้ร้องขอรหัสนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้อย่างปลอดภัย
                </p>
              </div>
              <div style="text-align: center; margin-top: 25px;">
                <p style="font-size: 10px; color: #A89F91; letter-spacing: 1px;">&copy; 2026 NIDA APPAREL & LIFESTYLE. ALL RIGHTS RESERVED.</p>
              </div>
            </div>
          `,
        });
        this.logger.log(`SMTP OTP successfully sent to: ${options.to}`);
        return;
      } catch (err: unknown) {
        this.logger.error(
          `Failed to dispatch SMTP OTP to ${options.to}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Fallback: development logger
    this.logger
      .log(`\n======================================================================
[MAILER-DEV] CUSTOMER LOGIN OTP DISPATCHED
To: ${options.to}
Subject: รหัสยืนยันการเข้าสู่ระบบ Nida Store — OTP: ${options.otpCode}
Your One-Time Password is: ${options.otpCode}
(This code is valid for 5 minutes. Do not share this code with anyone.)
======================================================================`);
  }

  async sendOrderConfirmation(
    options: SendOrderConfirmationOptions,
  ): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: `ยืนยันคำสั่งซื้อ #${options.orderNumber} — NIDA Official`,
          text: `คำสั่งซื้อ #${options.orderNumber} ได้รับการบันทึกเรียบร้อยแล้ว ยอดชำระรวม ฿${options.totalAmount.toLocaleString()}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border: 1px solid #EAE3D9;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #2B1810; margin: 0; text-transform: uppercase;">N I D A</h1>
              </div>
              <div style="background-color: #FFFFFF; padding: 30px; border: 1px solid #EAE3D9;">
                <h2 style="font-size: 16px; font-weight: 700; color: #2B1810; margin-bottom: 10px;">ขอบคุณสำหรับคำสั่งซื้อของคุณ</h2>
                <p style="font-size: 13px; color: #666666; line-height: 1.6;">
                  คำสั่งซื้อหมายเลข <strong>#${options.orderNumber}</strong> ได้รับการยืนยันแล้ว
                </p>
                <div style="margin: 20px 0; padding: 15px; background-color: #FAF7F2; border-left: 3px solid #2B1810;">
                  <p style="margin: 0; font-size: 13px; color: #2B1810;">
                    ยอดชำระรวมทั้งสิ้น: <strong>฿${options.totalAmount.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            </div>
          `,
        });
        this.logger.log(
          `SMTP Order confirmation sent for #${options.orderNumber} to: ${options.to}`,
        );
        return;
      } catch (err: unknown) {
        this.logger.error(
          `Failed to dispatch SMTP Order Confirmation to ${options.to}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Fallback: development logger
    this.logger
      .log(`\n======================================================================
[MAILER-DEV] ORDER CONFIRMATION EMAIL DISPATCHED
To: ${options.to}
Order Number: ${options.orderNumber}
Total Amount: ฿${options.totalAmount.toLocaleString()}
Subject: ยืนยันคำสั่งซื้อ #${options.orderNumber} — Nida Haute Couture
======================================================================`);
  }
}
