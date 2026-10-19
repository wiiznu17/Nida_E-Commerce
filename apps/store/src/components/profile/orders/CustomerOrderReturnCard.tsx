'use client';

import React, { useState } from 'react';
import {
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Truck,
  MapPin,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatOrderDateTime, formatPrice } from '@/utils';
import { ReturnShipmentModal } from './ReturnShipmentModal';
import type { ApiOrder, ApiReturnRequest } from '@repo/types';

interface CustomerOrderReturnCardProps {
  order: ApiOrder;
  onOrderUpdate?: (updatedOrder: ApiOrder) => void;
  showToast?: (msg: string) => void;
}

export function CustomerOrderReturnCard({
  order,
  onOrderUpdate,
  showToast,
}: CustomerOrderReturnCardProps) {
  const { t, language, isTh } = useLanguage();
  const returnRequests = order.returnRequests ?? [];
  const [activeShipmentReq, setActiveShipmentReq] =
    useState<ApiReturnRequest | null>(null);

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
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3" />
            <span>{t('orderDetail.returnCard.shippedBadge')}</span>
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
    <>
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
          {returnRequests.map((req) => {

            return (
              <div
                key={req.id}
                className="p-4 border border-brand-border/70 rounded-xs bg-stone-50/50 space-y-3.5 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-stone-900">
                      {req.requestNumber}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {formatOrderDateTime(req.createdAt, language)}
                    </span>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {/* Reason & Customer Note */}
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

                {/* Returned Items */}
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

                {/* Return Instructions & Warehouse Box (when APPROVED) */}
                {req.status === 'APPROVED' && (
                  <div className="pt-2 border-t border-blue-200/60 space-y-3">
                    {/* Warehouse Address Snapshot */}
                    <div className="p-3 bg-white border border-blue-200 rounded-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-blue-900">
                        <MapPin size={12} className="text-blue-700 shrink-0" />
                        <span>{t('orderDetail.returnCard.warehouseTitle')}</span>
                      </div>
                      <p className="font-bold text-stone-900 text-xs">
                        {t('orderDetail.returnCard.warehouseName')}
                      </p>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        {t('orderDetail.returnCard.warehouseAddress')}
                      </p>
                    </div>

                    {/* Policy Notice Card */}
                    <div className="p-2.5 rounded-xs border border-blue-200 bg-blue-50/70 text-blue-900 text-[11px] leading-relaxed flex items-start space-x-2">
                      <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">
                          {t('orderDetail.returnCard.shipmentNotice')}
                        </p>
                        <p className="mt-0.5">
                          {t('orderDetail.returnCard.shippingCoverNotice')}
                        </p>
                      </div>
                    </div>

                    {/* Action Button to Open Submit Modal */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveShipmentReq(req)}
                        className="px-4 py-2 bg-[#2B1810] hover:bg-[#3D2317] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                      >
                        <Truck size={14} />
                        <span>{t('orderDetail.returnCard.submitShipmentBtn')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Shipped & In-Transit Tracking Display (when SHIPPED) */}
                {req.status === 'SHIPPED' && (
                  <div className="pt-2 border-t border-purple-200/60 space-y-2.5">
                    <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-purple-700 shrink-0" />
                          <span className="font-bold text-stone-900">
                            {req.returnCarrier ?? 'Courier'}
                          </span>
                          <span className="font-mono font-bold text-purple-900 bg-white px-2 py-0.5 rounded-xs border border-purple-200 text-[11px]">
                            {req.returnTrackingNumber}
                          </span>
                        </div>

                        {req.returnShippingFee !== undefined && req.returnShippingFee > 0 && (
                          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-stone-700 bg-white px-2 py-0.5 rounded-xs border border-stone-200">
                            <Receipt size={12} className="text-emerald-700" />
                            <span>
                              {t('orderDetail.returnCard.reimbursementClaim')}:
                            </span>
                            <span className="font-mono text-emerald-800">
                              {formatPrice(req.returnShippingFee)}
                            </span>
                          </div>
                        )}
                      </div>

                      {req.returnShippingReceiptUrl && (
                        <div className="pt-1 border-t border-purple-200/40">
                          <a
                            href={req.returnShippingReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] font-semibold text-purple-800 hover:text-purple-950 hover:underline"
                          >
                            <span>{t('orderDetail.returnCard.receiptUrlLabel')}</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      )}

                      <p className="text-[11px] text-purple-900/90 leading-relaxed pt-1">
                        {t('orderDetail.returnCard.inTransitNotice')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Completed Notice */}
                {req.status === 'COMPLETED' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xs text-[11px] text-emerald-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{t('orderDetail.returnCard.inspectRefundNotice')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment Modal */}
      {activeShipmentReq && (
        <ReturnShipmentModal
          isOpen={!!activeShipmentReq}
          onClose={() => setActiveShipmentReq(null)}
          orderNumber={order.orderNumber}
          returnRequest={activeShipmentReq}
          onSuccess={(updatedOrder) => {
            showToast?.(t('orderDetail.returnCard.submitShipmentSuccess'));
            onOrderUpdate?.(updatedOrder);
          }}
        />
      )}
    </>
  );
}
