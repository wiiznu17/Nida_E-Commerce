import { FolderTree, ChevronDown } from 'lucide-react';
import { PRODUCT_DEPARTMENTS } from '@repo/types';
import { useLanguage } from '../../../context/LanguageContext';
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
      className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs space-y-3.5"
    >
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
        <FolderTree size={16} className="text-[#D97706]" />
        <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
          {t('product.taxonomy')}
        </h3>
      </div>

      {/* Department */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700">
          {t('product.department')}
        </label>
        <div className="relative">
          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full appearance-none text-xs pl-3 pr-9 py-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] bg-white outline-hidden font-medium cursor-pointer"
          >
            {PRODUCT_DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {isTh ? dept.labelTh : dept.labelEn}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700">
          {t('product.category')}
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none text-xs pl-3 pr-9 py-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] bg-white outline-hidden font-medium cursor-pointer"
          >
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {isTh ? cat.labelTh : cat.labelEn}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Sub-Category Enum Dropdown */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700">
            {t('product.subCategory')}
          </label>
          <span className="text-[10px] text-gray-500 font-mono">
            {availableSubCategories.length} {t('product.options')}
          </span>
        </div>
        <div className="relative">
          <select
            value={subCategoryKey}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            className="w-full appearance-none text-xs pl-3 pr-9 py-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] bg-white outline-hidden font-medium cursor-pointer"
          >
            {availableSubCategories.map((sub) => (
              <option key={sub.key} value={sub.key}>
                {isTh ? `${sub.labelTh} (${sub.labelEn})` : sub.labelEn}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Fixed Taxonomy Info Box */}
        <div className="bg-[#FAF7F2] border border-[#EAE3D9] rounded-md p-2.5 space-y-2 mt-2">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1.5 rounded-sm border border-gray-100">
              <span className="text-gray-400 block font-medium">EN Label</span>
              <span className="font-bold text-[#2B1810] truncate block" title={subCategory}>
                {subCategory}
              </span>
            </div>
            <div className="bg-white p-1.5 rounded-sm border border-gray-100">
              <span className="text-gray-400 block font-medium">TH Label</span>
              <span className="font-bold text-[#2B1810] truncate block" title={subCategoryTh}>
                {subCategoryTh}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 leading-tight">
            {t('product.taxonomyLockNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
