import { CornerDownRight, Edit2, Trash2 } from 'lucide-react';
import { AdminPermission, type ApiCategory } from '@repo/types';
import { PermissionGate } from '../common';
import { useLanguage } from '../../context/LanguageContext';

export interface CategorySubRowProps {
  subCat: ApiCategory;
  isToggling: boolean;
  onToggleStatus: (cat: ApiCategory) => void;
  onEdit: (cat: ApiCategory) => void;
  onDelete: (cat: ApiCategory) => void;
}

export function CategorySubRow({
  subCat,
  isToggling,
  onToggleStatus,
  onEdit,
  onDelete,
}: CategorySubRowProps) {
  const { t, isTh } = useLanguage();

  return (
    <tr className="bg-stone-50/50 hover:bg-stone-100/60 transition-colors border-b border-stone-200/60">
      {/* Indented Tree Name */}
      <td className="py-2.5 px-4 pl-12">
        <div className="flex items-center space-x-2">
          <CornerDownRight size={13} className="text-stone-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-stone-800">
              {isTh && subCat.nameTh ? subCat.nameTh : subCat.name}
            </span>
            <span className="text-[10px] text-stone-400">
              {isTh ? subCat.name : subCat.nameTh || '—'}
            </span>
          </div>
        </div>
      </td>

      {/* Department (muted) */}
      <td className="py-2.5 px-4 text-center">
        <span className="text-[10px] text-stone-400 uppercase font-mono">
          {subCat.department || '—'}
        </span>
      </td>

      {/* Hierarchy Type Badge */}
      <td className="py-2.5 px-4">
        <span className="inline-block px-1.5 py-0.5 rounded-xs bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-medium">
          {t('category.subCategoryLabel')}
        </span>
      </td>

      {/* Slug */}
      <td className="py-2.5 px-4">
        <span className="font-mono text-[10px] text-stone-500 bg-white px-1.5 py-0.5 rounded-xs border border-stone-200">
          {subCat.slug}
        </span>
      </td>

      {/* Product Count */}
      <td className="py-2.5 px-4 text-center font-mono font-medium text-stone-600">
        {subCat.productCount ?? 0}
      </td>

      {/* Display Order */}
      <td className="py-2.5 px-4 text-center font-mono text-stone-500 text-[11px]">
        {subCat.displayOrder ?? 0}
      </td>

      {/* Status Toggle */}
      <td className="py-2.5 px-4 text-center">
        <PermissionGate
          permission={AdminPermission.CATALOG_WRITE}
          fallback={
            <span
              className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-xs ${
                subCat.isActive !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-500 border border-stone-200'
              }`}
            >
              {subCat.isActive !== false
                ? t('category.statusActive')
                : t('category.statusInactive')}
            </span>
          }
        >
          <button
            onClick={() => onToggleStatus(subCat)}
            disabled={isToggling}
            className={`px-2 py-0.5 text-[9px] font-bold rounded-xs transition-colors cursor-pointer border ${
              subCat.isActive !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {subCat.isActive !== false
              ? t('category.statusActive')
              : t('category.statusInactive')}
          </button>
        </PermissionGate>
      </td>

      {/* Actions */}
      <td className="py-2.5 px-4 text-center">
        <div className="flex items-center justify-center space-x-1.5">
          <PermissionGate permission={AdminPermission.CATALOG_WRITE}>
            <button
              onClick={() => onEdit(subCat)}
              className="p-1 text-stone-400 hover:text-brand-brown hover:bg-stone-200/50 rounded-xs transition-colors cursor-pointer"
              title={t('category.editBtn')}
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(subCat)}
              className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
              title={t('category.modal.cancel')}
            >
              <Trash2 size={13} />
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}
