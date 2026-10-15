'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import type { StorefrontProduct } from '@repo/types';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
  getProductTag,
} from '@/context/LanguageContext';

export interface HomeProductCardProps {
  product: StorefrontProduct;
  isWish: boolean;
  isJustAdded: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickAdd: (e: React.MouseEvent, product: StorefrontProduct) => void;
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
  const tag = getProductTag(product, language) || product.tag;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <div className="group flex flex-col bg-white relative">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden mb-4 border border-gray-100">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Marketing Badge */}
        {tag && (
          <div className="absolute top-3 left-3 bg-[#2B1810] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-xs">
            {tag}
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#2B1810] rounded-full shadow-xs transition-colors hover:text-[#D97706] cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart
            size={16}
            className={isWish ? 'fill-[#D97706] text-[#D97706]' : ''}
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
                : 'bg-[#2B1810] hover:bg-[#D97706] text-white'
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
              style={{ backgroundColor: color }}
              title={color}
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
        href={`/product/${product.id}`}
        className="font-bold text-sm text-[#2B1810] group-hover:text-[#D97706] transition-colors line-clamp-1 mb-2"
      >
        {title}
      </Link>

      {/* Price Display */}
      <div className="mt-auto flex items-center space-x-2">
        <span className="font-black text-base text-[#2B1810]">
          ${product.price}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-xs text-gray-400 line-through font-semibold">
            ${product.originalPrice}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="text-[10px] font-black text-[#D97706] uppercase">
            {discountPercent}% OFF
          </span>
        )}
      </div>
    </div>
  );
};
