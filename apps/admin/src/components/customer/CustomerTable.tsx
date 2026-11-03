import { Eye, Clock, Ban, RotateCcw, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../common';
import { EmptyState } from '../ui';
import { MEMBERSHIP_TIER_STYLES } from './customerConstants';
import { formatCurrency, formatDate } from '../../utils';
import type { ApiAdminCustomerListItem } from '@repo/types';

export interface CustomerTableProps {
  customers: ApiAdminCustomerListItem[];
  isLoading: boolean;
  onViewDetail: (customerId: string) => void;
  onSuspend: (customer: ApiAdminCustomerListItem) => void;
  onBan: (customer: ApiAdminCustomerListItem) => void;
  onReactivate: (customer: ApiAdminCustomerListItem) => void;
}

export function CustomerTable({
  customers,
  isLoading,
  onViewDetail,
  onSuspend,
  onBan,
  onReactivate,
}: CustomerTableProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="bg-white border border-brand-border rounded-xs p-12 text-center shadow-2xs">
        <div className="inline-block animate-spin w-7 h-7 border-2 border-stone-300 border-t-[#2B1810] rounded-full mb-3" />
        <p className="text-xs text-stone-500 font-bold tracking-wider uppercase">
          {t('users.loading')}
        </p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white border border-brand-border rounded-xs shadow-2xs">
        <EmptyState
          icon={Users}
          title={t('customers.table.empty')}
          subtitle={t('customers.filter.searchPlaceholder')}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-border rounded-xs overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/75 text-[10px] font-black uppercase tracking-wider text-stone-500">
              <th className="py-3 px-5">{t('customers.table.customer')}</th>
              <th className="py-3 px-4 w-28 text-center">
                {t('customers.table.tier')}
              </th>
              <th className="py-3 px-4 w-24 text-right">
                {t('customers.table.points')}
              </th>
              <th className="py-3 px-4 w-24 text-center">
                {t('customers.table.ordersCount')}
              </th>
              <th className="py-3 px-4 w-32 text-right">
                {t('customers.table.totalSpent')}
              </th>
              <th className="py-3 px-4 w-32 text-center">
                {t('customers.table.status')}
              </th>
              <th className="py-3 px-4 w-28 text-center">
                {t('customers.table.createdAt')}
              </th>
              <th className="py-3 px-5 w-40 text-right">
                {t('customers.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {customers.map((cust) => {
              const tierStyle =
                MEMBERSHIP_TIER_STYLES[cust.tier] ??
                MEMBERSHIP_TIER_STYLES.REGULAR;

              const initials = cust.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'C';

              return (
                <tr
                  key={cust.id}
                  className="hover:bg-stone-50/60 transition-colors"
                >
                  {/* Customer Identity */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#2B1810]/5 text-[#2B1810] font-black text-xs flex items-center justify-center shrink-0 border border-[#2B1810]/10">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">
                          {cust.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500 truncate">
                          {cust.email}
                        </div>
                        {cust.phone && (
                          <div className="text-[10px] font-mono text-stone-400">
                            {cust.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                    >
                      {tierStyle.label}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-stone-700">
                    {cust.points.toLocaleString()}
                  </td>

                  {/* Orders Count */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-900">
                    {cust.ordersCount}
                  </td>

                  {/* Total Spent */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#2B1810]">
                    {formatCurrency(cust.totalSpent)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={cust.status} />
                  </td>

                  {/* Joined At */}
                  <td className="py-3.5 px-4 text-center text-stone-500 text-[11px] whitespace-nowrap">
                    {formatDate(cust.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* View Drawer */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(cust.id)}
                        title={t('customers.drawer.title')}
                        className="p-1.5 text-stone-600 hover:text-[#2B1810] hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Status Modals */}
                      {cust.status === 'ACTIVE' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onSuspend(cust)}
                            title={t('customers.modals.suspendTitle')}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onBan(cust)}
                            title={t('customers.modals.banTitle')}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onReactivate(cust)}
                          title={t('customers.modals.reactivateTitle')}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
