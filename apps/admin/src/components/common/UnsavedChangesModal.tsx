import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
  title?: string;
  description?: string;
}

export function UnsavedChangesModal({
  isOpen,
  onStay,
  onDiscard,
  title,
  description,
}: UnsavedChangesModalProps) {
  const { t, isTh } = useLanguage();

  if (!isOpen) return null;

  const defaultTitle = t('unsaved.title');
  const defaultDescription = t('unsaved.description');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onStay}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#EAE3D9] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Amber Header Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-amber-500 via-amber-400 to-amber-600" />

        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* Warning Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle size={22} className="stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#2B1810] tracking-tight">
                  {title || defaultTitle}
                </h3>
                <button
                  type="button"
                  onClick={onStay}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {description || defaultDescription}
              </p>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="mt-5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-center space-x-2">
            <span className="font-bold shrink-0">💡 {isTh ? 'คำแนะนำ:' : 'Tip:'}</span>
            <span>
              {t('unsaved.tip')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onDiscard}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors text-center cursor-pointer"
            >
              {t('unsaved.discard')}
            </button>

            <button
              type="button"
              onClick={onStay}
              className="w-full sm:w-auto px-5 py-2 text-xs font-black uppercase tracking-wider text-[#1E110A] bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{t('unsaved.keepEditing')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
