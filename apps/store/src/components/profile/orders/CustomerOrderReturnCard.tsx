'use client';

import React from 'react';
import { RotateCw, Clock, CheckCircle2, XCircle, PackageCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatOrderDateTime } from '@/utils';
import type { ApiOrder } from '@repo/types';

interface CustomerOrderReturnCardProps {
  order: ApiOrder;
}

export function CustomerOrderReturnCard({ order }: CustomerOrderReturnCardProps) {
  const { t, language } = useLanguage();
  const returnRequests = order.returnRequests ?? [];

  if (returnRequests.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>{t('status.pending')}</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('status.approved')}</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <PackageCheck className="w-3 h-3" />
            <span>{t('status.completed')}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>{t('status.cancelled')}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const orderItemsMap = new Map(order.items.map((i) => [i.id, i]));

  return (
    <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs font-sans space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <RotateCw className="w-4 h-4 text-brand-brown" />
          <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown">
            {t('orderDetail.returnCard.title')}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {returnRequests.map((req) => (
          <div
            key={req.id}
            className="p-4 border border-brand-border/70 rounded-xs bg-stone-50/50 space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-stone-900">
                  {req.requestNumber}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-[11px] text-stone-500">
                  {formatOrderDateTime(req.createdAt, language)}
                </span>
              </div>
              <div>{getStatusBadge(req.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {t('orderDetail.returnCard.reason')}
                </span>
                <p className="font-medium text-stone-800 mt-0.5">
                  {req.reason}
                </p>
              </div>

              {req.customerNote && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {t('orderDetail.returnCard.customerNote')}
                  </span>
                  <p className="text-stone-700 mt-0.5 italic">
                    "{req.customerNote}"
                  </p>
                </div>
              )}
            </div>

            {/* Returned Items List */}
            {req.items && req.items.length > 0 && (
              <div className="pt-2 border-t border-stone-200/50 space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {t('orderDetail.returnCard.itemsTitle')}
                </span>
                <div className="space-y-1">
                  {req.items.map((item) => {
                    const matchedItem = orderItemsMap.get(item.orderItemId);
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-stone-700 bg-white p-2 rounded-xs border border-stone-200/60"
                      >
                        <span className="font-medium">
                          {matchedItem?.productName ?? item.orderItemId}
                          {matchedItem?.variantInfo && (
                            <span className="text-stone-400 ml-1.5 font-normal">
                              ({matchedItem.variantInfo})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-stone-500 font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Context Notices */}
            {req.status === 'APPROVED' && (
              <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xs text-[11px] text-blue-900 flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>{t('orderDetail.returnCard.shipmentNotice')}</span>
              </div>
            )}

            {req.status === 'COMPLETED' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xs text-[11px] text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{t('orderDetail.returnCard.inspectRefundNotice')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
