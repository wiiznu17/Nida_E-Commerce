import { apiClient } from '../client';
import type {
  ApiOrder,
  OrderStatus,
  CarrierCode,
  ApiShipment,
  ShipmentStatus,
  ProcessRefundDto,
  ReviewCancellationRequestDto,
  ReviewReturnRequestDto,
  CancellationRequestStatus,
  ReturnStatus,
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
    transactionReference?: string,
    overrideReason?: string,
  ): Promise<ApiOrder> {
    const data = await apiClient.patch<ApiOrder>(`/orders/${id}/status`, {
      status,
      courierName,
      trackingNumber,
      transactionReference,
      overrideReason,
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

  async refundOrder(id: string, payload: ProcessRefundDto): Promise<ApiOrder> {
    const data = await apiClient.post<ApiOrder>(
      `/orders/${id}/refund`,
      payload,
    );
    return data;
  },

  async getCancellationRequests(status?: CancellationRequestStatus) {
    const query = status ? `?status=${status}` : '';
    const data = await apiClient.get(`/cancellation-requests${query}`);
    return data;
  },

  async reviewCancellationRequest(
    id: string,
    payload: ReviewCancellationRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    const data = await apiClient.post<{ success: boolean; message: string }>(
      `/cancellation-requests/${id}/review`,
      payload,
    );
    return data;
  },

  async getReturnRequests(status?: ReturnStatus) {
    const query = status ? `?status=${status}` : '';
    const data = await apiClient.get(`/return-requests${query}`);
    return data;
  },

  async reviewReturnRequest(
    id: string,
    payload: ReviewReturnRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    const data = await apiClient.post<{ success: boolean; message: string }>(
      `/return-requests/${id}/review`,
      payload,
    );
    return data;
  },
};

export const ordersApi = orderRequester;


