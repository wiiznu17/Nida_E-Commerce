import { Injectable, Logger } from '@nestjs/common';

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
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async sendOtpEmail(options: SendOtpEmailOptions): Promise<void> {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      this.logger
        .log(`\n======================================================================
[MAILER-DEV] CUSTOMER LOGIN OTP DISPATCHED
To: ${options.to}
Subject: รหัสยืนยันการเข้าสู่ระบบ Nida Store — OTP: ${options.otpCode}
Your One-Time Password is: ${options.otpCode}
(This code is valid for 5 minutes. Do not share this code with anyone.)
======================================================================`);
    } else {
      this.logger.log(`OTP verification email sent to: ${options.to}`);
    }
  }

  async sendOrderConfirmation(
    options: SendOrderConfirmationOptions,
  ): Promise<void> {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      this.logger
        .log(`\n======================================================================
[MAILER-DEV] ORDER CONFIRMATION EMAIL DISPATCHED
To: ${options.to}
Order Number: ${options.orderNumber}
Total Amount: ฿${options.totalAmount.toLocaleString()}
Subject: ยืนยันคำสั่งซื้อ #${options.orderNumber} — Nida Haute Couture
======================================================================`);
    } else {
      this.logger.log(
        `Order confirmation sent for ${options.orderNumber} to: ${options.to}`,
      );
    }
  }
}
