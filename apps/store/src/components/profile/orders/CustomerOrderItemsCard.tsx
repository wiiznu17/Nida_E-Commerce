'use client';

import React from 'react';
import Image from 'next/image';
import { Package, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder } from '@repo/types';

interface CustomerOrderItemsCardProps {
  order: ApiOrder;
}

export function CustomerOrderItemsCard({ order }: CustomerOrderItemsCardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 font-sans">
      {/* Purchased Items Card */}
      <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown mb-4 pb-2 border-b border-stone-100">
          {t('orderDetail.itemsPurchased')}
        </h2>

        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                {item.imageUrl ? (
                  <div className="w-16 h-20 bg-stone-100 border border-brand-border shrink-0 relative overflow-hidden rounded-xs">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-20 bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center text-stone-400 rounded-xs">
                    <Package size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-stone-900 truncate">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {item.variantInfo}
                  </p>
                  <p className="text-[11px] font-mono text-stone-400 mt-1">
                    ฿{Number(item.unitPrice).toLocaleString()} x {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-sm text-stone-900">
                  ฿{Number(item.subtotal).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refund Transactions Card (if any) */}
      {order.refunds && order.refunds.length > 0 && (
        <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown mb-4 pb-2 border-b border-stone-100 flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>{t('orderDetail.refundHistoryTitle')}</span>
          </h2>

          <div className="space-y-3">
            {order.refunds.map((rf) => (
              <div
                key={rf.id}
                className="p-3.5 border border-brand-border/60 rounded-xs bg-stone-50/40 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-stone-800">
                      {rf.refundNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                      {rf.status}
                    </span>
                  </div>
                  {rf.reason && (
                    <p className="text-[11px] text-stone-500 mt-1">
                      {t('orderDetail.reasonPrefix')}: {rf.reason}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-rose-700">
                    -฿{Number(rf.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
