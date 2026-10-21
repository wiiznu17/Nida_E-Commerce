import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCw, Clock, Truck, ExternalLink } from 'lucide-react';
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
  formatReturnDeadlineRemaining,
} from '../../utils';
import type { ApiReturnRequestWithOrder } from '@repo/types';

interface ReturnTableProps {
  items: ApiReturnRequestWithOrder[];
  isLoading: boolean;
  onReview: (request: ApiReturnRequestWithOrder) => void;
  onInspect: (request: ApiReturnRequestWithOrder) => void;
}

export const ReturnTable: React.FC<ReturnTableProps> = ({
  items,
  isLoading,
  onReview,
  onInspect,
}) => {
  const { t, language } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{t('returnsPage.filterRequested')}</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{t('returnsPage.filterApproved')}</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{t('returnsPage.filterShipped')}</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('returnsPage.filterCompleted')}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span>{t('returnsPage.filterRejected')}</span>
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
              {t('returnsPage.table.requestNumber')}
            </TableHead>
            <TableHead className="w-[14%] min-w-[120px]">
              {t('returnsPage.table.order')}
            </TableHead>
            <TableHead className="w-[18%] min-w-[150px]">
              {t('returnsPage.table.customer')}
            </TableHead>
            <TableHead className="w-[20%] min-w-[160px]">
              {t('returnsPage.table.items')}
            </TableHead>
            <TableHead className="w-[12%] min-w-[110px]">
              {t('returnsPage.table.shipment')}
            </TableHead>
            <TableHead className="w-[10%] min-w-[100px] text-center">
              {t('returnsPage.table.status')}
            </TableHead>
            <TableHead className="w-[16%] min-w-[170px] text-right">
              {t('returnsPage.table.action')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12">
                <EmptyState
                  icon={RotateCw}
                  title={t('returnsPage.emptyTitle')}
                  subtitle={t('returnsPage.emptySubtitle')}
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
                    to={`/admin/orders/${req.order?.orderNumber ?? req.orderId}`}
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
                  <div className="space-y-1">
                    {req.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="text-xs text-stone-800 line-clamp-1"
                      >
                        <span className="font-bold">{item.quantity}x</span>{' '}
                        {item.productName ?? 'Product'}
                        {item.variantInfo && (
                          <span className="text-[10px] text-stone-500 ml-1">
                            ({item.variantInfo})
                          </span>
                        )}
                      </div>
                    ))}
                    {req.items.length > 2 && (
                      <div className="text-[10px] text-stone-500 font-medium">
                        +{req.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {req.status === 'SHIPPED' && req.returnTrackingNumber ? (
                    <div className="space-y-0.5">
                      <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-xs border border-purple-200">
                        <Truck size={11} className="text-purple-700 shrink-0" />
                        <span className="font-mono">
                          {req.returnCarrier}: {req.returnTrackingNumber}
                        </span>
                      </div>
                      {req.returnShippingFee !== undefined &&
                        req.returnShippingFee > 0 && (
                          <div className="text-[10px] text-emerald-700 font-bold font-mono">
                            Claim: {formatPrice(req.returnShippingFee)}
                          </div>
                        )}
                    </div>
                  ) : req.status === 'APPROVED' && req.reviewedAt ? (
                    <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xs border border-blue-200">
                      <Clock size={11} />
                      <span>
                        {formatReturnDeadlineRemaining(
                          req.reviewedAt,
                          language,
                        )}
                      </span>
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
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      to={`/admin/orders/${req.order?.orderNumber ?? req.orderId}`}
                      className="px-2 py-1 text-xs font-bold border border-brand-border bg-white hover:bg-stone-50 text-stone-700 rounded-xs transition-colors inline-flex items-center space-x-1 shadow-2xs whitespace-nowrap"
                    >
                      <ExternalLink size={12} />
                      <span>{t('returnsPage.viewOrderBtn')}</span>
                    </Link>

                    {req.status === 'REQUESTED' && (
                      <button
                        type="button"
                        onClick={() => onReview(req)}
                        className="px-2.5 py-1 text-xs font-bold bg-[#2B1810] hover:bg-[#3D2317] text-white rounded-xs transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                      >
                        {t('returnsPage.reviewBtn')}
                      </button>
                    )}
                    {(req.status === 'APPROVED' ||
                      req.status === 'SHIPPED') && (
                      <button
                        type="button"
                        disabled={
                          req.status !== 'SHIPPED' || !req.returnTrackingNumber
                        }
                        onClick={() => onInspect(req)}
                        title={
                          req.status !== 'SHIPPED' || !req.returnTrackingNumber
                            ? t('returnsPage.waitingShipmentTooltip')
                            : undefined
                        }
                        className={`px-2 py-1 text-xs font-bold rounded-xs transition-colors shadow-2xs whitespace-nowrap ${
                          req.status === 'SHIPPED' && req.returnTrackingNumber
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                            : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        {t('returnsPage.inspectBtn')}
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
