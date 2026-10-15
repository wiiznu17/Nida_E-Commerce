import React from 'react';
import { Plus, FolderTree } from 'lucide-react';
import { AdminPermission, type ApiCategory } from '@repo/types';
import { EmptyState } from '../ui';
import { PermissionGate } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { CategoryMainRow } from './CategoryMainRow';
import { CategorySubRow } from './CategorySubRow';

export interface CategoryTableProps {
  isLoading: boolean;
  mainCategories: ApiCategory[];
  subCategoryMap: Map<string, ApiCategory[]>;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  togglingId: string | null;
  onToggleStatus: (cat: ApiCategory) => void;
  onAddSub: (mainCat: ApiCategory) => void;
  onEdit: (cat: ApiCategory) => void;
  onDelete: (cat: ApiCategory) => void;
  searchQuery: string;
}

export function CategoryTable({
  isLoading,
  mainCategories,
  subCategoryMap,
  expandedIds,
  onToggleExpand,
  togglingId,
  onToggleStatus,
  onAddSub,
  onEdit,
  onDelete,
  searchQuery,
}: CategoryTableProps) {
  const { t } = useLanguage();
  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="bg-white border border-brand-border rounded-xs shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-stone-50/75 text-[10px] font-black uppercase tracking-wider text-stone-500">
              <th className="py-3 px-4">{t('category.table.name')}</th>
              <th className="py-3 px-4 w-28 text-center">
                {t('category.table.department')}
              </th>
              <th className="py-3 px-4 w-40">{t('category.table.type')}</th>
              <th className="py-3 px-4 w-36 font-mono">
                {t('category.table.slug')}
              </th>
              <th className="py-3 px-4 w-24 text-center">
                {t('category.table.products')}
              </th>
              <th className="py-3 px-4 w-20 text-center">
                {t('category.table.order')}
              </th>
              <th className="py-3 px-4 w-28 text-center">
                {t('category.table.status')}
              </th>
              <th className="py-3 px-4 w-28 text-center">
                {t('category.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-400">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium tracking-wide">
                      Loading categories...
                    </span>
                  </div>
                </td>
              </tr>
            ) : mainCategories.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <EmptyState
                    icon={FolderTree}
                    title={t('category.emptyState')}
                  />
                </td>
              </tr>
            ) : (
              mainCategories.map((mainCat) => {
                const subs = subCategoryMap.get(mainCat.id) || [];
                const isExpanded = expandedIds.has(mainCat.id);
                const isMainToggling = togglingId === mainCat.id;

                // Filter subcategories if user typed a search query
                const visibleSubs = q
                  ? subs.filter(
                      (s) =>
                        s.name.toLowerCase().includes(q) ||
                        (s.nameTh && s.nameTh.toLowerCase().includes(q)) ||
                        s.slug.toLowerCase().includes(q),
                    )
                  : subs;

                return (
                  <React.Fragment key={mainCat.id}>
                    {/* Main Category Row */}
                    <CategoryMainRow
                      mainCat={mainCat}
                      subsCount={subs.length}
                      isExpanded={isExpanded}
                      onToggleExpand={onToggleExpand}
                      isToggling={isMainToggling}
                      onToggleStatus={onToggleStatus}
                      onAddSub={onAddSub}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />

                    {/* Nested Subcategories Rows */}
                    {isExpanded && (
                      <>
                        {visibleSubs.length === 0 ? (
                          <tr className="bg-stone-50/50">
                            <td
                              colSpan={8}
                              className="py-2.5 pl-14 pr-4 text-stone-400"
                            >
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="italic">
                                  {t('category.noSubcategories')}
                                </span>
                                <PermissionGate
                                  permission={AdminPermission.CATALOG_WRITE}
                                >
                                  <button
                                    onClick={() => onAddSub(mainCat)}
                                    className="text-brand-brown font-bold hover:underline cursor-pointer ml-1 inline-flex items-center space-x-1"
                                  >
                                    <Plus size={12} />
                                    <span>{t('category.addSubCategory')}</span>
                                  </button>
                                </PermissionGate>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          visibleSubs.map((subCat) => (
                            <CategorySubRow
                              key={subCat.id}
                              subCat={subCat}
                              isToggling={togglingId === subCat.id}
                              onToggleStatus={onToggleStatus}
                              onEdit={onEdit}
                              onDelete={onDelete}
                            />
                          ))
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
