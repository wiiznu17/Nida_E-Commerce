import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Globe } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormTopBarProps } from './formTypes';

export function FormTopBar({
  isSubmitting,
  publishStatus,
  isEdit,
  onScrollTo,
}: FormTopBarProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-[#EAE3D9] p-3 rounded-md shadow-2xs flex flex-wrap items-center justify-between gap-3 sticky top-14 z-20">
      <div className="flex items-center space-x-2">
        <Link
          to="/admin/products"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#2B1810] transition-colors pr-2 border-r border-gray-200"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{t('common.back')}</span>
        </Link>

        {/* Quick Jump Anchor Pills */}
        <div className="hidden md:flex items-center space-x-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => onScrollTo('sec-basic')}
            className="px-2.5 py-1 text-gray-600 hover:text-[#2B1810] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          >
            {t('product.generalInfo')}
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('sec-media')}
            className="px-2.5 py-1 text-gray-600 hover:text-[#2B1810] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          >
            {t('product.mediaColors')}
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('sec-pricing')}
            className="px-2.5 py-1 text-gray-600 hover:text-[#2B1810] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          >
            {t('product.pricingDiscounts')}
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('sec-taxonomy')}
            className="px-2.5 py-1 text-gray-600 hover:text-[#2B1810] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          >
            {t('product.taxonomy')}
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('sec-story')}
            className="px-2.5 py-1 text-gray-600 hover:text-[#2B1810] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          >
            {t('product.materialsCareTitle')}
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('sec-inventory')}
            className="px-2.5 py-1 text-gray-600 hover:text-[#2B1810] hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
          >
            {t('product.variantsSkus')}
          </button>
        </div>
      </div>

      {/* Quick Top Save & Cancel */}
      <div className="flex items-center space-x-2">
        <Link
          to="/admin/products"
          className="px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors shadow-2xs"
        >
          {t('common.cancel')}
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-md shadow-xs transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer ${
            publishStatus === 'published'
              ? 'text-[#1E110A] bg-[#F59E0B] hover:bg-[#D97706]'
              : 'text-[#F59E0B] bg-[#2B1810] hover:bg-[#3D2317]'
          }`}
        >
          {publishStatus === 'published' ? <Globe size={14} /> : <FileText size={14} />}
          <span>
            {isSubmitting
              ? t('common.saving')
              : publishStatus === 'draft'
                ? t('product.saveAsDraft')
                : isEdit
                  ? t('product.updateAndPublish')
                  : t('product.publishProduct')}
          </span>
        </button>
      </div>
    </div>
  );
}
