import type { AdminOrder } from '../../../data/adminData';

export type PrintDocumentType = 'LABEL' | 'PACKING_SLIP';

export interface OrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: AdminOrder[];
  initialDocType?: PrintDocumentType;
}

export interface OrderShippingLabelProps {
  order: AdminOrder;
}

export interface OrderPackingSlipProps {
  order: AdminOrder;
}

export interface OrderBarcodeProps {
  value: string;
  height?: number;
  showText?: boolean;
}
