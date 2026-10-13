import { FileText } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Input, Textarea } from '../../ui';
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
      className="bg-white border border-brand-border p-4 sm:p-5 rounded-xs shadow-2xs space-y-4 h-full flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
          <FileText size={16} className="text-brand-amber" />
          <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown">
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
            <Input
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t('product.nameEnPlaceholder')}
              className="font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-700 flex items-center space-x-1">
              <span>{t('product.nameTh')}</span>
              <span className="text-[9px] text-gray-400 font-mono">
                {t('product.nameThHint')}
              </span>
            </label>
            <Input
              value={nameTh}
              onChange={(e) => onNameThChange(e.target.value)}
              placeholder={t('product.nameThPlaceholder')}
              className="font-medium"
            />
          </div>
        </div>
      </div>

      {/* Description with language pill toggle */}
      <div className="space-y-2 pt-2 border-t border-gray-100 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.storyDetails')}
          </label>
          <div className="flex items-center bg-brand-cream border border-brand-border p-0.5 rounded-xs text-[10px] font-bold">
            <button
              type="button"
              onClick={() => onDescLangTabChange('en')}
              className={`px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer uppercase tracking-wider ${
                descLangTab === 'en'
                  ? 'bg-brand-brown text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onDescLangTabChange('th')}
              className={`px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer uppercase tracking-wider ${
                descLangTab === 'th'
                  ? 'bg-brand-brown text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              TH
            </button>
          </div>
        </div>

        {descLangTab === 'en' ? (
          <Textarea
            rows={5}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('product.storyEnPlaceholder')}
            className="leading-relaxed flex-1 min-h-[120px]"
          />
        ) : (
          <Textarea
            rows={5}
            value={descriptionTh}
            onChange={(e) => onDescriptionThChange(e.target.value)}
            placeholder={t('product.storyThPlaceholder')}
            className="leading-relaxed flex-1 min-h-[120px]"
          />
        )}
      </div>
    </div>
  );
}
