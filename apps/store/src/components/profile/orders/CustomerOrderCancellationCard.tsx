'use client';

import React from 'react';
import { Ban, Clock, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatOrderDateTime } from '@/utils';
import type { ApiOrderCancellationRequest } from '@repo/types';

interface CustomerOrderCancellationCardProps {
  cancellationRequests: ApiOrderCancellationRequest[];
}

export function CustomerOrderCancellationCard({
  cancellationRequests,
}: CustomerOrderCancellationCardProps) {
  const { t, language } = useLanguage();

  if (!cancellationRequests || cancellationRequests.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>{t('status.pending')}</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
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

  return (
    <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs font-sans space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <Ban className="w-4 h-4 text-rose-700" />
          <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown">
            {t('orderDetail.cancellationCard.title')}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {cancellationRequests.map((req) => {
          const isAutoApproved =
            req.adminNote?.toLowerCase().includes('auto-approved') ||
            req.adminNote?.toLowerCase().includes('48-hour');

          return (
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
                    {t('orderDetail.cancellationCard.reason')}
                  </span>
                  <p className="font-medium text-stone-800 mt-0.5">
                    {req.reason}
                  </p>
                </div>

                {req.customerNote && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {t('orderDetail.cancellationCard.customerNote')}
                    </span>
                    <p className="text-stone-700 mt-0.5 italic">
                      "{req.customerNote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Status Specific Context Banners */}
              {req.status === 'PENDING' && (
                <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xs flex items-center space-x-2 text-[11px] text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{t('orderDetail.cancellationCard.slaNotice')}</span>
                </div>
              )}

              {req.status === 'APPROVED' && (
                <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xs text-[11px] text-emerald-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      {isAutoApproved
                        ? t('orderDetail.cancellationCard.autoApprovedLabel')
                        : (req.adminNote ??
                          t('orderDetail.cancellationApprovedNotice'))}
                    </span>
                  </div>
                  {req.reviewedAt && (
                    <p className="text-[10px] text-emerald-700 pl-5">
                      {t('orderDetail.cancellationCard.reviewedAt')}:{' '}
                      {formatOrderDateTime(req.reviewedAt, language)}
                    </p>
                  )}
                </div>
              )}

              {req.status === 'REJECTED' && req.adminNote && (
                <div className="mt-2 p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xs text-[11px] text-rose-900">
                  <span className="font-bold">
                    {t('orderDetail.cancellationCard.adminNote')}:{' '}
                  </span>
                  <span>{req.adminNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
