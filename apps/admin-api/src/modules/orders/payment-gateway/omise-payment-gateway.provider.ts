import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, RefundStatus } from '@repo/types';
import type {
  IPaymentGatewayProvider,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  CreateRefundInput,
  CreateRefundResult,
  ParsedPaymentWebhook,
} from './payment-gateway.interface.js';

interface OmiseChargeResponse {
  id?: string;
  status?: string;
  authorize_uri?: string;
  source?: {
    type?: string;
    scannable_code?: {
      image?: {
        download_uri?: string;
      };
    };
  };
  card?: {
    last_digits?: string;
    brand?: string;
  };
}

interface OmiseEventPayload {
  id?: string;
  key?: string;
  data?: OmiseChargeResponse;
}

@Injectable()
export class OmisePaymentGatewayProvider implements IPaymentGatewayProvider {
  readonly providerName = 'omise';
  private readonly logger = new Logger(OmisePaymentGatewayProvider.name);
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.omise.co';

  constructor() {
    this.secretKey = process.env.OMISE_SECRET_KEY ?? '';
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentResult> {
    if (!this.secretKey) {
      this.logger.warn(
        'OMISE_SECRET_KEY is not configured. Falling back to sandbox response.',
      );
      const fallbackRef = `chrg_test_${Date.now()}`;
      return {
        transactionReference: fallbackRef,
        status: PaymentStatus.PENDING,
        qrCodeUrl:
          input.paymentMethod === PaymentMethod.PROMPTPAY
            ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=OMISE-PROMPTPAY-${input.amount}`
            : undefined,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
    }

    try {
      const amountInSatang = Math.round(input.amount * 100);
      const authHeader = `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`;

      if (input.paymentMethod === PaymentMethod.PROMPTPAY) {
        // Create PromptPay Source and Charge
        const sourceRes = await fetch(`${this.baseUrl}/sources`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInSatang,
            currency: 'thb',
            type: 'promptpay',
          }),
        });
        const sourceJson = (await sourceRes.json()) as { id?: string };

        const chargeRes = await fetch(`${this.baseUrl}/charges`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInSatang,
            currency: 'thb',
            source: sourceJson.id,
            description: `Order #${input.orderNumber}`,
          }),
        });
        const chargeJson = (await chargeRes.json()) as OmiseChargeResponse;

        return {
          transactionReference: chargeJson.id ?? `chrg_test_${Date.now()}`,
          status: PaymentStatus.PENDING,
          qrCodeUrl: chargeJson.source?.scannable_code?.image?.download_uri,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };
      }

      if (input.paymentMethod === PaymentMethod.CREDIT_CARD) {
        const chargeRes = await fetch(`${this.baseUrl}/charges`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInSatang,
            currency: 'thb',
            card: input.cardToken,
            return_uri: input.returnUri,
            description: `Order #${input.orderNumber}`,
          }),
        });
        const chargeJson = (await chargeRes.json()) as OmiseChargeResponse;

        const isSuccessful = chargeJson.status === 'successful';
        const isPending = chargeJson.status === 'pending';

        return {
          transactionReference: chargeJson.id ?? `chrg_test_${Date.now()}`,
          status: isSuccessful
            ? PaymentStatus.CAPTURED
            : isPending
              ? PaymentStatus.PENDING
              : PaymentStatus.FAILED,
          authorizeUri: chargeJson.authorize_uri,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };
      }

      throw new BadRequestException('รูปแบบการชำระเงินไม่รองรับผ่าน Omise');
    } catch (err: unknown) {
      this.logger.error('Failed to create Omise payment intent:', err);
      throw new BadRequestException('ไม่สามารถสร้างรายการชำระเงินผ่าน Omise ได้');
    }
  }

  async checkPaymentStatus(
    transactionReference: string,
  ): Promise<PaymentStatus> {
    if (!this.secretKey) {
      return PaymentStatus.CAPTURED;
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`;
      const res = await fetch(`${this.baseUrl}/charges/${transactionReference}`, {
        headers: { Authorization: authHeader },
      });
      const charge = (await res.json()) as OmiseChargeResponse;

      if (charge.status === 'successful') {
        return PaymentStatus.CAPTURED;
      }
      if (charge.status === 'failed') {
        return PaymentStatus.FAILED;
      }
      return PaymentStatus.PENDING;
    } catch (err: unknown) {
      this.logger.error(`Error checking Omise status for ${transactionReference}:`, err);
      return PaymentStatus.PENDING;
    }
  }

  async createRefund(input: CreateRefundInput): Promise<CreateRefundResult> {
    if (!this.secretKey) {
      return {
        gatewayRefundId: `rfnd_test_${Date.now()}`,
        status: RefundStatus.SUCCEEDED,
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`;
      const amountInSatang = Math.round(input.amount * 100);

      const res = await fetch(
        `${this.baseUrl}/charges/${input.transactionReference}/refunds`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInSatang,
          }),
        },
      );
      const json = (await res.json()) as { id?: string };

      return {
        gatewayRefundId: json.id ?? `rfnd_test_${Date.now()}`,
        status: RefundStatus.SUCCEEDED,
      };
    } catch (err: unknown) {
      this.logger.error('Error creating Omise refund:', err);
      throw new BadRequestException('ไม่สามารถดำเนินการคืนเงินผ่าน Omise ได้');
    }
  }

  async parseWebhook(
    payload: unknown,
  ): Promise<ParsedPaymentWebhook | null> {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const event = payload as OmiseEventPayload;
    if (event.key !== 'charge.complete' || !event.data?.id) {
      return null;
    }

    const charge = event.data;
    const chargeId = charge.id;
    if (!chargeId) {
      return null;
    }
    const isSuccessful = charge.status === 'successful';

    return {
      transactionReference: chargeId,
      gatewayEventId: event.id ?? `evnt_${Date.now()}`,
      paymentStatus: isSuccessful ? PaymentStatus.CAPTURED : PaymentStatus.FAILED,
      isSuccessful,
      paidAt: isSuccessful ? new Date() : undefined,
      cardLast4: charge.card?.last_digits,
      cardBrand: charge.card?.brand,
    };
  }
}
