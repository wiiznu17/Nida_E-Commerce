import { PaymentMethod, PaymentStatus, OrderStatus } from '@repo/types';

/**
 * Formats internal payment method enum codes to clean, human-friendly localized titles.
 * Examples:
 *   formatPaymentMethod('CREDIT_CARD', 'th') -> "บัตรเครดิต"
 *   formatPaymentMethod('CREDIT_CARD', 'en') -> "Credit Card"
 *   formatPaymentMethod('PROMPTPAY', 'th') -> "พร้อมเพย์ QR"
 *   formatPaymentMethod('PROMPTPAY', 'en') -> "PromptPay QR"
 */
export function formatPaymentMethod(
  method?: string | null,
  language: string = 'th',
): string {
  const isTh = language === 'th';
  if (!method) {
    return isTh ? 'บัตรเครดิต' : 'Credit Card';
  }

  switch (method) {
    case PaymentMethod.CREDIT_CARD:
    case 'CREDIT_CARD':
      return isTh ? 'บัตรเครดิต' : 'Credit Card';
    case PaymentMethod.PROMPTPAY:
    case 'PROMPTPAY':
      return isTh ? 'พร้อมเพย์ QR' : 'PromptPay QR';
    case PaymentMethod.BANK_TRANSFER:
    case 'BANK_TRANSFER':
      return isTh ? 'โอนเงินธนาคาร' : 'Bank Transfer';
    case PaymentMethod.COD:
    case 'COD':
      return isTh ? 'เก็บเงินปลายทาง' : 'Cash on Delivery';
    default:
      return method.replace(/_/g, ' ');
  }
}

/**
 * Formats payment transaction status for customer order display.
 */
export function formatPaymentStatus(
  status?: string | null,
  orderStatus?: string | null,
  language: string = 'th',
): string {
  const isTh = language === 'th';
  if (
    status === PaymentStatus.CAPTURED ||
    orderStatus === OrderStatus.PAID ||
    orderStatus === OrderStatus.PROCESSING ||
    orderStatus === OrderStatus.SHIPPED ||
    orderStatus === OrderStatus.DELIVERED ||
    orderStatus === OrderStatus.COMPLETED
  ) {
    return isTh ? 'ชำระเรียบร้อย' : 'Paid';
  }

  if (status === PaymentStatus.FAILED) {
    return isTh ? 'ชำระเงินไม่สำเร็จ' : 'Failed';
  }

  if (status === PaymentStatus.REFUNDED || orderStatus === OrderStatus.REFUNDED) {
    return isTh ? 'คืนเงินแล้ว' : 'Refunded';
  }

  if (orderStatus === OrderStatus.CANCELLED) {
    return isTh ? 'ยกเลิกคำสั่งซื้อ' : 'Cancelled';
  }

  return isTh ? 'รอชำระเงิน' : 'Pending Payment';
}
