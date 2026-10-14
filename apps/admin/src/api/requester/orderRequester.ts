import { apiClient } from '../client';
import type { ApiOrder, OrderStatus, CarrierCode } from '@repo/types';
import type { AdminOrder } from '../../data/adminData';

export function mapApiOrderToAdminOrder(api: ApiOrder): AdminOrder {
  return {
    id: api.id,
    orderNumber: api.orderNumber,
    customerName: api.shippingAddress?.recipientName || 'Valued Customer',
    customerEmail: 'customer@nida.com',
    customerPhone: api.shippingAddress?.phone || '-',
    shippingAddress: api.shippingAddress?.addressLine1 || '-',
    city: api.shippingAddress?.province || '-',
    postalCode: api.shippingAddress?.postalCode || '-',
    items: (api.items ?? []).map((i) => ({
      productId: i.id,
      productName: i.productName,
      size: i.variantInfo,
      color: 'Standard',
      quantity: i.quantity,
      price: i.unitPrice,
      image: i.imageUrl ?? '',
    })),
    totalAmount: api.totalAmount,
    paymentMethod: api.payment?.paymentMethod ?? 'CREDIT_CARD',
    status: api.status as AdminOrder['status'],
    courierName: api.shipments?.[0]?.courierName,
    trackingNumber: api.shipments?.[0]?.trackingNumber,
    createdAt: api.placedAt,
  };
}

export interface FulfillOrderPayload {
  courierName: string;
  trackingNumber: string;
  initialStatusTitle?: string;
  estimatedDelivery?: string;
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

  async fulfill(orderIdentifier: string, payload: FulfillOrderPayload): Promise<unknown> {
    const data = await apiClient.post(`/orders/${orderIdentifier}/fulfill`, payload);
    return data;
  },

  async bookCarrier(
    orderIdOrNumber: string,
    carrierCode: CarrierCode,
  ): Promise<ApiOrder> {
    const data = await apiClient.post<ApiOrder>(
      `/orders/${orderIdOrNumber}/carrier-booking`,
      { carrierCode },
    );
    return data;
  },
};

export const ordersApi = orderRequester;
