import { X, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface VariantStatusTarget {
  index: number;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  currentStock: number;
  isActive: boolean;
}

export interface VariantStatusConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  target: VariantStatusTarget | null;
}

export function VariantStatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  target,
}: VariantStatusConfirmModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !target) return null;

  const isDeactivating = target.isActive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-brand-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-brand-cream border-b border-brand-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-2xs ${
                isDeactivating
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
            >
              {isDeactivating ? (
                <AlertTriangle size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                {isDeactivating
                  ? t('variantStatusModal.deactivateTitle')
                  : t('variantStatusModal.activateTitle')}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">
                {target.sku}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-sm transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Variant Card */}
          <div className="p-3 bg-brand-cream border border-brand-border rounded-lg space-y-2">
            <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
              {t('variantStatusModal.targetVariant')}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-400 shadow-2xs shrink-0"
                  style={{ backgroundColor: target.colorHex }}
                />
                <span className="font-bold text-gray-800 text-xs">
                  {target.colorName}
                </span>
                <span className="bg-white border border-brand-border text-brand-brown text-[10px] font-black px-2 py-0.5 rounded-xs">
                  {target.size}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 font-mono text-[11px]">
                <Package size={13} className="text-gray-400" />
                <span>
                  {target.currentStock} {t('common.units')}
                </span>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="space-y-2 text-gray-600 leading-relaxed">
            <p>
              {isDeactivating
                ? t('variantStatusModal.deactivateDesc')
                : t('variantStatusModal.activateDesc')}
            </p>
            {isDeactivating && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-md text-amber-900 text-[11px] font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                <span>{t('variantStatusModal.stockSafeNotice')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-5 py-3.5 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-white shadow-xs ${
              isDeactivating
                ? 'bg-stone-800 hover:bg-black'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isDeactivating
              ? t('variantStatusModal.confirmDeactivate')
              : t('variantStatusModal.confirmActivate')}
          </button>
        </div>
      </div>
    </div>
  );
}
