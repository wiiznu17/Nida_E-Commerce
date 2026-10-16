import { apiClient } from '../client';
import type {
  ApiOrder,
  TrackingResult,
  PaymentMethod,
} from '@repo/types';

export interface CreateCustomerOrderPayload {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  shippingAddress: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerEmail?: string;
}

export const orderRequester = {
  /**
   * Place a customer order with atomic stock deduction and checkout calculation.
   */
  createOrder: async (
    payload: CreateCustomerOrderPayload,
    token?: string | null,
  ): Promise<ApiOrder> => {
    return apiClient.post<ApiOrder>('/orders', payload, token);
  },

  /**
   * Track order by human-friendly order number.
   */
  trackOrder: async (orderNumber: string): Promise<TrackingResult> => {
    return apiClient.get<TrackingResult>(
      `/orders/track/${encodeURIComponent(orderNumber)}`,
    );
  },

  /**
   * Track order using order number and phone (for guest customers).
   */
  trackOrderByQuery: async (
    orderNumber: string,
    phone?: string,
  ): Promise<TrackingResult> => {
    return apiClient.post<TrackingResult>('/orders/track', {
      orderNumber,
      phone,
    });
  },

  /**
   * Get full order history for authenticated customer.
   */
  getMyOrders: async (token?: string | null): Promise<ApiOrder[]> => {
    return apiClient.get<ApiOrder[]>('/orders/my-orders', undefined, token);
  },

  /**
   * Get full order details by order number.
   */
  getOrderDetail: async (
    orderNumber: string,
    token?: string | null,
  ): Promise<ApiOrder> => {
    return apiClient.get<ApiOrder>(
      `/orders/${encodeURIComponent(orderNumber)}`,
      undefined,
      token,
    );
  },
};

