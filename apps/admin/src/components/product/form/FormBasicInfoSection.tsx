import { FileText } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormBasicInfoSectionProps } from './formTypes';

export function FormBasicInfoSection({
  name,
  nameTh,
  description,
  descriptionTh,
  descLangTab,
  onNameChange,
  onNameThChange,
  onDescriptionChange,
  onDescriptionThChange,
  onDescLangTabChange,
}: FormBasicInfoSectionProps) {
  const { t } = useLanguage();

  return (
    <div
      id="sec-basic"
      className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs space-y-4"
    >
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
        <FileText size={16} className="text-[#D97706]" />
        <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
          {t('product.generalInfo')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
            <span>{t('product.nameEn')}</span>
            <span className="text-[9px] text-gray-400 font-mono">
              {t('product.nameEnHint')}
            </span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('product.nameEnPlaceholder')}
            className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
            <span>{t('product.nameTh')}</span>
            <span className="text-[9px] text-gray-400 font-mono">
              {t('product.nameThHint')}
            </span>
          </label>
          <input
            type="text"
            value={nameTh}
            onChange={(e) => onNameThChange(e.target.value)}
            placeholder={t('product.nameThPlaceholder')}
            className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden font-medium"
          />
        </div>
      </div>

      {/* Description with language pill toggle */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.storyDetails')}
          </label>
          <div className="flex items-center bg-gray-100 p-0.5 rounded-sm text-[10px] font-bold">
            <button
              type="button"
              onClick={() => onDescLangTabChange('en')}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                descLangTab === 'en'
                  ? 'bg-white text-[#2B1810] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              type="button"
              onClick={() => onDescLangTabChange('th')}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                descLangTab === 'th'
                  ? 'bg-white text-[#2B1810] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🇹🇭 TH
            </button>
          </div>
        </div>

        {descLangTab === 'en' ? (
          <textarea
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('product.storyEnPlaceholder')}
            className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] outline-hidden leading-relaxed"
          />
        ) : (
          <textarea
            rows={3}
            value={descriptionTh}
            onChange={(e) => onDescriptionThChange(e.target.value)}
            placeholder={t('product.storyThPlaceholder')}
            className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] outline-hidden leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
