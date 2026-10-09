import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import type { FormMaterialsCareSectionProps } from './formTypes';

export function FormMaterialsCareSection({
  materialsCare,
  materialsCareTh,
  onMaterialsCareChange,
  onMaterialsCareThChange,
}: FormMaterialsCareSectionProps) {
  const { t } = useLanguage();

  return (
    <div
      id="sec-story"
      className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs flex-1 flex flex-col justify-between space-y-3"
    >
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
        <SlidersHorizontal size={16} className="text-[#D97706]" />
        <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
          {t('product.materialsCareTitle')}
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1 flex-1 flex flex-col">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.materialsCareEn')}
          </label>
          <textarea
            rows={3}
            value={materialsCare}
            onChange={(e) => onMaterialsCareChange(e.target.value)}
            placeholder={t('product.materialsCareEnPlaceholder')}
            className="w-full flex-1 min-h-[72px] text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] outline-hidden leading-relaxed"
          />
        </div>

        <div className="space-y-1 flex-1 flex flex-col">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.materialsCareTh')}
          </label>
          <textarea
            rows={3}
            value={materialsCareTh}
            onChange={(e) => onMaterialsCareThChange(e.target.value)}
            placeholder={t('product.materialsCareThPlaceholder')}
            className="w-full flex-1 min-h-[72px] text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] outline-hidden leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
