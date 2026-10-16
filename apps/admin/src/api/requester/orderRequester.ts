import { apiClient } from '../client';
import type {
  ApiOrder,
  OrderStatus,
  CarrierCode,
  ApiShipment,
  ShipmentStatus,
} from '@repo/types';

export interface FulfillOrderPayload {
  courierName: string;
  trackingNumber: string;
  initialStatusTitle?: string;
  estimatedDelivery?: string;
}

export interface UpdateShipmentStatusPayload {
  status: ShipmentStatus;
  statusTitle: string;
  statusDescription?: string;
  location?: string;
}

export const orderRequester = {
  async getOrders(): Promise<ApiOrder[]> {
    const data = await apiClient.get<ApiOrder[]>('/orders');
    return data;
  },

  async getByNumber(orderNumber: string): Promise<ApiOrder> {
    const data = await apiClient.get<ApiOrder>(`/orders/${orderNumber}`);
    return data;
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string,
  ): Promise<ApiOrder> {
    const data = await apiClient.patch<ApiOrder>(`/orders/${id}/status`, {
      status,
      courierName,
      trackingNumber,
    });
    return data;
  },

  async fulfill(
    orderIdentifier: string,
    payload: FulfillOrderPayload,
  ): Promise<unknown> {
    const data = await apiClient.post(
      `/orders/${orderIdentifier}/fulfill`,
      payload,
    );
    return data;
  },

  async bookCarrier(
    orderIdOrNumber: string,
    carrierCode: CarrierCode,
  ): Promise<ApiOrder> {
    const data = await apiClient.post<ApiOrder>(
      `/orders/${orderIdOrNumber}/carrier-booking`,
      {
        carrierCode,
      },
    );
    return data;
  },

  async updateShipmentStatus(
    shipmentId: string,
    payload: UpdateShipmentStatusPayload,
  ): Promise<ApiShipment> {
    const data = await apiClient.post<ApiShipment>(
      `/admin/shipments/${shipmentId}/update-status`,
      payload,
    );
    return data;
  },
};

export const ordersApi = orderRequester;

