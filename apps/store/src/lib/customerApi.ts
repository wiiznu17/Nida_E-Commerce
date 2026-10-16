/**
 * Customer API Adapter (Legacy compatibility wrapper)
 *
 * All implementations now route cleanly through the unified @/api layer
 * mirroring apps/admin/src/api.
 */

import {
  authRequester,
  orderRequester,
  couponRequester,
  addressRequester,
  type CreateCustomerOrderPayload,
  type CalculateCheckoutPayload,
} from '@/api';
import type {
  ApiUser,
  ApiOrder,
  ApiAddress,
  CreateAddressDto,
  UpdateAddressDto,
  TrackingResult,
  RequestOtpResponse,
  VerifyOtpResponse,
  CouponValidationResult,
  CheckoutCalculation,
} from '@repo/types';

export type { CreateCustomerOrderPayload, CalculateCheckoutPayload };
export { addressRequester };


export async function requestOtp(email: string): Promise<RequestOtpResponse> {
  return authRequester.requestOtp(email);
}

export async function verifyOtp(
  email: string,
  otpCode: string,
): Promise<VerifyOtpResponse> {
  return authRequester.verifyOtp(email, otpCode);
}

export async function getCustomerProfile(
  token?: string | null,
): Promise<ApiUser> {
  return authRequester.getProfile(token);
}

export async function createCustomerOrder(
  payload: CreateCustomerOrderPayload,
  token?: string | null,
): Promise<ApiOrder> {
  return orderRequester.createOrder(payload, token);
}

export async function trackOrder(orderNumber: string): Promise<TrackingResult> {
  return orderRequester.trackOrder(orderNumber);
}

export async function getOrderDetail(
  orderNumber: string,
  token?: string | null,
): Promise<ApiOrder> {
  return orderRequester.getOrderDetail(orderNumber, token);
}

export async function validateCoupon(
  code: string,
  orderAmount: number,
  userId?: string,
): Promise<CouponValidationResult> {
  return couponRequester.validate(code, orderAmount, userId);
}

export async function calculateCheckout(
  payload: CalculateCheckoutPayload,
): Promise<CheckoutCalculation> {
  return couponRequester.calculateCheckout(payload);
}

export async function getCustomerAddresses(
  token?: string | null,
): Promise<ApiAddress[]> {
  return addressRequester.getAddresses(token);
}

export async function createCustomerAddress(
  data: CreateAddressDto,
  token?: string | null,
): Promise<ApiAddress> {
  return addressRequester.createAddress(data, token);
}

export async function updateCustomerAddress(
  id: string,
  data: UpdateAddressDto,
  token?: string | null,
): Promise<ApiAddress> {
  return addressRequester.updateAddress(id, data, token);
}

export async function deleteCustomerAddress(
  id: string,
  token?: string | null,
): Promise<{ success: boolean }> {
  return addressRequester.deleteAddress(id, token);
}

export async function setDefaultCustomerAddress(
  id: string,
  token?: string | null,
): Promise<ApiAddress> {
  return addressRequester.setDefaultAddress(id, token);
}

