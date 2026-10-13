import { Check, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect } from '../ui';
import type { AdminOrder } from '../../data/adminData';

export interface OrderDetailStatusCardProps {
  selectedStatus: AdminOrder['status'];
  onStatusChange: (status: AdminOrder['status']) => void;
  totalAmount: number;
  totalItems: number;
  paymentMethod: string;
  hasUnsavedStatus: boolean;
  isUpdating: boolean;
  onSaveStatus: () => void;
}

export function OrderDetailStatusCard({
  selectedStatus,
  onStatusChange,
  totalAmount,
  totalItems,
  paymentMethod,
  hasUnsavedStatus,
  isUpdating,
  onSaveStatus,
}: OrderDetailStatusCardProps) {
  const { t } = useLanguage();

  const milestones: { key: AdminOrder['status']; label: string; icon: typeof Check }[] = [
    { key: 'PAID', label: t('orders.detail.stepPaid'), icon: Check },
    { key: 'PROCESSING', label: t('orders.detail.stepProcessing'), icon: Clock },
    { key: 'SHIPPED', label: t('orders.detail.stepShipped'), icon: Truck },
    { key: 'DELIVERED', label: t('orders.detail.stepDelivered'), icon: CheckCircle2 },
  ];

  const getStepState = (stepKey: AdminOrder['status']) => {
    if (selectedStatus === 'CANCELLED') return 'cancelled';

    const orderHierarchy: Record<AdminOrder['status'], number> = {
      PENDING: 0,
      PAID: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: 0,
    };

    const currentLevel = orderHierarchy[selectedStatus] ?? 0;
    const stepLevel = orderHierarchy[stepKey] ?? 0;

    if (currentLevel > stepLevel) return 'completed';
    if (currentLevel === stepLevel) return 'active';
    return 'pending';
  };

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
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xs border ${
              selectedStatus === 'DELIVERED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : selectedStatus === 'SHIPPED'
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : selectedStatus === 'PROCESSING'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : selectedStatus === 'PAID'
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {selectedStatus}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 mb-1.5">
              {t('orders.detail.status')}
            </label>
            <DropdownSelect
              value={selectedStatus}
              onChange={(val) => onStatusChange(val as AdminOrder['status'])}
              options={[
                { value: 'PAID', label: 'PAID (ชำระแล้ว)' },
                { value: 'PROCESSING', label: 'PROCESSING (รอจัดเตรียม)' },
                { value: 'SHIPPED', label: 'SHIPPED (จัดส่งแล้ว)' },
                { value: 'DELIVERED', label: 'DELIVERED (ส่งมอบสำเร็จ)' },
                { value: 'CANCELLED', label: 'CANCELLED (ยกเลิก)' },
              ]}
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
                    <div key={idx} className="flex items-center space-x-3 text-xs">
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
              <strong className="text-brand-brown font-mono">{totalItems} {t('orders.detail.pieces')}</strong>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>{t('orders.detail.paymentMethod')}</span>
              <strong className="text-brand-brown truncate max-w-[150px]">{paymentMethod}</strong>
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
            {isUpdating ? t('orders.detail.updatingStatus') : t('orders.detail.updateStatusBtn')}
          </span>
        </button>
      </div>
    </div>
  );
}
