import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CarrierCode, ShipmentStatus } from '@repo/types';
import type {
  ILogisticsProvider,
  CreateShipmentInput,
  CreateShipmentResult,
  TrackingTimelineResult,
  ParsedLogisticsWebhook,
  TrackingTimelineEvent,
} from './logistics.interface.js';

interface ShippopStateItem {
  status?: string;
  code?: string;
  title?: string;
  description?: string;
  datetime?: string;
  location?: string;
}

interface ShippopWebhookPayload {
  order_status?: string;
  tracking_code?: string;
  courier_tracking_code?: string;
  courier_code?: string;
  states?: ShippopStateItem[];
  state?: ShippopStateItem[];
  info?: {
    signerTypeText?: string;
    pod?: string;
  };
}

@Injectable()
export class ShippopLogisticsProvider implements ILogisticsProvider {
  readonly providerName = 'shippop';
  private readonly logger = new Logger(ShippopLogisticsProvider.name);
  private readonly apiKey: string;
  private readonly endpointUrl: string;

  constructor() {
    this.apiKey = process.env.SHIPPOP_API_KEY ?? '';
    this.endpointUrl =
      process.env.SHIPPOP_ENDPOINT_URL ?? 'https://mkpservice.shippop.com';
  }

  async createShipment(
    input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    if (!this.apiKey) {
      this.logger.warn(
        'SHIPPOP_API_KEY is not configured. Falling back to generated mock tracking.',
      );
      const fallbackTracking = `SPP${Math.floor(100000000 + Math.random() * 900000000)}`;
      return {
        trackingNumber: fallbackTracking,
        courierName: 'SHIPPOP Partner (Sandbox)',
        carrierCode: input.carrierCode ?? CarrierCode.FLASH_EXPRESS,
        labelUrl: `${this.endpointUrl}/label/?tracking_code=${fallbackTracking}`,
        initialLog: {
          statusTitle: 'จองหมายเลขพัสดุผ่าน SHIPPOP สำเร็จ',
          statusDescription: `บันทึกคำสั่งจองพัสดุสำหรับออเดอร์ #${input.orderNumber} ในระบบ SHIPPOP`,
          location: 'กรุงเทพมหานคร',
          logTimestamp: new Date(),
        },
      };
    }

    try {
      const payload = {
        api_key: this.apiKey,
        data: [
          {
            from: {
              name: 'NIDA Luxury Apparel Fulfillment',
              address: '99/1 Sukhumvit 55',
              district: 'Watthana',
              state: 'Bangkok',
              province: 'Bangkok',
              postcode: '10110',
              tel: '020000000',
            },
            to: {
              name: input.recipientName,
              address:
                `${input.shippingAddress.addressLine1} ${input.shippingAddress.addressLine2 ?? ''}`.trim(),
              district: input.shippingAddress.district,
              state: input.shippingAddress.province,
              province: input.shippingAddress.province,
              postcode: input.shippingAddress.postalCode,
              tel: input.recipientPhone,
            },
            parcel: {
              name: `Order ${input.orderNumber}`,
              weight: input.weightGrams ?? 500,
              width: 20,
              length: 30,
              height: 10,
            },
            courier_code: this.mapCarrierToShippopCode(input.carrierCode),
          },
        ],
      };

      const response = await fetch(`${this.endpointUrl}/booking/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as Record<string, unknown>;
      const dataArray = Array.isArray(json.data) ? json.data : [];
      const firstResult = dataArray[0] as Record<string, unknown> | undefined;

      const trackingNumber =
        (typeof firstResult?.tracking_code === 'string'
          ? firstResult.tracking_code
          : null) ??
        (typeof firstResult?.courier_tracking_code === 'string'
          ? firstResult.courier_tracking_code
          : null) ??
        `SPP${Date.now()}`;

      const courierName =
        typeof firstResult?.courier_code === 'string'
          ? `SHIPPOP (${firstResult.courier_code.toUpperCase()})`
          : 'SHIPPOP Partner';

      return {
        trackingNumber,
        courierName,
        carrierCode: input.carrierCode ?? CarrierCode.FLASH_EXPRESS,
        labelUrl: `${this.endpointUrl}/label/?tracking_code=${trackingNumber}`,
        initialLog: {
          statusTitle: 'จองหมายเลขพัสดุผ่าน SHIPPOP สำเร็จ',
          statusDescription: `ออกหมายเลขพัสดุ ${trackingNumber} สำหรับออเดอร์ #${input.orderNumber}`,
          location: 'กรุงเทพมหานคร',
          logTimestamp: new Date(),
        },
      };
    } catch (err: unknown) {
      this.logger.error('Failed to create SHIPPOP booking:', err);
      throw new BadRequestException(
        'ไม่สามารถเชื่อมต่อกับ SHIPPOP Gateway ได้',
      );
    }
  }

  async getTrackingTimeline(
    trackingNumber: string,
  ): Promise<TrackingTimelineResult> {
    if (!this.apiKey) {
      return {
        trackingNumber,
        courierName: 'SHIPPOP Partner',
        status: ShipmentStatus.IN_TRANSIT,
        events: [
          {
            statusTitle: 'จองหมายเลขพัสดุผ่าน SHIPPOP',
            statusDescription: 'ระบบทำการจองหมายเลขพัสดุเรียบร้อย',
            location: 'กรุงเทพมหานคร',
            timestamp: new Date(),
          },
        ],
      };
    }

    try {
      const response = await fetch(
        `${this.endpointUrl}/tracking/?api_key=${this.apiKey}&tracking_code=${encodeURIComponent(trackingNumber)}`,
      );
      const json = (await response.json()) as ShippopWebhookPayload;
      const states = json.states ?? json.state ?? [];

      const events: TrackingTimelineEvent[] = states.map((s) => ({
        statusTitle: s.title ?? this.mapShippopCodeToTitle(s.status ?? s.code),
        statusDescription: s.description ?? undefined,
        location: s.location ?? undefined,
        timestamp: s.datetime ? new Date(s.datetime) : new Date(),
      }));

      const parsedStatus = this.mapShippopOrderStatus(json.order_status);

      return {
        trackingNumber,
        courierName: json.courier_code
          ? `SHIPPOP (${json.courier_code})`
          : 'SHIPPOP Partner',
        status: parsedStatus.status,
        events,
      };
    } catch (err: unknown) {
      this.logger.error(
        `Error querying SHIPPOP tracking for ${trackingNumber}:`,
        err,
      );
      return {
        trackingNumber,
        courierName: 'SHIPPOP Partner',
        status: ShipmentStatus.IN_TRANSIT,
        events: [],
      };
    }
  }

  async getShippingLabelUrl(trackingNumber: string): Promise<string> {
    return `${this.endpointUrl}/label/?api_key=${this.apiKey}&tracking_code=${encodeURIComponent(trackingNumber)}`;
  }

  async parseWebhook(payload: unknown): Promise<ParsedLogisticsWebhook | null> {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const body = payload as ShippopWebhookPayload;
    const trackingNumber =
      body.courier_tracking_code ?? body.tracking_code ?? null;

    if (!trackingNumber) {
      return null;
    }

    const { status: shipmentStatus, isDelivered } = this.mapShippopOrderStatus(
      body.order_status,
    );

    const states = body.states ?? body.state ?? [];
    const latestState =
      states.length > 0 ? states[states.length - 1] : undefined;

    let statusTitle = this.mapShippopCodeToTitle(
      latestState?.status ?? latestState?.code ?? body.order_status,
    );
    let statusDescription = latestState?.description;

    if (isDelivered && body.info?.signerTypeText) {
      statusTitle = `จัดส่งสำเร็จ (ลงชื่อรับโดย: ${body.info.signerTypeText})`;
      if (body.info.pod) {
        statusDescription = statusDescription
          ? `${statusDescription} | รูปถ่ายส่งมอบ: ${body.info.pod}`
          : `รูปถ่ายส่งมอบ: ${body.info.pod}`;
      }
    }

    const eventTimestamp = latestState?.datetime
      ? new Date(latestState.datetime)
      : new Date();

    return {
      trackingNumber,
      shipmentStatus,
      statusTitle,
      statusDescription,
      location: latestState?.location,
      eventTimestamp,
      isDelivered,
    };
  }

  private mapCarrierToShippopCode(carrier?: CarrierCode): string {
    switch (carrier) {
      case CarrierCode.KERRY_EXPRESS:
        return 'kerry';
      case CarrierCode.FLASH_EXPRESS:
        return 'flash';
      case CarrierCode.THAILAND_POST_EMS:
        return 'ems';
      case CarrierCode.DHL_EXPRESS:
        return 'dhl';
      default:
        return 'flash';
    }
  }

  private mapShippopOrderStatus(orderStatus?: string): {
    status: ShipmentStatus;
    isDelivered: boolean;
  } {
    const s = String(orderStatus ?? '').toLowerCase();
    if (s === 'complete') {
      return { status: ShipmentStatus.DELIVERED, isDelivered: true };
    }
    if (s === 'problem' || s === 'return' || s === 'cancel') {
      return { status: ShipmentStatus.FAILED, isDelivered: false };
    }
    if (s === 'shipping') {
      return { status: ShipmentStatus.IN_TRANSIT, isDelivered: false };
    }
    return { status: ShipmentStatus.LABEL_CREATED, isDelivered: false };
  }

  private mapShippopCodeToTitle(code?: string): string {
    const c = String(code ?? '').toUpperCase();
    if (c === '010' || c === 'WAIT_PICKUP') {
      return 'บริษัทขนส่งเข้ารับพัสดุเรียบร้อยแล้ว';
    }
    if (c === '102' || c === 'HUB') {
      return 'พัสดุถึงศูนย์คัดแยกและอยู่ระหว่างส่งต่อ';
    }
    if (c === '103' || c === 'DESTINATION') {
      return 'พัสดุถึงศูนย์กระจายสินค้าปลายทาง';
    }
    if (c === '045' || c === 'OUT_FOR_DELIVERY') {
      return 'พนักงานกำลังนำจ่ายพัสดุให้แก่ท่าน';
    }
    if (c === 'POD' || c === 'COMPLETE') {
      return 'จัดส่งพัสดุสำเร็จ';
    }
    if (c === '050' || c === 'PROBLEM') {
      return 'นำจ่ายไม่สำเร็จ อยู่ระหว่างจัดรอบนำจ่ายใหม่';
    }
    if (c === 'RTS' || c === 'RETURN') {
      return 'พัสดุตีกลับศูนย์กระจายสินค้า NIDA';
    }
    return 'พัสดุอยู่ระหว่างการขนส่ง';
  }
}
