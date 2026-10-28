import { PaymentMethod } from '@repo/types';

/**
 * Formats internal payment method enum codes to clean, human-friendly titles for Admin UI.
 * Examples:
 *   formatPaymentMethod('CREDIT_CARD') -> "Credit Card"
 *   formatPaymentMethod('PROMPTPAY') -> "PromptPay QR"
 *   formatPaymentMethod('BANK_TRANSFER') -> "Bank Transfer"
 *   formatPaymentMethod('COD') -> "Cash on Delivery"
 */
export function formatPaymentMethod(method?: string | null): string {
  if (!method) return 'Credit Card';

  switch (method) {
    case PaymentMethod.CREDIT_CARD:
    case 'CREDIT_CARD':
      return 'Credit Card';
    case PaymentMethod.PROMPTPAY:
    case 'PROMPTPAY':
      return 'PromptPay QR';
    case PaymentMethod.BANK_TRANSFER:
    case 'BANK_TRANSFER':
      return 'Bank Transfer';
    case PaymentMethod.COD:
    case 'COD':
      return 'Cash on Delivery';
    default:
      return method.replace(/_/g, ' ');
  }
}
