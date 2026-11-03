import type { ApiOrder } from '@repo/types';

export type PrintDocumentType = 'LABEL' | 'PACKING_SLIP' | 'TAX_INVOICE';

export interface OrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ApiOrder[];
  initialDocType?: PrintDocumentType;
}

export interface OrderShippingLabelProps {
  order: ApiOrder;
}

export interface OrderPackingSlipProps {
  order: ApiOrder;
}

export interface OrderTaxInvoiceProps {
  order: ApiOrder;
}

export interface OrderBarcodeProps {
  value: string;
  height?: number;
  showText?: boolean;
}
