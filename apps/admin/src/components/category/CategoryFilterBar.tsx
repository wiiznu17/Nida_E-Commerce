import { ChevronsUpDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SearchInput } from '../ui';
import type { CategoryDepartmentOption } from './categoryTypes';

export interface CategoryFilterBarProps {
  departments: CategoryDepartmentOption[];
  selectedDept: string;
  onSelectDept: (deptId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasCategories: boolean;
  areAllExpanded: boolean;
  onToggleExpandAll: () => void;
}

export function CategoryFilterBar({
  departments,
  selectedDept,
  onSelectDept,
  searchQuery,
  onSearchChange,
  hasCategories,
  areAllExpanded,
  onToggleExpandAll,
}: CategoryFilterBarProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-brand-border p-4 rounded-xs shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {departments.map((dept) => {
            const isSelected = selectedDept.toLowerCase() === dept.id.toLowerCase();
            return (
              <button
                key={dept.id}
                onClick={() => onSelectDept(dept.id)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-brown text-white shadow-2xs'
                    : 'bg-brand-cream/50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-brand-border'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Expand / Collapse All Button */}
          {hasCategories && (
            <button
              type="button"
              onClick={onToggleExpandAll}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xs border border-brand-border bg-stone-50 hover:bg-stone-100 text-stone-700 inline-flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              title={areAllExpanded ? t('category.collapseAll') : t('category.expandAll')}
            >
              <ChevronsUpDown size={14} />
              <span className="hidden sm:inline">
                {areAllExpanded ? t('category.collapseAll') : t('category.expandAll')}
              </span>
            </button>
          )}

          {/* Search Input */}
          <div className="w-full md:w-72">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={t('category.searchPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
