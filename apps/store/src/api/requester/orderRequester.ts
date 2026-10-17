import { apiClient } from '../client';
import type {
  ApiOrder,
  TrackingResult,
  PaymentMethod,
  CreateCancellationRequestDto,
  CreateReturnRequestDto,
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

export interface PayOrderResult {
  order: ApiOrder;
  authorizeUri?: string | null;
  qrDownloadUri?: string | null;
  expiresAt?: string | null;
}

export interface SyncOmiseStatusResult {
  order: ApiOrder;
  chargeStatus?: string;
  failureMessage?: string;
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

  /**
   * Complete payment for an order via Omise (supports Credit Card 3DS & PromptPay QR).
   */
  payOrder: async (
    orderNumber: string,
    payloadOrToken?:
      | {
          paymentMethod?: PaymentMethod;
          omiseToken?: string;
          cardLast4?: string;
          cardBrand?: string;
        }
      | string
      | null,
    maybeToken?: string | null,
  ): Promise<PayOrderResult> => {
    let payload: {
      paymentMethod?: PaymentMethod;
      omiseToken?: string;
      cardLast4?: string;
      cardBrand?: string;
    } = {};
    let token: string | null | undefined = maybeToken;

    if (typeof payloadOrToken === 'string' || payloadOrToken === null) {
      token = payloadOrToken;
    } else if (payloadOrToken) {
      payload = payloadOrToken;
    }

    return apiClient.post<PayOrderResult>(
      `/orders/${encodeURIComponent(orderNumber)}/pay`,
      payload,
      token,
    );
  },

  /**
   * Sync and retrieve the latest payment status directly with Omise.
   */
  syncOmiseStatus: async (
    orderNumber: string,
    token?: string | null,
  ): Promise<SyncOmiseStatusResult> => {
    return apiClient.get<SyncOmiseStatusResult>(
      `/orders/${encodeURIComponent(orderNumber)}/omise-status`,
      undefined,
      token,
    );
  },

  /**
   * Sandbox only: simulate instant PromptPay charge payment for testing.
   */
  simulateOmisePay: async (
    orderNumber: string,
    token?: string | null,
  ): Promise<ApiOrder> => {
    return apiClient.post<ApiOrder>(
      `/orders/${encodeURIComponent(orderNumber)}/omise-simulate-pay`,
      {},
      token,
    );
  },

  /**
   * Update payment method for a pending order.
   */
  updatePaymentMethod: async (
    orderNumber: string,
    paymentMethod: PaymentMethod,
    token?: string | null,
  ): Promise<ApiOrder> => {
    return apiClient.patch<ApiOrder>(
      `/orders/${encodeURIComponent(orderNumber)}/payment-method`,
      { paymentMethod },
      token,
    );
  },

  /**
   * Submit pre-fulfillment cancellation request.
   */
  requestCancellation: async (
    orderNumber: string,
    payload: CreateCancellationRequestDto,
    token?: string | null,
  ): Promise<ApiOrder> => {
    return apiClient.post<ApiOrder>(
      `/orders/${encodeURIComponent(orderNumber)}/cancellation-request`,
      payload,
      token,
    );
  },

  /**
   * Submit post-delivery return request.
   */
  requestReturn: async (
    orderNumber: string,
    payload: CreateReturnRequestDto,
    token?: string | null,
  ): Promise<ApiOrder> => {
    return apiClient.post<ApiOrder>(
      `/orders/${encodeURIComponent(orderNumber)}/return-request`,
      payload,
      token,
    );
  },
};

