// @repo/types — Tax Invoicing & Receipts Types

import type { TaxInvoiceBranchType, TaxInvoicePayerType } from './enums.js';

export interface ApiTaxInvoiceItem {
  id: string;
  productName: string;
  variantInfo: string;
  skuCode?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountShare: number;
  netPrice: number;
}

export interface ApiTaxInvoiceSeller {
  companyName: string;
  taxId: string;
  branch: string;
  address: string;
  phone?: string;
}

export interface ApiTaxInvoiceRequest {
  payerType: TaxInvoicePayerType;
  taxId: string;
  name: string;
  branchType?: TaxInvoiceBranchType | null;
  branchCode?: string | null;
  address: string;
}

export interface ApiTaxInvoice {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  payerType: TaxInvoicePayerType;
  taxId: string;
  name: string;
  branchType?: TaxInvoiceBranchType | null;
  branchCode?: string | null;
  address: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  preVatAmount: number;
  vatAmount: number;
  itemsSnapshot: ApiTaxInvoiceItem[];
  sellerSnapshot?: ApiTaxInvoiceSeller;
  issuedAt: string;
}
