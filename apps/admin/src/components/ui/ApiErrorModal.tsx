import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ApiErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  errorMessage?: string | null;
  validationErrors?: string[];
  onRetry?: () => void;
}

export function ApiErrorModal({
  isOpen,
  onClose,
  title,
  description,
  errorMessage,
  validationErrors = [],
  onRetry,
}: ApiErrorModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const displayTitle = title ?? t('common.apiErrorTitle');
  const displayDesc = description ?? t('common.apiErrorDesc');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-brown/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-border overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Editorial Rose Accent Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-rose-600 via-rose-500 to-red-600" />

        <div className="p-6">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <AlertCircle size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-black text-brand-brown tracking-tight">
                  {displayTitle}
                </h3>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                  {displayDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label={t('common.close')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Primary Error Message Card */}
          <div className="mt-5 p-3.5 bg-rose-50/80 border border-rose-200 rounded-lg text-xs text-rose-900 leading-relaxed">
            <div className="font-semibold">
              {errorMessage ?? t('common.apiErrorDesc')}
            </div>
          </div>

          {/* Granular Validation Details (if available) */}
          {validationErrors.length > 0 && (
            <div className="mt-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-2">
                {t('product.validationErrorsTitle')}
              </span>
              <div className="bg-brand-cream border border-brand-border rounded-lg p-3.5 space-y-2 max-h-48 overflow-y-auto">
                {validationErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 text-xs text-stone-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span className="leading-snug">{err}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-end space-x-3">
            {onRetry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-brand-border rounded-lg text-xs font-bold text-brand-brown hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>{t('common.retry')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-brand-brown hover:bg-brand-amber text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {t('common.dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
