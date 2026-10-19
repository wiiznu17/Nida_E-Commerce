// ====================================================
// Order Lifecycle Queue Constants & Job Payloads
// ====================================================

export const OrderLifecycleQueueName = {
  ORDER_TIMEOUT: 'order-timeout-queue',
  CANCELLATION_REVIEW: 'cancellation-review-queue',
  DELIVERY_COMPLETION: 'delivery-completion-queue',
  RETURN_DEADLINE: 'return-deadline-queue',
} as const;

export type OrderLifecycleQueueName =
  (typeof OrderLifecycleQueueName)[keyof typeof OrderLifecycleQueueName];

export const OrderLifecycleJobName = {
  AUTO_CANCEL_ORDER: 'auto-cancel-order',
  AUTO_APPROVE_CANCELLATION: 'auto-approve-cancellation',
  AUTO_COMPLETE_DELIVERY: 'auto-complete-delivery',
  VOID_EXPIRED_RETURN: 'void-expired-return',
} as const;

export type OrderLifecycleJobName =
  (typeof OrderLifecycleJobName)[keyof typeof OrderLifecycleJobName];

export interface AutoCancelOrderJobData {
  orderId: string;
  orderNumber: string;
  reason?: string;
}

export interface AutoApproveCancellationJobData {
  orderId: string;
  requestId: string;
  orderNumber: string;
}

export interface AutoCompleteDeliveryJobData {
  orderId: string;
  orderNumber: string;
}

export interface VoidExpiredReturnJobData {
  orderId: string;
  returnRequestId: string;
  orderNumber: string;
}

export const ORDER_TIMEOUT_MS = {
  PROMPTPAY: 15 * 60 * 1000, // 15 mins
  CREDIT_CARD: 30 * 60 * 1000, // 30 mins
  ADMIN_MANUAL_DRAFT: 24 * 60 * 60 * 1000, // 24 hours
  CANCELLATION_REVIEW: 48 * 60 * 60 * 1000, // 48 hours
  DELIVERY_COMPLETION: 5 * 24 * 60 * 60 * 1000, // 5 days (120 hours)
  RETURN_WINDOW: 7 * 24 * 60 * 60 * 1000, // 7 days (168 hours)
  RETURN_SHIPMENT_DEADLINE: 7 * 24 * 60 * 60 * 1000, // 7 days (168 hours)
} as const;
