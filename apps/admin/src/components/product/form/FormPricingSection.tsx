import { DollarSign } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormPricingSectionProps } from './formTypes';

export function FormPricingSection({
  price,
  originalPrice,
  discountPercent,
  onPriceChange,
  onOriginalPriceChange,
}: FormPricingSectionProps) {
  const { t } = useLanguage();

  return (
    <div
      id="sec-pricing"
      className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs space-y-3.5"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center space-x-2">
          <DollarSign size={16} className="text-[#D97706]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('product.pricingDiscounts')}
          </h3>
        </div>
        {discountPercent !== null && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {t('product.saveDiscount')} {discountPercent}%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.regularPrice')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="129.00"
              className="w-full text-xs p-2.5 pl-7 border border-gray-300 rounded-md focus:border-[#2B1810] outline-hidden font-mono text-base font-bold text-[#2B1810]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.compareAtPrice')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(e) => onOriginalPriceChange(e.target.value)}
              placeholder="179.00"
              className="w-full text-xs p-2.5 pl-7 border border-gray-300 rounded-md focus:border-[#2B1810] outline-hidden font-mono"
            />
          </div>
        </div>
      </div>

      {/* Full Price vs Discount Price Breakdown Banner */}
      {(() => {
        const numPrice = Number(price) || 0;
        const numOriginal = Number(originalPrice) || 0;
        if (numOriginal > numPrice && numPrice > 0) {
          const savings = numOriginal - numPrice;
          return (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-md flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-3">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">
                    {t('product.fullPrice')}
                  </span>
                  <span className="text-gray-400 line-through font-mono font-bold">
                    ${numOriginal.toFixed(2)}
                  </span>
                </div>
                <div className="text-gray-300">→</div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                    {t('product.discountPrice')}
                  </span>
                  <span className="text-emerald-700 font-mono font-black text-sm">
                    ${numPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 font-bold block">
                  {t('product.youSave')}
                </span>
                <span className="font-mono font-black text-emerald-700">
                  ${savings.toFixed(2)} ({discountPercent}%)
                </span>
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
