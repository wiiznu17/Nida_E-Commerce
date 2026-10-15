'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
  getProductTag,
} from '@/context/LanguageContext';
import type { StorefrontProduct } from '@repo/types';
import type { CollectionProductGridProps } from './collectionTypes';

export function CollectionProductGrid({
  products,
  gridCols,
  onAddToCart,
}: CollectionProductGridProps) {
  const { language, t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleQuickAdd = (e: React.MouseEvent, product: StorefrontProduct) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      } gap-x-6 gap-y-12`}
    >
      {products.map((product) => {
        const isWish = isInWishlist(product.id);
        const isJustAdded = addedProductId === product.id;
        const title = getProductTitle(product, language);
        const subCategory = getProductSubCategory(product, language);
        const tag = getProductTag(product, language) || product.tag;

        return (
          <div
            key={product.id}
            className="group flex flex-col bg-white relative text-left"
          >
            {/* Image Card Container */}
            <div className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden mb-4 border border-gray-100 rounded-sm">
              <Link href={`/product/${product.id}`} className="block w-full h-full">
                <img
                  src={product.image}
                  alt={title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </Link>

              {/* Tag badge */}
              {tag && (
                <div className="absolute top-3 left-3 bg-[#2B1810] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-xs">
                  {tag}
                </div>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
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
                  type="button"
                  onClick={(e) => handleQuickAdd(e, product)}
                  disabled={isJustAdded}
                  className={`w-full py-3 font-black text-xs uppercase tracking-widest transition-colors shadow-md flex items-center justify-center space-x-2 rounded-xs cursor-pointer ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#2B1810] hover:bg-[#D97706] text-white'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check size={14} /> <span>{t('home.addedToBag')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} /> <span>{t('home.quickAdd')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-1.5 mb-2">
                {product.colors.slice(0, 5).map((colorHex, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-2xs"
                    style={{ backgroundColor: colorHex }}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[10px] text-gray-400 font-medium ml-1">
                    +{product.colors.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Category breadcrumb label */}
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              {subCategory}
            </span>

            {/* Product title */}
            <Link
              href={`/product/${product.id}`}
              className="text-sm font-bold text-[#2B1810] group-hover:text-[#D97706] transition-colors line-clamp-1 mb-1"
            >
              {title}
            </Link>

            {/* Pricing */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#2B1810]">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
