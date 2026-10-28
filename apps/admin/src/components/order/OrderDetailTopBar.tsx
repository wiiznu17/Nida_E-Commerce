import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Send,
  Check,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { OrderStatus } from '@repo/types';

export interface OrderDetailTopBarProps {
  orderNumber: string;
  placedAt: string;
  status: OrderStatus;
  isUpdating: boolean;
  hasUnsavedStatus: boolean;
  onSaveStatus: () => void;
  liveTrackingUrl: string;
  onOpenFulfill: () => void;
  onOpenPrint: () => void;
  onOpenRefund?: () => void;
  canRefund?: boolean;
  isFulfillDisabled?: boolean;
  fulfillDisabledReason?: string;
  trackingNumber?: string;
}

export function OrderDetailTopBar({
  orderNumber,
  placedAt,
  status,
  isUpdating,
  hasUnsavedStatus,
  onSaveStatus,
  liveTrackingUrl,
  onOpenFulfill,
  onOpenPrint,
  onOpenRefund,
  canRefund = false,
  isFulfillDisabled = false,
  fulfillDisabledReason,
  trackingNumber,
}: OrderDetailTopBarProps) {
  const { t } = useLanguage();

  const getStatusBadge = () => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'PAID':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-brand-border p-3 rounded-md shadow-2xs flex flex-wrap items-center justify-between gap-3 sticky top-14 z-20">
      <div className="flex items-center space-x-2.5">
        <Link
          to="/admin/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-brand-brown transition-colors pr-2.5 border-r border-gray-200"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </Link>

        {/* Order Identifier & Status */}
        <div className="flex items-center space-x-2">
          <span className="font-mono font-black text-sm text-brand-brown tracking-tight">
            #{orderNumber}
          </span>
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border ${getStatusBadge()}`}
          >
            {status}
          </span>
          <span className="hidden md:inline-block text-[11px] text-gray-400 font-mono">
            {placedAt}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <a
          href={liveTrackingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-brand-brown hover:text-brand-dark-brown bg-brand-cream hover:bg-brand-border border border-brand-border rounded-xs transition-colors cursor-pointer"
          title={t('orders.detail.liveTracking')}
        >
          <ExternalLink size={13} />
          <span className="hidden sm:inline">
            {t('orders.detail.liveTracking')}
          </span>
        </a>

        <button
          type="button"
          onClick={onOpenPrint}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-brand-brown hover:text-brand-dark-brown bg-white hover:bg-gray-100 border border-brand-border rounded-xs transition-colors cursor-pointer shadow-2xs"
          title={t('orders.print.printAction')}
        >
          <Printer size={13} />
          <span>{t('orders.print.printButton')}</span>
        </button>

        {canRefund && onOpenRefund && (
          <button
            type="button"
            onClick={onOpenRefund}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xs transition-colors cursor-pointer shadow-2xs"
            title={t('orders.refund.buttonTitle')}
          >
            <RotateCcw size={13} />
            <span>{t('orders.refund.buttonLabel')}</span>
          </button>
        )}

        {status === 'PROCESSING' && !trackingNumber ? (
          <button
            type="button"
            onClick={onOpenFulfill}
            disabled={isFulfillDisabled}
            title={isFulfillDisabled ? fulfillDisabledReason : undefined}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs transition-colors shadow-2xs ${
              isFulfillDisabled
                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                : 'text-brand-brown hover:text-brand-dark-brown bg-amber-50 hover:bg-amber-100 border border-amber-300 cursor-pointer'
            }`}
          >
            <Send
              size={13}
              className={
                isFulfillDisabled ? 'text-stone-400' : 'text-brand-amber'
              }
            />
            <span>{t('orders.fulfill.addTracking')}</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onSaveStatus}
          disabled={isUpdating || !hasUnsavedStatus}
          className={`inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-2xs ${
            hasUnsavedStatus
              ? 'bg-brand-brown hover:bg-brand-dark-brown text-white'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
          }`}
        >
          <Check size={14} />
          <span>
            {isUpdating
              ? t('orders.detail.updatingStatus')
              : t('orders.detail.updateStatusBtn')}
          </span>
        </button>
      </div>
    </div>
  );
}
