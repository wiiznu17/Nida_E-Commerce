import React from 'react';
import { Link } from 'react-router-dom';
import { Ban, Clock } from 'lucide-react';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '../ui';
import { useLanguage } from '../../context/LanguageContext';
import {
  formatOrderDateTime,
  formatPrice,
  formatSlaRemaining,
} from '../../utils';
import type { ApiOrderCancellationWithOrder } from '@repo/types';

interface CancellationTableProps {
  items: ApiOrderCancellationWithOrder[];
  isLoading: boolean;
  onReview: (request: ApiOrderCancellationWithOrder) => void;
}

export const CancellationTable: React.FC<CancellationTableProps> = ({
  items,
  isLoading,
  onReview,
}) => {
  const { t, language } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{t('cancellationsPage.filterPending')}</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('cancellationsPage.filterApproved')}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span>{t('cancellationsPage.filterRejected')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <TableContainer
      className={
        isLoading
          ? 'opacity-60 transition-opacity pointer-events-none'
          : 'transition-opacity'
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[18%] min-w-[140px]">
              {t('cancellationsPage.table.requestNumber')}
            </TableHead>
            <TableHead className="w-[16%] min-w-[130px]">
              {t('cancellationsPage.table.order')}
            </TableHead>
            <TableHead className="w-[20%] min-w-[160px]">
              {t('cancellationsPage.table.customer')}
            </TableHead>
            <TableHead className="w-[20%] min-w-[160px]">
              {t('cancellationsPage.table.reason')}
            </TableHead>
            <TableHead className="w-[14%] min-w-[120px]">
              {t('cancellationsPage.table.sla')}
            </TableHead>
            <TableHead className="w-[12%] min-w-[100px] text-center">
              {t('cancellationsPage.table.status')}
            </TableHead>
            <TableHead className="w-[10%] min-w-[90px] text-right">
              {t('cancellationsPage.table.action')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12">
                <EmptyState
                  icon={Ban}
                  title={t('cancellationsPage.emptyTitle')}
                  subtitle={t('cancellationsPage.emptySubtitle')}
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((req) => (
              <TableRow key={req.id} className="hover:bg-brand-cream/20">
                <TableCell>
                  <div className="font-mono text-xs font-black text-brand-dark-brown">
                    {req.requestNumber}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                    {formatOrderDateTime(req.createdAt, language)}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/admin/orders/${req.orderId}`}
                    className="font-mono text-xs font-bold text-brand-brown hover:underline block"
                  >
                    #{req.order?.orderNumber}
                  </Link>
                  <div className="text-xs font-black text-stone-900 mt-0.5">
                    {formatPrice(req.order?.totalAmount ?? 0)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-bold text-stone-900">
                    {req.user
                      ? `${req.user.firstName ?? ''} ${req.user.lastName ?? ''}`.trim() ||
                        req.user.email
                      : '-'}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate">
                    {req.user?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-stone-800 line-clamp-1">
                    {req.reason}
                  </div>
                  {req.customerNote && (
                    <div className="text-[11px] text-stone-500 italic line-clamp-1 mt-0.5">
                      "{req.customerNote}"
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {req.status === 'PENDING' ? (
                    <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                      <Clock size={11} />
                      <span>{formatSlaRemaining(req.createdAt, language)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-400 font-medium">
                      -
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(req.status)}
                </TableCell>
                <TableCell className="text-right">
                  {req.status === 'PENDING' ? (
                    <button
                      type="button"
                      onClick={() => onReview(req)}
                      className="px-2.5 py-1 text-xs font-bold bg-[#2B1810] hover:bg-[#3D2317] text-white rounded-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      {t('cancellationsPage.reviewBtn')}
                    </button>
                  ) : (
                    <Link
                      to={`/admin/orders/${req.orderId}`}
                      className="text-xs font-bold text-brand-brown hover:underline inline-flex items-center"
                    >
                      {t('cancellationsPage.viewDetails')}
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
