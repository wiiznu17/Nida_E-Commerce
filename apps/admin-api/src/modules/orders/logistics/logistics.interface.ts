import type { CarrierCode, ShipmentStatus } from '@repo/types';

export interface CreateShipmentAddress {
  recipientName?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country?: string;
}

export interface CreateShipmentInput {
  orderId: string;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: CreateShipmentAddress;
  carrierCode?: CarrierCode;
  weightGrams?: number;
}

export interface CreateShipmentResult {
  trackingNumber: string;
  courierName: string;
  carrierCode: CarrierCode;
  labelUrl?: string;
  estimatedDelivery?: Date;
  initialLog: {
    statusTitle: string;
    statusDescription?: string;
    location?: string;
    logTimestamp: Date;
  };
}

export interface TrackingTimelineEvent {
  statusTitle: string;
  statusDescription?: string;
  location?: string;
  timestamp: Date;
}

export interface TrackingTimelineResult {
  trackingNumber: string;
  courierName: string;
  status: ShipmentStatus;
  events: TrackingTimelineEvent[];
}

export interface ParsedLogisticsWebhook {
  trackingNumber: string;
  shipmentStatus: ShipmentStatus;
  statusTitle: string;
  statusDescription?: string;
  location?: string;
  eventTimestamp: Date;
  isDelivered: boolean;
}

export interface ILogisticsProvider {
  readonly providerName: string;
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
  getTrackingTimeline(trackingNumber: string): Promise<TrackingTimelineResult>;
  getShippingLabelUrl(trackingNumber: string): Promise<string>;
  parseWebhook(
    payload: unknown,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<ParsedLogisticsWebhook | null>;
}
