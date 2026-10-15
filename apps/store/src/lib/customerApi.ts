import type {
  ApiUser,
  ApiOrder,
  TrackingResult,
  RequestOtpResponse,
  VerifyOtpResponse,
  PaymentMethod,
  CouponValidationResult,
  CheckoutCalculation,
} from '@repo/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

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

/**
 * Request 6-digit OTP code sent to customer email.
 */
export async function requestOtp(email: string): Promise<RequestOtpResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to request OTP');
  }

  return data;
}

/**
 * Verify OTP code and retrieve access token with customer profile.
 */
export async function verifyOtp(
  email: string,
  otpCode: string,
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otpCode }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid or expired OTP code');
  }

  return data;
}

/**
 * Get current customer profile using JWT token.
 */
export async function getCustomerProfile(token: string): Promise<ApiUser> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Unauthorized');
  }

  return data;
}

/**
 * Place a storefront customer order with atomic stock deduction.
 */
export async function createCustomerOrder(
  payload: CreateCustomerOrderPayload,
  token?: string | null,
): Promise<ApiOrder> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create order');
  }

  return data;
}

/**
 * Track an order by order number.
 */
export async function trackOrder(orderNumber: string): Promise<TrackingResult> {
  const res = await fetch(
    `${API_BASE_URL}/orders/track/${encodeURIComponent(orderNumber)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Order tracking not found');
  }

  return data;
}

/**
 * Get order detail by order number.
 */
export async function getOrderDetail(
  orderNumber: string,
  token?: string | null,
): Promise<ApiOrder> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}`,
    {
      method: 'GET',
      headers,
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Order not found');
  }

  return data;
}

/**
 * Validate promotional coupon code and calculate discount.
 */
export async function validateCoupon(
  code: string,
  orderAmount: number,
  userId?: string,
): Promise<CouponValidationResult> {
  const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code.trim().toUpperCase(),
      orderAmount,
      userId,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to validate coupon');
  }

  return data;
}

export interface CalculateCheckoutPayload {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  couponCode?: string;
  userId?: string;
}

/**
 * Calculate checkout totals including pro-rata discount, shipping fee, and tax.
 */
export async function calculateCheckout(
  payload: CalculateCheckoutPayload,
): Promise<CheckoutCalculation> {
  const res = await fetch(`${API_BASE_URL}/checkout/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      couponCode: payload.couponCode ? payload.couponCode.trim().toUpperCase() : undefined,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to calculate checkout');
  }

  return data;
}

