import React, { useState, useEffect } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { AuditActionType } from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect, SearchInput, Button } from '../ui';
import type { AuditFilterBarProps } from './auditTypes';

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  filters,
  onSearch,
  onReset,
  isLoading,
}) => {
  const { t } = useLanguage();

  const [draftUsername, setDraftUsername] = useState(filters.username);
  const [draftTargetTable, setDraftTargetTable] = useState(filters.targetTable);
  const [draftActionType, setDraftActionType] = useState(filters.actionType);

  useEffect(() => {
    setDraftUsername(filters.username);
    setDraftTargetTable(filters.targetTable);
    setDraftActionType(filters.actionType);
  }, [filters.username, filters.targetTable, filters.actionType]);

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

  const handleUsernameChange = (val: string) => {
    const sanitized = val.replace(/[^a-zA-Z0-9_.-]/g, '');
    setDraftUsername(sanitized);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      username: draftUsername.trim(),
      targetTable: draftTargetTable,
      actionType: draftActionType,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-xs mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4">
          <SearchInput
            value={draftUsername}
            onChange={handleUsernameChange}
            placeholder={t('audit.searchUsernamePlaceholder')}
            title={t('audit.searchUsernameHint')}
            className="w-full"
          />
        </div>

        <div className="md:col-span-3">
          <DropdownSelect
            value={draftTargetTable}
            onChange={(val) => setDraftTargetTable(val)}
            options={tableOptions}
            className="w-full bg-stone-50/50"
          />
        </div>

        <div className="md:col-span-2">
          <DropdownSelect
            value={draftActionType}
            onChange={(val) =>
              setDraftActionType(val as AuditActionType | '')
            }
            options={actionOptions}
            className="w-full bg-stone-50/50"
          />
        </div>

        <div className="md:col-span-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            title={t('common.reset') ?? 'Reset'}
            className="px-2.5 text-stone-600 hover:text-stone-900 border-stone-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{t('audit.searchBtn')}</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
