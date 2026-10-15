'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, ShoppingBag, Loader2 } from 'lucide-react';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getOrderDetail } from '@/lib/customerApi';
import type { ApiOrder } from '@repo/types';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderNumber = searchParams.get('orderNumber') || 'ORD-20261015-DEMO';
  const { token } = useAuth();
  const { language, t } = useLanguage();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (rawOrderNumber && !rawOrderNumber.includes('DEMO')) {
      setIsLoading(true);
      getOrderDetail(rawOrderNumber, token)
        .then((data) => setOrder(data))
        .catch(() => {
          // If not found or guest, keep fallback display
        })
        .finally(() => setIsLoading(false));
    }
  }, [rawOrderNumber, token]);

  const displayOrderNumber = order?.orderNumber || rawOrderNumber;

  return (
    <div className="max-w-xl w-full bg-white border border-brand-border p-8 sm:p-10 text-center shadow-sm">
      {/* Nida Flag Ribbon */}
      <div className="flex w-16 h-2 mx-auto mb-6">
        <div className="w-1/3 bg-brand-brown"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-brand-yellow"></div>
      </div>

      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-brown mb-2">
        {t('orderSuccess.title')}
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-medium">
        {t('orderSuccess.thankYou')}
      </p>

      {/* Order Number Box */}
      <div className="border border-brand-border bg-brand-warm-cream p-5 mb-6 text-left sm:text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
          {t('orderSuccess.orderNumberLabel')}
        </p>
        <p className="text-2xl font-black font-mono text-brand-brown tracking-wider">
          #{displayOrderNumber}
        </p>
        <p className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center justify-start sm:justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 inline-block"></span>
          {order?.status ? `สถานะ: ${order.status}` : t('orderSuccess.status')}
        </p>
      </div>

      {/* Real Items Summary (if fetched from API) */}
      {order && order.items && order.items.length > 0 && (
        <div className="mb-6 border border-gray-200 p-4 text-left">
          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">
            รายการสินค้าที่สั่งซื้อ ({order.items.length} รายการ)
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
                <span className="font-bold text-brand-brown shrink-0">
                  ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-black text-sm text-brand-brown">
            <span>ยอดชำระสุทธิ</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <Link
          href={`/track-order/${encodeURIComponent(displayOrderNumber)}`}
          className="w-full bg-brand-brown hover:bg-brand-amber text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2"
        >
          <Package size={16} />
          <span>{t('orderSuccess.trackOrder')}</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.2em] text-brand-brown hover:text-brand-amber border border-gray-300 hover:border-brand-brown transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingBag size={16} />
          <span>{t('orderSuccess.continueShopping')}</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense
        fallback={
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-brand-brown" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
