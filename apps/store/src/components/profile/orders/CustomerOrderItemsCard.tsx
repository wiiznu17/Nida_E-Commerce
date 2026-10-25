'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, RotateCcw, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CustomerOrderItemSnapshotModal } from './CustomerOrderItemSnapshotModal';
import type { ApiOrderItem, ApiOrder } from '@repo/types';

interface CustomerOrderItemsCardProps {
  order: ApiOrder;
}

export function CustomerOrderItemsCard({ order }: CustomerOrderItemsCardProps) {
  const { t } = useLanguage();
  const [selectedSnapshotItem, setSelectedSnapshotItem] =
    useState<ApiOrderItem | null>(null);

  return (
    <div className="space-y-6 font-sans">
      {/* Purchased Items Card */}
      <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown mb-4 pb-2 border-b border-stone-100">
          {t('orderDetail.itemsPurchased')}
        </h2>

        <div className="divide-y divide-stone-100">
          {order.items.map((item) => {
            const itemImageUrl = item.imageUrlSnapshot ?? item.imageUrl;
            const skuCode = item.skuCodeSnapshot ?? item.skuCode;

            return (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {itemImageUrl ? (
                    <div className="w-16 h-20 bg-stone-100 border border-brand-border shrink-0 relative overflow-hidden rounded-xs">
                      <Image
                        src={itemImageUrl}
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
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-stone-500">
                        {item.variantInfo}
                      </span>
                      {skuCode && (
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1 py-0.5 rounded-xs border border-stone-200">
                          {skuCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[11px] font-mono text-stone-500">
                        ฿{Number(item.unitPrice).toLocaleString()} x {item.quantity}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedSnapshotItem(item)}
                        className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-brown hover:text-brand-brown/80 underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        <FileText size={11} className="text-brand-brown" />
                        <span>{t('orderDetail.viewSnapshotBtn')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-sm text-stone-900">
                    ฿{Number(item.subtotal).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
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

      {/* Product Snapshot Details Modal */}
      {selectedSnapshotItem && (
        <CustomerOrderItemSnapshotModal
          item={selectedSnapshotItem}
          onClose={() => setSelectedSnapshotItem(null)}
        />
      )}
    </div>
  );
}
