import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { SearchInput, DropdownSelect } from '../ui';
import { useLanguage } from '../../context/LanguageContext';
import {
  CUSTOMER_STATUS_OPTIONS,
  MEMBERSHIP_TIER_OPTIONS,
} from './customerConstants';
import type { CustomerFilterState } from './customerTypes';
import { AccountStatus, MembershipTier } from '@repo/types';

export interface CustomerFilterBarProps {
  filters: CustomerFilterState;
  onChange: (updated: Partial<CustomerFilterState>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
}

export function CustomerFilterBar({
  filters,
  onChange,
  onSubmit,
  onReset,
}: CustomerFilterBarProps) {
  const { t } = useLanguage();

  const statusOptions = CUSTOMER_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  const tierOptions = MEMBERSHIP_TIER_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.value ? opt.labelKey : t(opt.labelKey),
  }));

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.tier,
  );

  return (
    <div className="bg-white border border-brand-border rounded-xs p-4 mb-5 shadow-2xs">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5">
            <SearchInput
              value={filters.search}
              onChange={(val) => onChange({ search: val })}
              onClear={() => onChange({ search: '' })}
              placeholder={t('customers.filter.searchPlaceholder')}
            />
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-3">
            <DropdownSelect
              value={filters.status ?? ''}
              onChange={(val) =>
                onChange({
                  status: (val as AccountStatus) || undefined,
                })
              }
              options={statusOptions}
            />
          </div>

          {/* Tier Dropdown */}
          <div className="lg:col-span-2">
            <DropdownSelect
              value={filters.tier ?? ''}
              onChange={(val) =>
                onChange({
                  tier: (val as MembershipTier) || undefined,
                })
              }
              options={tierOptions}
            />
          </div>

          {/* Action Buttons: Search & Reset */}
          <div className="flex items-center space-x-1.5 sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-brand-brown hover:bg-brand-dark-brown text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('customers.filter.searchBtn')}</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={!hasActiveFilters}
              title={t('customers.filter.reset')}
              className={`p-2.5 rounded-xs border text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                hasActiveFilters
                  ? 'border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400'
                  : 'border-stone-200 text-stone-300 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
