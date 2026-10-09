import { useLanguage } from '../../context/LanguageContext';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { t } = useLanguage();

  const getStyleAndLabel = () => {
    switch (status) {
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          label: t('status.delivered'),
        };
      case 'SHIPPED':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          label: t('status.shipped'),
        };
      case 'PROCESSING':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          label: t('status.processing'),
        };
      case 'PAID':
        return {
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          label: t('status.paid'),
        };
      case 'PENDING':
        return {
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          label: t('status.pending'),
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-100 text-red-900 border-red-200',
          label: t('status.cancelled'),
        };
      case 'REFUNDED':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-200',
          label: t('status.refunded'),
        };
      // Inventory Statuses
      case 'IN_STOCK':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          label: t('status.inStock'),
        };
      case 'LOW_STOCK':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          label: t('status.lowStock'),
        };
      case 'OUT_OF_STOCK':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-200',
          label: t('status.outOfStock'),
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
