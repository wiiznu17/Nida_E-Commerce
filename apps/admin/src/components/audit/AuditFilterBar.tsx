import React from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { AuditActionType } from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect, SearchInput, Button } from '../ui';
import type { AuditFilterBarProps } from './auditTypes';

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isLoading,
}) => {
  const { t } = useLanguage();

  const tableOptions = [
    { value: '', label: t('audit.filterAllModules') },
    { value: 'products', label: t('audit.tableProducts') },
    { value: 'categories', label: t('audit.tableCategories') },
    { value: 'orders', label: t('audit.tableOrders') },
    { value: 'inventory_items', label: t('audit.tableInventory') },
    { value: 'coupons', label: t('audit.tableCoupons') },
    { value: 'cms_banners', label: t('audit.tableBanners') },
    { value: 'admin_users', label: t('audit.tableStaff') },
    { value: 'shipments', label: t('audit.tableShipments') },
    { value: 'store_settings', label: t('audit.tableSettings') },
  ];

  const actionOptions = [
    { value: '', label: t('audit.filterAllActions') },
    { value: AuditActionType.CREATE, label: t('audit.actionCreate') },
    { value: AuditActionType.UPDATE, label: t('audit.actionUpdate') },
    {
      value: AuditActionType.STATUS_CHANGE,
      label: t('audit.actionStatusChange'),
    },
    { value: AuditActionType.DELETE, label: t('audit.actionDelete') },
    { value: AuditActionType.REFUND, label: t('audit.actionRefund') },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5">
          <SearchInput
            value={filters.search}
            onChange={(val) => onFilterChange('search', val)}
            placeholder={t('audit.searchPlaceholder')}
            className="w-full"
          />
        </div>

        <div className="md:col-span-3">
          <DropdownSelect
            value={filters.targetTable}
            onChange={(val) => onFilterChange('targetTable', val)}
            options={tableOptions}
            className="w-full bg-stone-50/50"
          />
        </div>

        <div className="md:col-span-2">
          <DropdownSelect
            value={filters.actionType}
            onChange={(val) =>
              onFilterChange('actionType', val as AuditActionType | '')
            }
            options={actionOptions}
            className="w-full bg-stone-50/50"
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            title={t('common.reset') ?? 'Reset'}
            className="px-2.5 text-stone-600 hover:text-stone-900 border-stone-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="text-xs font-semibold">{t('common.refresh')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
