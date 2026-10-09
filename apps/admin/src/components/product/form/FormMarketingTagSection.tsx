import { Tag, Check, Zap } from 'lucide-react';
import { MARKETING_TAGS } from '@repo/types';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormMarketingTagSectionProps } from './formTypes';

export function FormMarketingTagSection({
  tag,
  activeMarketingTag,
  onSelectTag,
}: FormMarketingTagSectionProps) {
  const { t, isTh } = useLanguage();

  return (
    <div
      id="sec-tags"
      className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs flex-1 flex flex-col justify-between space-y-3.5"
    >
      <div>
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-3">
          <Tag size={16} className="text-[#D97706]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('product.marketingBadge')}
          </h3>
        </div>

        {/* Tag Selection Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-700 block">
            {t('product.selectMarketingBadge')}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {/* None Option */}
            <button
              type="button"
              onClick={() => onSelectTag(undefined)}
              className={`text-[10px] font-bold px-2 py-1.5 rounded-md border text-center transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                !tag
                  ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-xs'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {!tag && <Check size={11} className="text-emerald-400" />}
              <span>{t('product.noTag')}</span>
            </button>

            {/* Predefined Marketing Tag Enums */}
            {MARKETING_TAGS.map((preset) => {
              const isActive = tag === preset.labelEn;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => onSelectTag(preset)}
                  style={{
                    backgroundColor: isActive ? preset.badgeBg : '#FFFFFF',
                    borderColor: isActive ? preset.badgeBorder : '#E5E7EB',
                    color: isActive ? preset.badgeText : '#4B5563',
                  }}
                  className={`text-[10px] font-extrabold uppercase px-2 py-1.5 rounded-md border text-center transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    isActive
                      ? 'shadow-xs ring-1 ring-inset ring-black/10 font-black'
                      : 'hover:border-gray-300'
                  }`}
                  title={isTh ? preset.descriptionTh : preset.descriptionEn}
                >
                  {isActive && <Check size={11} />}
                  <span className="truncate">{isTh ? preset.labelTh : preset.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tag Details */}
      <div className="bg-[#FAF7F2] border border-[#EAE3D9] rounded-md p-2.5 space-y-2">
        {activeMarketingTag ? (
          <>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center space-x-1.5">
                <span className="text-gray-500 font-medium">
                  {t('product.storefrontBadge')}
                </span>
                <span
                  style={{
                    backgroundColor: activeMarketingTag.badgeBg,
                    color: activeMarketingTag.badgeText,
                    borderColor: activeMarketingTag.badgeBorder,
                  }}
                  className="px-2 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider border shadow-2xs"
                >
                  {isTh ? activeMarketingTag.labelTh : activeMarketingTag.labelEn}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectTag(undefined)}
                className="text-[10px] font-bold text-gray-400 hover:text-red-600 cursor-pointer"
              >
                {t('product.clearTag')}
              </button>
            </div>

            {activeMarketingTag.key === 'PRE_ORDER' && (
              <div className="p-1.5 bg-blue-50/80 border border-blue-200/60 rounded-xs text-[10px] text-blue-800 flex items-start space-x-1.5">
                <Zap size={12} className="text-blue-600 mt-0.5 shrink-0" />
                <span>
                  {t('product.preOrderNotice')}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span className="flex items-center space-x-1">
              <Check size={12} className="text-gray-400" />
              <span>
                {t('product.standardProductStatus')}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
