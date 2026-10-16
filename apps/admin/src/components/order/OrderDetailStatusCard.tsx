import { Check, Clock, Truck, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect } from '../ui';
import {
  ALLOWED_STATUS_TRANSITIONS,
  validateOrderStatusTransition,
} from '@repo/validators';
import type { OrderStatus } from '@repo/types';

const ORDER_HIERARCHY: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PREORDER_AWAITING_STOCK: 2,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 0,
  REFUNDED: 0,
};

export interface OrderDetailStatusCardProps {
  currentStatus: OrderStatus;
  selectedStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  hasTracking: boolean;
  totalAmount: number;
  totalItems: number;
  paymentMethod: string;
  hasUnsavedStatus: boolean;
  isUpdating: boolean;
  onSaveStatus: () => void;
  onOpenFulfill?: () => void;
  onOpenPaymentOverride?: () => void;
}

export function OrderDetailStatusCard({
  currentStatus,
  selectedStatus,
  onStatusChange,
  hasTracking,
  totalAmount,
  totalItems,
  paymentMethod,
  hasUnsavedStatus,
  isUpdating,
  onSaveStatus,
  onOpenFulfill,
  onOpenPaymentOverride,
}: OrderDetailStatusCardProps) {
  const { t } = useLanguage();

  const milestones: { key: OrderStatus; label: string; icon: typeof Check }[] =
    [
      { key: 'PAID', label: t('orders.detail.stepPaid'), icon: Check },
      {
        key: 'PROCESSING',
        label: t('orders.detail.stepProcessing'),
        icon: Clock,
      },
      { key: 'SHIPPED', label: t('orders.detail.stepShipped'), icon: Truck },
      {
        key: 'DELIVERED',
        label: t('orders.detail.stepDelivered'),
        icon: CheckCircle2,
      },
    ];

  const getStepState = (stepKey: OrderStatus) => {
    if (selectedStatus === 'CANCELLED') return 'cancelled';

    const currentLevel = ORDER_HIERARCHY[selectedStatus] ?? 0;
    const stepLevel = ORDER_HIERARCHY[stepKey] ?? 0;

    if (currentLevel > stepLevel) return 'completed';
    if (currentLevel === stepLevel) return 'active';
    return 'pending';
  };

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];

  const handleStatusSelect = (val: OrderStatus) => {
    if (val === currentStatus) {
      onStatusChange(val);
      return;
    }

    if (currentStatus === 'PENDING' && val === 'PAID' && onOpenPaymentOverride) {
      onOpenPaymentOverride();
      return;
    }

    const validation = validateOrderStatusTransition(
      currentStatus,
      val,
      hasTracking,
    );

    if (
      !validation.isValid &&
      val === 'SHIPPED' &&
      !hasTracking &&
      onOpenFulfill
    ) {
      onOpenFulfill();
      return;
    }

    onStatusChange(val);
  };

  const statusOptions = [
    {
      value: currentStatus,
      label: `${currentStatus} (${t('orders.status.current') || 'Current'})`,
    },
    ...allowedNext.map((s) => ({
      value: s,
      label: s === 'SHIPPED' && !hasTracking ? `${s} (+Tracking)` : s,
    })),
  ];

  return (
    <div className="bg-white border border-brand-border rounded-md shadow-2xs overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
              {t('orders.detail.statusActionTitle')}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t('orders.subtitle')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Emergency Payment Override Notice for PENDING Orders */}
          {currentStatus === 'PENDING' && (
            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xs flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-amber-900 text-xs min-w-0">
                <ShieldAlert size={15} className="text-amber-700 flex-shrink-0" />
                <span className="font-bold truncate">
                  {t('orders.paymentOverride.button')}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenPaymentOverride}
                className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-xs bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
              >
                {t('orders.paymentOverride.confirm')}
              </button>
            </div>
          )}

          {/* Status Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 mb-1.5">
              {t('orders.detail.status')}
            </label>
            <DropdownSelect
              value={selectedStatus}
              onChange={(val) => handleStatusSelect(val as OrderStatus)}
              options={statusOptions}
            />
          </div>

          {/* Stepper Milestones */}
          <div className="pt-2 border-t border-brand-cream">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">
              {t('orders.detail.timelineTitle')}
            </span>

            {selectedStatus === 'CANCELLED' ? (
              <div className="flex items-center space-x-2.5 p-3 bg-red-50 border border-red-200 rounded-xs text-red-800 text-xs font-bold">
                <XCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{t('orders.detail.stepCancelled')}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m, idx) => {
                  const state = getStepState(m.key);
                  const Icon = m.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 text-xs"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : state === 'active'
                              ? 'bg-brand-brown text-white ring-2 ring-brand-amber/40'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        <Icon size={11} />
                      </div>
                      <span
                        className={`font-bold transition-colors ${
                          state === 'active'
                            ? 'text-brand-brown font-black'
                            : state === 'completed'
                              ? 'text-gray-800'
                              : 'text-gray-400'
                        }`}
                      >
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mini Financial Summary */}
          <div className="bg-brand-cream border border-brand-border p-3.5 rounded-xs space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-600">
              <span>{t('orders.detail.totalItems')}</span>
              <strong className="text-brand-brown font-mono">
                {totalItems} {t('orders.detail.pieces')}
              </strong>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>{t('orders.detail.paymentMethod')}</span>
              <strong className="text-brand-brown truncate max-w-[150px]">
                {paymentMethod}
              </strong>
            </div>
            <div className="pt-2 border-t border-brand-border flex justify-between items-baseline">
              <span className="font-black uppercase tracking-wider text-brand-brown">
                {t('orders.detail.grandTotal')}
              </span>
              <span className="font-mono font-black text-lg text-brand-brown">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Save Action */}
      <div className="p-4 border-t border-brand-cream bg-gray-50/50">
        <button
          type="button"
          onClick={onSaveStatus}
          disabled={isUpdating || !hasUnsavedStatus}
          className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
            hasUnsavedStatus
              ? 'bg-brand-brown hover:bg-brand-dark-brown text-white shadow-2xs'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
