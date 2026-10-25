'use client';

import React, { useState } from 'react';
import { Star, Tag, Copy, Check } from 'lucide-react';
import { ProductBadge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiProduct, ApiProductDetail } from '@repo/types';

interface ProductInfoProps {
  product: ApiProduct | ApiProductDetail;
  title: string;
  subCategory: string;
  displayPrice: number;
  displayOriginalPrice?: number;
}

export function ProductInfo({
  product,
  title,
  subCategory,
  displayPrice,
  displayOriginalPrice,
}: ProductInfoProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('NIDA20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasDiscount =
    displayOriginalPrice !== undefined && displayOriginalPrice > displayPrice;
  const savePercent = hasDiscount
    ? Math.round(
        ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100,
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Brand Flag & Category */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="flex w-10 h-1.5">
              <div className="w-1/3 bg-brand-brown"></div>
              <div className="w-1/3 bg-white border-y border-gray-200"></div>
              <div className="w-1/3 bg-brand-yellow"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              NIDA • {subCategory}
            </span>
          </div>
          {(product.tag || product.tagTh) && (
            <ProductBadge
              tag={product.tag}
              tagTh={product.tagTh}
              language={language}
            />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-brown">
          {title}
        </h1>

        {/* Rating Stars */}
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-600">
            {product.rating || 4.9} ({product.reviewsCount || 128}{' '}
            {isTh ? 'รีวิว' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Pricing with Strikethrough in Baht */}
      <div className="flex items-baseline space-x-3 pb-4 border-b border-gray-200">
        <span className="text-3xl font-black text-brand-brown font-mono">
          ฿{Number(displayPrice).toLocaleString()}
        </span>
        {hasDiscount && (
          <>
            <span className="text-base text-gray-400 line-through font-semibold font-mono">
              ฿{Number(displayOriginalPrice).toLocaleString()}
            </span>
            <span className="bg-brand-amber text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs">
              {isTh ? 'ประหยัด ' : 'SAVE '}
              {savePercent}%
            </span>
          </>
        )}
      </div>

      {/* Special Promo Callout Box */}
      <div className="bg-brand-warm-cream border border-brand-border p-3.5 rounded-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 min-w-0">
          <Tag size={15} className="text-brand-amber shrink-0" />
          <span className="text-brand-brown font-bold truncate">
            {isTh
              ? 'ลดเพิ่ม 20% ด้วยโค้ดส่วนลด: '
              : 'Extra 20% off with promo code: '}
            <strong className="text-brand-amber font-mono font-black ml-1">NIDA20</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className={`shrink-0 inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-xs transition-colors cursor-pointer border ${
            copied
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-brand-border text-brand-brown hover:bg-stone-50 hover:border-brand-brown'
          }`}
          title={copied ? t('product.copied') : t('product.copyCode')}
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-600" />
              <span>{t('product.copied')}</span>
            </>
          ) : (
            <>
              <Copy size={12} className="text-stone-500" />
              <span>{t('product.copyCode')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
