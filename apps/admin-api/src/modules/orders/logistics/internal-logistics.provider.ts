import { Injectable, BadRequestException } from '@nestjs/common';
import { CarrierCode, ShipmentStatus } from '@repo/types';
import { CarrierMockService } from '../carrier/carrier-mock.service.js';
import type {
  ILogisticsProvider,
  CreateShipmentInput,
  CreateShipmentResult,
  TrackingTimelineResult,
  ParsedLogisticsWebhook,
} from './logistics.interface.js';

@Injectable()
export class InternalLogisticsProvider implements ILogisticsProvider {
  readonly providerName = 'internal';

  constructor(private readonly carrierMockService: CarrierMockService) {}

  async createShipment(
    input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    const carrier = input.carrierCode ?? CarrierCode.KERRY_EXPRESS;
    const booking = await this.carrierMockService.bookConsignment(
      input.orderNumber,
      carrier,
    );

    return {
      trackingNumber: booking.trackingNumber,
      courierName: booking.courierName,
      carrierCode: booking.carrierCode,
      estimatedDelivery: booking.estimatedDelivery,
      labelUrl: `https://shipping.nida-apparel.internal/labels/${booking.trackingNumber}.pdf`,
      initialLog: {
        statusTitle: 'สร้างหมายเลขพัสดุและเตรียมการจัดส่ง',
        statusDescription: `ออกหมายเลขพัสดุผ่านระบบ ${booking.courierName} สำหรับออเดอร์ #${input.orderNumber}`,
        location: booking.initialLocation,
        logTimestamp: new Date(),
      },
    };
  }

  async getTrackingTimeline(
    trackingNumber: string,
  ): Promise<TrackingTimelineResult> {
    const isDelivered = trackingNumber.endsWith('9') || trackingNumber.endsWith('D');
    const now = new Date();
    const createdTime = new Date(now.getTime() - 86400000 * 2);
    const pickedTime = new Date(now.getTime() - 86400000);

    const events = [
      {
        statusTitle: 'สร้างหมายเลขพัสดุและเตรียมการจัดส่ง',
        statusDescription: 'ศูนย์กระจายสินค้า NIDA บรรจุพัสดุเรียบร้อย รอนัดรถเข้ารับ',
        location: 'ศูนย์กระจายสินค้า NIDA (กรุงเทพมหานคร)',
        timestamp: createdTime,
      },
      {
        statusTitle: 'บริษัทขนส่งเข้ารับพัสดุเรียบร้อยแล้ว',
        statusDescription: 'พนักงานขนส่งสแกนรับพัสดุขึ้นรถขนส่งสาขาต้นทาง',
        location: 'ศูนย์กระจายสินค้า NIDA (กรุงเทพมหานคร)',
        timestamp: pickedTime,
      },
    ];

    if (isDelivered) {
      events.push({
        statusTitle: 'จัดส่งพัสดุสำเร็จ',
        statusDescription: 'พัสดุนำจ่ายถึงมือผู้รับเรียบร้อย ลงชื่อรับโดยผู้รับปลายทาง',
        location: 'ที่อยู่ปลายทางของผู้รับ',
        timestamp: now,
      });
    } else {
      events.push({
        statusTitle: 'พัสดุถึงศูนย์คัดแยกกลาง',
        statusDescription: 'พัสดุอยู่ระหว่างการส่งต่อไปยังศูนย์กระจายสินค้าปลายทาง',
        location: 'ศูนย์คัดแยกหลัก',
        timestamp: now,
      });
    }

    return {
      trackingNumber,
      courierName: 'Internal Carrier Mock',
      status: isDelivered ? ShipmentStatus.DELIVERED : ShipmentStatus.IN_TRANSIT,
      events,
    };
  }

  async getShippingLabelUrl(trackingNumber: string): Promise<string> {
    return `https://shipping.nida-apparel.internal/labels/${trackingNumber}.pdf`;
  }

  async parseWebhook(
    payload: unknown,
  ): Promise<ParsedLogisticsWebhook | null> {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const body = payload as Record<string, unknown>;
    const trackingNumber =
      typeof body.trackingNumber === 'string' ? body.trackingNumber : null;

    if (!trackingNumber) {
      return null;
    }

    const rawStatus = String(body.status ?? '').toUpperCase();
    let shipmentStatus: ShipmentStatus = ShipmentStatus.IN_TRANSIT;
    let isDelivered = false;

    if (rawStatus === 'DELIVERED') {
      shipmentStatus = ShipmentStatus.DELIVERED;
      isDelivered = true;
    } else if (rawStatus === 'OUT_FOR_DELIVERY') {
      shipmentStatus = ShipmentStatus.OUT_FOR_DELIVERY;
    } else if (rawStatus === 'PICKED_UP') {
      shipmentStatus = ShipmentStatus.PICKED_UP;
    } else if (rawStatus === 'FAILED') {
      shipmentStatus = ShipmentStatus.FAILED;
    }

    return {
      trackingNumber,
      shipmentStatus,
      statusTitle: String(body.title ?? 'อัปเดตสถานะการจัดส่ง'),
      statusDescription:
        typeof body.description === 'string' ? body.description : undefined,
      location: typeof body.location === 'string' ? body.location : undefined,
      eventTimestamp: body.timestamp ? new Date(String(body.timestamp)) : new Date(),
      isDelivered,
    };
  }
}
