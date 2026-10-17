import type { ApiAddress, PaymentMethod } from '@repo/types';

export interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  city: string;
  postalCode: string;
}

export type CheckoutStep = 'shipping' | 'payment';
export type PaymentMethodOption = 'card' | 'promptpay';

export interface CardFormData {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}
