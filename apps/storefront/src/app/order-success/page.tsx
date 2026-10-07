'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function OrderSuccessPage() {
  const [orderNumber, setOrderNumber] = useState('918274');
  const { t } = useLanguage();

  useEffect(() => {
    setOrderNumber(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-[#FAF7F2] font-sans">
      <div className="max-w-lg w-full bg-white border border-[#EAE3D9] p-8 sm:p-10 text-center shadow-sm">
        {/* Nida Flag Ribbon */}
        <div className="flex w-16 h-2 mx-auto mb-6">
          <div className="w-1/3 bg-[#2B1810]"></div>
          <div className="w-1/3 bg-white border-y border-gray-200"></div>
          <div className="w-1/3 bg-[#F59E0B]"></div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2B1810] mb-2">
          {t('orderSuccess.title')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-medium">
          {t('orderSuccess.thankYou')}
        </p>

        {/* Order Number Box */}
        <div className="border border-[#EAE3D9] bg-[#FAF7F2] p-4 mb-8">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
            {t('orderSuccess.orderNumberLabel')}
          </p>
          <p className="text-2xl font-black font-mono text-[#2B1810] tracking-wider">#{orderNumber}</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">
            {t('orderSuccess.status')}
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href={`/track-order/${orderNumber}`}
            className="w-full bg-[#2B1810] hover:bg-[#D97706] text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <Package size={16} />
            <span>{t('orderSuccess.trackOrder')}</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="w-full py-3.5 text-xs font-black uppercase tracking-[0.2em] text-[#2B1810] hover:text-[#D97706] border border-gray-300 hover:border-[#2B1810] transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingBag size={16} />
            <span>{t('orderSuccess.continueShopping')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
