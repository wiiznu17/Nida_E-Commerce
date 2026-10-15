import { FolderTree } from 'lucide-react';
import { PRODUCT_DEPARTMENTS } from '@repo/types';
import { useLanguage } from '../../../context/LanguageContext';
import { DropdownSelect } from '../../ui';
import type { FormTaxonomySectionProps } from './formTypes';

export function FormTaxonomySection({
  department,
  category,
  subCategoryKey,
  subCategory,
  subCategoryTh,
  availableCategories,
  availableSubCategories,
  onDepartmentChange,
  onCategoryChange,
  onSubCategoryChange,
}: FormTaxonomySectionProps) {
  const { t, isTh } = useLanguage();

  return (
    <div
      id="sec-taxonomy"
      className="bg-white border border-brand-border p-4 sm:p-5 rounded-md shadow-2xs space-y-3.5"
    >
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
        <FolderTree size={16} className="text-brand-amber" />
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
          {t('product.taxonomy')}
        </h3>
      </div>

      {/* Department */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700">
          {t('product.department')}
        </label>
        <DropdownSelect
          value={department}
          onChange={onDepartmentChange}
          options={PRODUCT_DEPARTMENTS.map((dept) => ({
            value: dept.id,
            label: isTh ? dept.labelTh : dept.labelEn,
          }))}
        />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700">
          {t('product.category')}
        </label>
        <DropdownSelect
          value={category}
          onChange={onCategoryChange}
          options={availableCategories.map((cat) => ({
            value: cat.id,
            label:
              isTh && cat.labelTh
                ? `${cat.labelTh} (${cat.labelEn})`
                : cat.label,
          }))}
        />
      </div>

      {/* Sub-Category Dropdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.subCategory')}
          </label>
          <span className="text-[10px] text-gray-500 font-mono">
            {availableSubCategories.length} {t('product.options')}
          </span>
        </div>
        <DropdownSelect
          value={subCategoryKey || subCategory}
          onChange={onSubCategoryChange}
          options={availableSubCategories.map((sub) => ({
            value: sub.id,
            label:
              isTh && sub.labelTh
                ? `${sub.labelTh} (${sub.labelEn})`
                : sub.label,
          }))}
        />

        {/* Selected Category Info Box */}
        {(subCategory || subCategoryTh) && (
          <div className="bg-brand-cream border border-brand-border rounded-md p-2.5 space-y-2 mt-2">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white p-1.5 rounded-sm border border-gray-100">
                <span className="text-gray-400 block font-medium">
                  EN Label
                </span>
                <span
                  className="font-bold text-brand-brown truncate block"
                  title={subCategory}
                >
                  {subCategory || '-'}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded-sm border border-gray-100">
                <span className="text-gray-400 block font-medium">
                  TH Label
                </span>
                <span
                  className="font-bold text-brand-brown truncate block"
                  title={subCategoryTh}
                >
                  {subCategoryTh || '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
