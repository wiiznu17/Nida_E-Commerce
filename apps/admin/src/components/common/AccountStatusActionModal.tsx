import { useState, useEffect } from 'react';
import { AlertModal } from '../ui/AlertModal';
import { useLanguage } from '../../context/LanguageContext';
import { AccountStatus } from '@repo/types';

export type AccountStatusAction = 'SUSPEND' | 'BAN' | 'REACTIVATE';

export interface AccountStatusActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    status: AccountStatus;
    statusReason: string;
    durationMinutes?: number;
  }) => Promise<void>;
  action: AccountStatusAction | null;
  targetName: string;
  targetEmail?: string;
  isLoading?: boolean;
}

const DURATION_OPTIONS = [
  { labelKey: 'customers.modals.duration1Hour', minutes: 60 },
  { labelKey: 'customers.modals.duration24Hours', minutes: 1440 },
  { labelKey: 'customers.modals.duration7Days', minutes: 10080 },
  { labelKey: 'customers.modals.duration30Days', minutes: 43200 },
];

export function AccountStatusActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  targetName,
  targetEmail,
  isLoading = false,
}: AccountStatusActionModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(1440); // default 24h
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDurationMinutes(1440);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !action) return null;

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError(t('customers.modals.reasonPlaceholder'));
      return;
    }

    let status: AccountStatus = AccountStatus.ACTIVE;
    if (action === 'SUSPEND') status = AccountStatus.SUSPENDED;
    if (action === 'BAN') status = AccountStatus.BANNED;

    await onConfirm({
      status,
      statusReason: trimmed,
      durationMinutes: action === 'SUSPEND' ? durationMinutes : undefined,
    });
  };

  const isSuspend = action === 'SUSPEND';
  const isBan = action === 'BAN';

  const modalTitle = isSuspend
    ? t('customers.modals.suspendTitle')
    : isBan
      ? t('customers.modals.banTitle')
      : t('customers.modals.reactivateTitle');

  const modalDesc = isSuspend
    ? t('customers.modals.suspendDesc')
    : isBan
      ? t('customers.modals.banDesc')
      : t('customers.modals.reactivateDesc');

  const variant = isSuspend ? 'warning' : isBan ? 'danger' : 'success';

  const confirmText = isSuspend
    ? t('customers.modals.btnSuspend')
    : isBan
      ? t('customers.modals.btnBan')
      : t('customers.modals.btnReactivate');

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={modalTitle}
      description={modalDesc}
      variant={variant}
      confirmText={confirmText}
      cancelText={t('customers.modals.btnCancel')}
      isLoading={isLoading}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Target summary banner */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-700">
          <div className="font-bold text-stone-900">{targetName}</div>
          {targetEmail && <div className="text-stone-500">{targetEmail}</div>}
        </div>

        {/* Duration selection for Suspend */}
        {isSuspend && (
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
              {t('customers.modals.durationLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setDurationMinutes(opt.minutes)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    durationMinutes === opt.minutes
                      ? 'border-[#2B1810] bg-[#2B1810] text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason Input */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
            {t('customers.modals.reasonLabel')}
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t('customers.modals.reasonPlaceholder')}
            rows={3}
            className={`w-full text-xs p-3 border rounded-lg focus:outline-hidden transition-colors ${
              error
                ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                : 'border-stone-200 focus:border-[#2B1810]'
            }`}
          />
          {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
        </div>
      </div>
    </AlertModal>
  );
}
