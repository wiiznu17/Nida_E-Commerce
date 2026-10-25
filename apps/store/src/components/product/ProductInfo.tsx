import React from 'react';
import { Star } from 'lucide-react';
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
  const { language } = useLanguage();
  const isTh = language === 'th';

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
    </div>
  );
}
