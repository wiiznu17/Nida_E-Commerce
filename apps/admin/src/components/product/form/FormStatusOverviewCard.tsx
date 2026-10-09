import { Globe, FileText, Eye } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormStatusOverviewCardProps } from './formTypes';

export function FormStatusOverviewCard({
  publishStatus,
  totalStockCount,
  numericPrice,
  numericOriginal,
  discountPercent,
  onPublishStatusChange,
  onShowPreview,
}: FormStatusOverviewCardProps) {
  const { t } = useLanguage();
  const hasDiscount = (numericOriginal ?? 0) > numericPrice && numericPrice > 0;

  return (
    <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-xs space-y-3.5">
      <div className="border-b border-[#EAE3D9] pb-2">
        <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
          {t('product.statusOverview')}
        </span>
      </div>

      {/* Publication Status Selector */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600 block">
          {t('product.publishStatusLabel')}
        </label>
        <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-md border border-[#EAE3D9]">
          <button
            type="button"
            onClick={() => onPublishStatusChange('published')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xs text-[11px] font-bold transition-all cursor-pointer ${
              publishStatus === 'published'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Globe size={13} />
            <span>{t('product.published')}</span>
          </button>
          <button
            type="button"
            onClick={() => onPublishStatusChange('draft')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xs text-[11px] font-bold transition-all cursor-pointer ${
              publishStatus === 'draft'
                ? 'bg-[#2B1810] text-[#F59E0B] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText size={13} />
            <span>{t('product.draft')}</span>
          </button>
        </div>
        <p className="text-[10px] text-gray-500 leading-tight pt-0.5">
          {publishStatus === 'published'
            ? t('product.publishedDesc')
            : t('product.draftDesc')}
        </p>
      </div>

      {/* Quick Summary Pill */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-white p-2 rounded-sm border border-gray-200 flex flex-col justify-center">
          <span className="text-[9px] uppercase font-bold text-gray-500 block">
            {t('product.stock')}
          </span>
          <span className="font-black text-[#D97706] text-sm">
            {totalStockCount} {t('common.units')}
          </span>
        </div>
        <div className="bg-white p-2 rounded-sm border border-gray-200 flex flex-col justify-center">
          {hasDiscount ? (
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-emerald-800 block">
                {t('product.discountPrice')}
              </span>
              <div className="flex items-baseline justify-center space-x-1.5">
                <span className="font-black text-emerald-700 text-sm font-mono">
                  ${numericPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-400 line-through font-mono">
                  ${(numericOriginal ?? 0).toFixed(2)}
                </span>
              </div>
              {discountPercent !== null && (
                <span className="text-[9px] font-black text-emerald-600 block">
                  {t('product.saveDiscount')} {discountPercent}%
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">
                {t('product.price')}
              </span>
              <span className="font-black text-[#2B1810] text-sm font-mono">
                ${numericPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Show Live Preview Modal Trigger */}
      <button
        type="button"
        onClick={onShowPreview}
        className="w-full py-2 px-3 text-xs font-bold text-[#2B1810] bg-white hover:bg-amber-50/70 border border-[#EAE3D9] hover:border-[#D97706] rounded-md shadow-2xs transition-all flex items-center justify-center space-x-2 group cursor-pointer"
      >
        <Eye size={15} className="text-[#D97706] group-hover:scale-110 transition-transform" />
        <span>{t('product.previewStorefront')}</span>
      </button>
    </div>
  );
}
