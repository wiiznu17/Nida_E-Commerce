// ====================================================
// @repo/types — Customer Order & Tracking Types (Storefront)
// ====================================================

import type {
  CancellationRequestStatus,
  CarrierCode,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  ReturnStatus,
  ShipmentStatus,
} from '../common/enums.js';

export interface ApiOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  hasPreorderItems: boolean;

  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  promoCodeUsed?: string;

  items: ApiOrderItem[];
  shippingAddress: ApiOrderAddress;
  payment?: ApiPaymentSummary;
  shipments: ApiShipment[];
  cancellationRequests?: ApiOrderCancellationRequest[];
  returnRequests?: ApiReturnRequest[];
  refunds?: ApiRefundSummary[];
  placedAt: string;
  completedAt?: string | null;
  updatedAt?: string;
}

export interface ApiOrderItem {
  id: string;
  productName: string;
  variantInfo: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountShare: number;
  netPrice: number;
  isPreorder: boolean;
  expectedShipDate?: string;
}

export interface ApiOrderAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface ApiPaymentSummary {
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  cardLast4?: string;
  cardBrand?: string;
  paidAt?: string;
  qrDownloadUri?: string;
  qrExpiresAt?: string;
  failureMessage?: string;
}

export interface ApiShipment {
  id: string;
  carrierCode?: CarrierCode;
  courierName: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  timeline: ShipmentTimelineEntry[];
}

export interface ShipmentTimelineEntry {
  id: string;
  statusTitle: string;
  statusDescription?: string;
  location?: string;
  timestamp: string;
}

export interface TrackingResult {
  orderNumber: string;
  orderStatus: OrderStatus;
  shipment: ApiShipment;
}

export interface TrackOrderRequest {
  orderNumber: string;
  phone: string;
}

// --- Customer Order Cancellation Request ---
export interface ApiOrderCancellationRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  userId: string;
  reason: string;
  customerNote?: string;
  adminNote?: string;
  status: CancellationRequestStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface CreateCancellationRequestDto {
  reason: string;
  customerNote?: string;
}

// --- Customer Return Request (RMA) ---
export interface ApiReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  productName?: string;
  variantInfo?: string;
  unitPrice?: number;
}

export interface ApiReturnRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  userId: string;
  reason: string;
  customerNote?: string;
  adminNote?: string;
  status: ReturnStatus;
  items: ApiReturnItem[];
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface CreateReturnRequestDto {
  reason: string;
  customerNote?: string;
  items: {
    orderItemId: string;
    quantity: number;
  }[];
}

// --- Refund Summary ---
export interface ApiRefundSummary {
  id: string;
  refundNumber: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason?: string;
  gatewayRefundId?: string;
  status: RefundStatus;
  createdAdminId?: string;
  createdAt: string;
}

// --- Admin Server Search & Pagination Types ---
export interface AdminOrderQueryParams {
  search?: string;
  status?: string;
  paymentMethod?: string;
  sortBy?: 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';
  page?: number;
  pageSize?: number;
}

export interface AdminOrderStatusCounts {
  all: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  pendingCancellations: number;
  pendingReturns: number;
}

export interface PaginatedOrdersResponse {
  items: ApiOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: AdminOrderStatusCounts;
}

export interface AdminCancellationQueryParams {
  search?: string;
  status?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
}

export interface AdminCancellationStatusCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ApiOrderCancellationWithOrder extends ApiOrderCancellationRequest {
  order?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    placedAt: string;
  };
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface PaginatedCancellationsResponse {
  items: ApiOrderCancellationWithOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: AdminCancellationStatusCounts;
}

export interface AdminReturnQueryParams {
  search?: string;
  status?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
}

export interface AdminReturnStatusCounts {
  all: number;
  requested: number;
  approved: number;
  completed: number;
  rejected: number;
}

export interface ApiReturnRequestWithOrder extends ApiReturnRequest {
  order?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    placedAt: string;
  };
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface PaginatedReturnsResponse {
  items: ApiReturnRequestWithOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: AdminReturnStatusCounts;
}

