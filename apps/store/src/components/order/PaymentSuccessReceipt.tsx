'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShoppingBag,
  FileText,
  ArrowRight,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PaymentMethod, type ApiOrder } from '@repo/types';

interface PaymentSuccessReceiptProps {
  order: ApiOrder | null;
  displayOrderNumber: string;
}

export function PaymentSuccessReceipt({
  order,
  displayOrderNumber,
}: PaymentSuccessReceiptProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  const isCard =
    order?.payment?.paymentMethod === PaymentMethod.CREDIT_CARD;

  return (
    <div className="text-center space-y-6">
      {/* Success Confirmation Icon & Title */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/90 flex items-center justify-center text-emerald-600 shadow-2xs mx-auto">
          <CheckCircle2 size={34} strokeWidth={2.3} />
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-brand-brown">
          {t('orderSuccess.paymentSuccessTitle')}
        </h1>

        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed font-medium">
          {t('orderSuccess.paymentSuccessDesc')}
        </p>
      </div>

      {/* Minimal Order Summary Box */}
      <div className="bg-stone-50/80 border border-stone-200/80 p-4 sm:p-5 rounded-xs text-left space-y-3 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            {t('orderSuccess.orderNumberLabel')}
          </span>
          <span className="font-mono font-bold text-stone-900 tracking-tight">
            #{displayOrderNumber}
          </span>
        </div>

        {order && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">
                {isTh ? 'ยอดเงินที่ชำระ' : 'Amount Paid'}
              </span>
              <span className="font-mono font-black text-brand-dark-brown text-base">
                ฿{Number(order.totalAmount).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-stone-200/60">
              <span className="text-stone-500 font-medium">
                {isTh ? 'สถานะการชำระเงิน' : 'Payment Status'}
              </span>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 text-stone-600 font-mono text-[11px]">
                  {isCard ? <CreditCard size={13} /> : <QrCode size={13} />}
                  <span>
                    {isCard
                      ? isTh
                        ? 'บัตรเครดิต'
                        : 'Credit Card'
                      : 'PromptPay'}
                  </span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{isTh ? 'ชำระเรียบร้อย' : 'Paid'}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Primary & Secondary Action Buttons */}
      <div className="pt-2 space-y-2.5">
        <Link
          href={`/profile/orders/${encodeURIComponent(displayOrderNumber)}`}
          className="w-full bg-brand-brown hover:bg-brand-dark-brown text-white py-3.5 px-5 text-xs font-black uppercase tracking-[0.15em] transition-colors shadow-2xs flex items-center justify-center space-x-2 cursor-pointer text-center"
        >
          <FileText size={15} />
          <span>{t('orderSuccess.viewOrderDetail')}</span>
          <ArrowRight size={14} />
        </Link>

        <Link
          href="/"
          className="w-full py-3.5 px-5 text-xs font-black uppercase tracking-[0.15em] text-brand-brown hover:text-brand-amber border border-stone-300 hover:border-brand-brown bg-white hover:bg-stone-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer text-center shadow-2xs"
        >
          <ShoppingBag size={15} />
          <span>{t('orderSuccess.continueShopping')}</span>
        </Link>
      </div>
    </div>
  );
}
