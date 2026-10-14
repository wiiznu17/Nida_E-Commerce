import { ChevronDown, ChevronRight, Folder, FolderOpen, FolderPlus, Edit2, Trash2 } from 'lucide-react';
import { AdminPermission, type ApiCategory } from '@repo/types';
import { PermissionGate } from '../common';
import { useLanguage } from '../../context/LanguageContext';

export interface CategoryMainRowProps {
  mainCat: ApiCategory;
  subsCount: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  isToggling: boolean;
  onToggleStatus: (cat: ApiCategory) => void;
  onAddSub: (mainCat: ApiCategory) => void;
  onEdit: (cat: ApiCategory) => void;
  onDelete: (cat: ApiCategory) => void;
}

export function CategoryMainRow({
  mainCat,
  subsCount,
  isExpanded,
  onToggleExpand,
  isToggling,
  onToggleStatus,
  onAddSub,
  onEdit,
  onDelete,
}: CategoryMainRowProps) {
  const { t, isTh } = useLanguage();
  const hasSubs = subsCount > 0;

  return (
    <tr
      className={`transition-colors border-b border-brand-border ${
        isExpanded ? 'bg-brand-cream/30' : 'hover:bg-brand-cream/15'
      }`}
    >
      {/* Name (EN / TH) + Expand Chevron */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2.5">
          {/* Expand/Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleExpand(mainCat.id)}
            className={`p-1 rounded-xs text-stone-500 hover:text-brand-brown hover:bg-stone-200/60 transition-transform cursor-pointer ${
              !hasSubs ? 'opacity-40 hover:opacity-100' : ''
            }`}
            title={isExpanded ? t('category.collapseAll') : t('category.expandAll')}
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-brand-brown" />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Folder Icon & Titles */}
          <div
            onClick={() => onToggleExpand(mainCat.id)}
            className="cursor-pointer flex items-center space-x-2 flex-1"
          >
            {isExpanded ? (
              <FolderOpen size={17} className="text-brand-brown shrink-0" />
            ) : (
              <Folder size={17} className="text-stone-400 shrink-0" />
            )}

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-900 text-[13px]">
                  {isTh && mainCat.nameTh ? mainCat.nameTh : mainCat.name}
                </span>
                {/* Subcategory Count Badge */}
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-xs ${
                    hasSubs
                      ? 'bg-brand-brown/10 text-brand-dark-brown border border-brand-brown/20'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {t('category.subcategoriesCount').replace('{count}', String(subsCount))}
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                {isTh ? mainCat.name : mainCat.nameTh || '—'}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Department Badge */}
      <td className="py-3 px-4 text-center">
        <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-stone-100 text-stone-700 border border-stone-200">
          {mainCat.department || '—'}
        </span>
      </td>

      {/* Hierarchy Type */}
      <td className="py-3 px-4">
        <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-stone-100 text-stone-800 border border-stone-200">
          {t('category.typeMain')}
        </span>
      </td>

      {/* Slug */}
      <td className="py-3 px-4">
        <span className="font-mono text-[11px] text-stone-600 bg-stone-50 px-1.5 py-0.5 rounded-xs border border-stone-200">
          {mainCat.slug}
        </span>
      </td>

      {/* Product Count */}
      <td className="py-3 px-4 text-center font-mono font-bold text-stone-700">
        {mainCat.productCount ?? 0}
      </td>

      {/* Display Order */}
      <td className="py-3 px-4 text-center font-mono text-stone-500">
        {mainCat.displayOrder ?? 0}
      </td>

      {/* Status Toggle */}
      <td className="py-3 px-4 text-center">
        <PermissionGate
          permission={AdminPermission.CATALOG_WRITE}
          fallback={
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                mainCat.isActive !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-500 border border-stone-200'
              }`}
            >
              {mainCat.isActive !== false
                ? t('category.statusActive')
                : t('category.statusInactive')}
            </span>
          }
        >
          <button
            onClick={() => onToggleStatus(mainCat)}
            disabled={isToggling}
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-xs transition-colors cursor-pointer border ${
              mainCat.isActive !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {mainCat.isActive !== false
              ? t('category.statusActive')
              : t('category.statusInactive')}
          </button>
        </PermissionGate>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center space-x-1.5">
          <PermissionGate permission={AdminPermission.CATALOG_WRITE}>
            <button
              onClick={() => onAddSub(mainCat)}
              className="p-1.5 text-stone-500 hover:text-brand-brown hover:bg-stone-100 rounded-xs transition-colors cursor-pointer"
              title={t('category.addSubCategory')}
            >
              <FolderPlus size={14} />
            </button>
            <button
              onClick={() => onEdit(mainCat)}
              className="p-1.5 text-stone-500 hover:text-brand-brown hover:bg-stone-100 rounded-xs transition-colors cursor-pointer"
              title={t('category.editBtn')}
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(mainCat)}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
              title={t('category.modal.cancel')}
            >
              <Trash2 size={14} />
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}
