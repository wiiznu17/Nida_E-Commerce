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
  AdminOrderQueryParams,
  PaginatedOrdersResponse,
  AdminCancellationQueryParams,
  PaginatedCancellationsResponse,
  AdminReturnQueryParams,
  PaginatedReturnsResponse,
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
  async getOrders(
    params?: AdminOrderQueryParams,
  ): Promise<PaginatedOrdersResponse> {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.status && params.status !== 'ALL')
      sp.set('status', params.status);
    if (params?.paymentMethod && params.paymentMethod !== 'ALL')
      sp.set('paymentMethod', params.paymentMethod);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.page) sp.set('page', params.page.toString());
    if (params?.pageSize) sp.set('pageSize', params.pageSize.toString());
    const query = sp.toString() ? `?${sp.toString()}` : '';
    const data = await apiClient.get<PaginatedOrdersResponse>(
      `/orders${query}`,
    );
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

  async getCancellationRequests(
    params?: AdminCancellationQueryParams,
  ): Promise<PaginatedCancellationsResponse> {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.status && params.status !== 'ALL')
      sp.set('status', params.status);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.page) sp.set('page', params.page.toString());
    if (params?.pageSize) sp.set('pageSize', params.pageSize.toString());
    const query = sp.toString() ? `?${sp.toString()}` : '';
    const data = await apiClient.get<PaginatedCancellationsResponse>(
      `/cancellation-requests${query}`,
    );
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

  async getReturnRequests(
    params?: AdminReturnQueryParams,
  ): Promise<PaginatedReturnsResponse> {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.status && params.status !== 'ALL')
      sp.set('status', params.status);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.page) sp.set('page', params.page.toString());
    if (params?.pageSize) sp.set('pageSize', params.pageSize.toString());
    const query = sp.toString() ? `?${sp.toString()}` : '';
    const data = await apiClient.get<PaginatedReturnsResponse>(
      `/return-requests${query}`,
    );
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
