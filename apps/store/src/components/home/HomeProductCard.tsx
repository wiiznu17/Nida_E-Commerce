'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import type { ApiProduct } from '@repo/types';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
} from '@/context/LanguageContext';
import { ProductBadge } from '@/components/ui';
import { formatPrice } from '@/utils';

export interface HomeProductCardProps {
  product: ApiProduct;
  isWish: boolean;
  isJustAdded: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickAdd: (e: React.MouseEvent, product: ApiProduct) => void;
}

export const HomeProductCard: React.FC<HomeProductCardProps> = ({
  product,
  isWish,
  isJustAdded,
  onToggleWishlist,
  onQuickAdd,
}) => {
  const { language, t } = useLanguage();
  const title = getProductTitle(product, language);
  const subCategory = getProductSubCategory(product, language);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.basePrice
      ? Math.round(
          ((product.originalPrice - product.basePrice) / product.originalPrice) *
            100,
        )
      : 0;

  const productHref = `/product/${product.slug}`;
  const displayImage = product.primaryImage ?? '';

  return (
    <div className="group flex flex-col bg-white relative">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] bg-brand-warm-cream overflow-hidden mb-4 border border-gray-100">
        <Link href={productHref} className="block w-full h-full">
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Marketing Badge */}
        {(product.tag || product.tagTh) && (
          <div className="absolute top-3 left-3 z-10">
            <ProductBadge
              tag={product.tag}
              tagTh={product.tagTh}
              language={language}
            />
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-brand-brown rounded-full shadow-xs transition-colors hover:text-brand-amber cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart
            size={16}
            className={isWish ? 'fill-brand-amber text-brand-amber' : ''}
          />
        </button>

        {/* Quick Add Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => onQuickAdd(e, product)}
            disabled={isJustAdded}
            className={`w-full py-3 font-black text-xs uppercase tracking-widest transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer ${
              isJustAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-brown hover:bg-brand-amber text-white'
            }`}
          >
            {isJustAdded ? (
              <>
                <Check size={14} />
                <span>{t('home.addedToBag')}</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>{t('home.quickAdd')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Swatch dots */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex items-center space-x-1.5 mb-2">
          {product.colors.map((color, cIdx) => (
            <span
              key={cIdx}
              className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-2xs"
              style={{ backgroundColor: color.hex }}
              title={language === 'th' && color.nameTh ? color.nameTh : color.name}
            />
          ))}
          <span className="text-[10px] text-gray-400 font-medium ml-1">
            {product.colors.length} {t('home.colorsCount')}
          </span>
        </div>
      )}

      {/* Subcategory & Title */}
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {subCategory}
      </span>

      <Link
        href={productHref}
        className="font-bold text-sm text-brand-brown group-hover:text-brand-amber transition-colors line-clamp-1 mb-2"
      >
        {title}
      </Link>

      {/* Price Display */}
      <div className="mt-auto flex items-center space-x-2">
        <span className="font-black text-base text-brand-brown">
          {formatPrice(product.basePrice)}
        </span>
        {product.originalPrice && product.originalPrice > product.basePrice && (
          <span className="text-xs text-gray-400 line-through font-semibold">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="text-[10px] font-black text-brand-amber uppercase">
            {discountPercent}% OFF
          </span>
        )}
      </div>
    </div>
  );
};
