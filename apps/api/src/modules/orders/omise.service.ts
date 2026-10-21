import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface OmisePromptPayChargeResult {
  chargeId: string;
  qrDownloadUri: string;
  expiresAt: string;
  status: string;
}

export interface OmiseCreditCardChargeResult {
  chargeId: string;
  status: 'successful' | 'pending' | 'failed';
  authorizeUri: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  cardBrand?: string;
  cardLast4?: string;
}

export interface OmiseChargeData {
  id: string;
  status: string;
  amount: number;
  paid: boolean;
  failure_code: string | null;
  failure_message: string | null;
  authorize_uri: string | null;
  metadata?: {
    orderNumber?: string;
  };
  card?: {
    brand?: string;
    last_digits?: string;
  };
  source?: {
    type?: string;
    scannable_code?: {
      image?: {
        download_uri?: string;
      };
    };
  };
}

@Injectable()
export class OmiseService {
  private readonly logger = new Logger(OmiseService.name);
  private readonly apiBase = 'https://api.omise.co';

  private get secretKey(): string {
    return process.env.OMISE_SECRET_KEY || '';
  }

  private get frontendUrl(): string {
    return process.env.STORE_FRONTEND_URL || 'http://localhost:3000';
  }

  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`;
  }

  /**
   * Create an Omise PromptPay Source and Charge to generate a verified QR code.
   */
  async createPromptPayCharge(
    orderNumber: string,
    amountThb: number,
    expiresAt?: Date | string,
  ): Promise<OmisePromptPayChargeResult> {
    if (!this.secretKey) {
      throw new BadRequestException('Omise secret key is not configured');
    }

    const satangs = Math.round(amountThb * 100);

    const sourceRes = await fetch(`${this.apiBase}/sources`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        type: 'promptpay',
        amount: satangs.toString(),
        currency: 'thb',
      }).toString(),
    });

    if (!sourceRes.ok) {
      const errBody = (await sourceRes.json().catch(() => ({}))) as {
        message?: string;
      };
      this.logger.error(
        `Failed to create Omise PromptPay source: ${errBody.message}`,
      );
      throw new BadRequestException(
        errBody.message ||
          'ไม่สามารถสร้างรายการ PromptPay ได้ กรุณาลองใหม่อีกครั้ง',
      );
    }

    const sourceData = (await sourceRes.json()) as { id: string };

    const expirationIso = expiresAt
      ? typeof expiresAt === 'string'
        ? expiresAt
        : expiresAt.toISOString()
      : new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const chargeRes = await fetch(`${this.apiBase}/charges`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: satangs.toString(),
        currency: 'thb',
        source: sourceData.id,
        'metadata[orderNumber]': orderNumber,
        expires_at: expirationIso,
      }).toString(),
    });

    if (!chargeRes.ok) {
      const errBody = (await chargeRes.json().catch(() => ({}))) as {
        message?: string;
      };
      this.logger.error(`Failed to create Omise Charge: ${errBody.message}`);
      throw new BadRequestException(
        errBody.message || 'ไม่สามารถสร้างรายการชำระเงินกับ Omise ได้',
      );
    }

    const chargeData = (await chargeRes.json()) as {
      id: string;
      status: string;
      expires_at: string;
      source?: {
        scannable_code?: {
          image?: {
            download_uri?: string;
          };
        };
      };
    };

    const qrUri = chargeData.source?.scannable_code?.image?.download_uri ?? '';

    return {
      chargeId: chargeData.id,
      qrDownloadUri: qrUri,
      expiresAt: chargeData.expires_at,
      status: chargeData.status,
    };
  }

  /**
   * Charge a credit/debit card token with 3-D Secure authorization support.
   */
  async createCreditCardCharge(
    orderNumber: string,
    amountThb: number,
    omiseToken: string,
  ): Promise<OmiseCreditCardChargeResult> {
    if (!this.secretKey) {
      throw new BadRequestException('Omise secret key is not configured');
    }

    const satangs = Math.round(amountThb * 100);
    const returnUri = `${this.frontendUrl}/payment/omise-callback?orderNumber=${encodeURIComponent(orderNumber)}`;

    const chargeRes = await fetch(`${this.apiBase}/charges`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: satangs.toString(),
        currency: 'thb',
        card: omiseToken,
        return_uri: returnUri,
        'metadata[orderNumber]': orderNumber,
      }).toString(),
    });

    const charge = (await chargeRes.json()) as OmiseChargeData;

    if (!chargeRes.ok) {
      const msg = charge.failure_message || 'การชำระเงินผ่านบัตรไม่สำเร็จ';
      this.logger.warn(`Omise charge failed: ${msg}`);
      return {
        chargeId: charge.id || '',
        status: 'failed',
        authorizeUri: null,
        failureCode: charge.failure_code || 'charge_failed',
        failureMessage: msg,
      };
    }

    return {
      chargeId: charge.id,
      status: charge.status as 'successful' | 'pending' | 'failed',
      authorizeUri: charge.authorize_uri,
      failureCode: charge.failure_code,
      failureMessage: charge.failure_message,
      cardBrand: charge.card?.brand,
      cardLast4: charge.card?.last_digits,
    };
  }

  /**
   * Fetch latest charge information directly from Omise.
   */
  async getCharge(chargeId: string): Promise<OmiseChargeData> {
    const res = await fetch(`${this.apiBase}/charges/${chargeId}`, {
      headers: { Authorization: this.authHeader },
    });

    if (!res.ok) {
      throw new BadRequestException(`Charge #${chargeId} not found in Omise`);
    }

    return (await res.json()) as OmiseChargeData;
  }

  /**
   * Sandbox only: simulate mark charge as paid for testing.
   */
  async simulateMarkAsPaid(chargeId: string): Promise<OmiseChargeData> {
    const res = await fetch(
      `${this.apiBase}/charges/${chargeId}/mark_as_paid`,
      {
        method: 'POST',
        headers: { Authorization: this.authHeader },
      },
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new BadRequestException(
        err.message || 'Cannot mark charge as paid in Omise',
      );
    }

    return (await res.json()) as OmiseChargeData;
  }

  /**
   * Process refund for a charge through Omise.
   */
  async createRefund(
    chargeId: string,
    amountThb?: number,
  ): Promise<{ id: string }> {
    if (!this.secretKey) {
      throw new BadRequestException('Omise secret key is not configured');
    }

    const payload: Record<string, unknown> = {};
    if (amountThb !== undefined) {
      payload.amount = Math.round(amountThb * 100);
    }

    const res = await fetch(`${this.apiBase}/charges/${chargeId}/refunds`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      this.logger.error(
        `Omise refund error: ${err.message ?? 'Unknown error'}`,
      );
      throw new BadRequestException(
        err.message ?? 'Cannot process refund via Omise',
      );
    }

    return (await res.json()) as { id: string };
  }
}
