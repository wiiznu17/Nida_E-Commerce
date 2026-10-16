import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder } from '@repo/types';

interface PaymentSuccessReceiptProps {
  order: ApiOrder | null;
  displayOrderNumber: string;
}

export function PaymentSuccessReceipt({
  order,
  displayOrderNumber,
}: PaymentSuccessReceiptProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
          <CheckCircle2 size={36} strokeWidth={2.2} />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-brown mb-2">
        {t('orderSuccess.paymentSuccessTitle')}
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-medium">
        {t('orderSuccess.paymentSuccessDesc')}
      </p>

      {/* Order Number & Status Box */}
      <div className="border border-brand-border bg-brand-warm-cream p-5 mb-6 text-left sm:text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
          {t('orderSuccess.orderNumberLabel')}
        </p>
        <p className="text-2xl font-black font-mono text-brand-brown tracking-wider">
          #{displayOrderNumber}
        </p>
        <div className="mt-2 flex items-center justify-start sm:justify-center space-x-2 text-xs text-emerald-800 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>{t('orderSuccess.orderPaidStatus')}</span>
        </div>
      </div>

      {/* Real Items Summary */}
      {order && order.items && order.items.length > 0 && (
        <div className="mb-6 border border-gray-200 p-4 text-left">
          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">
            {t('orderSuccess.itemsOrdered')} ({order.items.length})
          </p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="truncate mr-2">
                  <p className="font-bold text-brand-brown truncate">{item.productName}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.variantInfo} • จำนวน: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-brand-brown shrink-0 font-mono">
                  ฿{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-black text-sm text-brand-brown">
            <span>{t('orderSuccess.totalAmount')}</span>
            <span className="font-mono text-base">
              ฿{Number(order.totalAmount).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col space-y-3">
        <Link
          href={`/track-order/${encodeURIComponent(displayOrderNumber)}`}
          className="w-full bg-brand-brown hover:bg-brand-amber text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-2xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Package size={16} />
          <span>{t('orderSuccess.trackOrder')}</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.2em] text-brand-brown hover:text-brand-amber border border-gray-300 hover:border-brand-brown transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <ShoppingBag size={16} />
          <span>{t('orderSuccess.continueShopping')}</span>
        </Link>
      </div>
    </div>
  );
}
