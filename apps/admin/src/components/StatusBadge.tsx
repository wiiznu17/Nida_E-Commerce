import { useLanguage } from '../context/LanguageContext';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const getStyleAndLabel = () => {
    switch (status) {
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          label: isTh ? 'จัดส่งสำเร็จ' : 'Delivered',
        };
      case 'SHIPPED':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          label: isTh ? 'กำลังจัดส่ง' : 'Shipped',
        };
      case 'PROCESSING':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          label: isTh ? 'กำลังเตรียมสินค้า' : 'Processing',
        };
      case 'PAID':
        return {
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          label: isTh ? 'ชำระเงินแล้ว' : 'Paid',
        };
      case 'PENDING':
        return {
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          label: isTh ? 'รอชำระเงิน' : 'Pending',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-100 text-red-900 border-red-200',
          label: isTh ? 'ยกเลิกแล้ว' : 'Cancelled',
        };
      case 'REFUNDED':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-200',
          label: isTh ? 'คืนเงินแล้ว' : 'Refunded',
        };
      // Inventory Statuses
      case 'IN_STOCK':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          label: isTh ? 'มีสินค้าพร้อมส่ง' : 'In Stock',
        };
      case 'LOW_STOCK':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          label: isTh ? 'สินค้าใกล้หมด' : 'Low Stock',
        };
      case 'OUT_OF_STOCK':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-200',
          label: isTh ? 'สินค้าหมด' : 'Out of Stock',
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status,
        };
    }
  };

  const { bg, label } = getStyleAndLabel();

  return (
    <span
      className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${bg} ${className}`}
    >
      {label}
    </span>
  );
}
