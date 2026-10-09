import { Globe, X, Check, AlertCircle, ShoppingBag, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSaveAsDraft?: () => void;
  isSubmitting?: boolean;
  productData: {
    name: string;
    nameTh?: string;
    price: number;
    image?: string;
    department?: string;
    category?: string;
    skuCount?: number;
    totalStock?: number;
    isEdit?: boolean;
  };
}

export function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onSaveAsDraft,
  isSubmitting = false,
  productData,
}: PublishConfirmModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const {
    name,
    nameTh,
    price,
    image,
    department,
    category,
    skuCount = 1,
    totalStock = 0,
    isEdit = false,
  } = productData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE3D9] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#FAF7F2] border-b border-[#EAE3D9] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#2B1810]">
                {t('publishModal.title')}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {t('publishModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-sm transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Product Summary Card */}
          <div className="flex items-start space-x-3.5 p-3 bg-[#FAF7F2] border border-[#EAE3D9] rounded-lg">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-16 h-20 object-cover rounded-md border border-gray-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-16 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 shrink-0">
                <ShoppingBag size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white border border-gray-200 rounded-xs text-gray-700">
                  {department || 'General'} / {category || 'Apparel'}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{t('publishModal.liveBadge')}</span>
                </span>
              </div>
              <h4 className="font-bold text-[#2B1810] text-sm truncate">{name}</h4>
              {nameTh && <p className="text-gray-500 text-[11px] truncate mt-0.5">{nameTh}</p>}
              <div className="flex items-center space-x-3 mt-2 font-mono">
                <span className="font-bold text-[#2B1810] text-xs">
                  ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 text-[11px] flex items-center space-x-1">
                  <Layers size={11} className="inline mr-0.5 text-gray-400" />
                  <span>{skuCount} SKUs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Warning & Checklist Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2 text-amber-900 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-[#2B1810]">
              <AlertCircle size={15} className="text-[#D97706]" />
              <span>{t('publishModal.checklistTitle')}</span>
            </div>
            <ul className="space-y-1 text-[11px] text-gray-700 list-disc list-inside pl-1">
              <li>
                <strong>{t('publishModal.visibilityLabel')}</strong>{' '}
                {t('publishModal.visibilityDesc')}
              </li>
              <li>
                <strong>{t('publishModal.inventoryLabel')}</strong>{' '}
                {totalStock > 0 ? (
                  <span>
                    {t('publishModal.availableStockPrefix')}{' '}
                    <strong className="text-emerald-700">
                      {totalStock} {t('common.units')}
                    </strong>
                  </span>
                ) : (
                  <span className="text-amber-800">
                    {t('publishModal.zeroStockNotice')}
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>
            {onSaveAsDraft && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onSaveAsDraft}
                className="text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
              >
                {t('publishModal.saveAsDraftInstead')}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-black uppercase tracking-wider text-[#1E110A] bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check size={15} />
              <span>
                {isSubmitting
                  ? t('publishModal.publishing')
                  : isEdit
                    ? t('publishModal.confirmPublish')
                    : t('publishModal.confirmCreateAndPublish')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
