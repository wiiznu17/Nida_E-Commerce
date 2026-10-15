'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
} from '@/context/LanguageContext';
import { ProductBadge } from '@/components/ui';
import type { ApiProduct } from '@repo/types';
import type { CatalogProductGridProps } from './catalogTypes';

export function CatalogProductGrid({
  products,
  isFilterVisible,
  onAddToCart,
}: CatalogProductGridProps) {
  const { language, t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleQuickAdd = (e: React.MouseEvent, product: ApiProduct) => {
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
        isFilterVisible ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      } gap-x-5 gap-y-10 transition-all duration-300`}
    >
      {products.map((product) => {
        const isWish = isInWishlist(product.id);
        const isJustAdded = addedProductId === product.id;
        const title = getProductTitle(product, language);
        const subCategory = getProductSubCategory(product, language);
        const productHref = `/product/${product.slug || product.id}`;
        const displayImage = product.primaryImage || '';

        return (
          <div
            key={product.id}
            className="group flex flex-col bg-white relative text-left"
          >
            {/* Product Image Frame */}
            <div className="relative aspect-[3/4] bg-brand-warm-cream overflow-hidden mb-3 border border-gray-100 rounded-sm">
              <Link href={productHref} className="block w-full h-full">
                <img
                  src={displayImage}
                  alt={title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </Link>

              {/* Tag Badge */}
              {(product.tag || product.tagTh) && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <ProductBadge
                    tag={product.tag}
                    tagTh={product.tagTh}
                    language={language}
                  />
                </div>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-brand-brown rounded-full shadow-xs transition-colors hover:text-brand-amber cursor-pointer"
                aria-label="Save to wishlist"
              >
                <Heart
                  size={16}
                  className={isWish ? 'fill-brand-amber text-brand-amber' : ''}
                />
              </button>

              {/* Quick Add Overlay */}
              <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, product)}
                  disabled={isJustAdded}
                  className={`w-full py-2.5 font-black text-[11px] uppercase tracking-widest transition-colors shadow-md flex items-center justify-center space-x-1.5 rounded-xs cursor-pointer ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-brown hover:bg-brand-amber text-white'
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

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-1 mb-1.5">
                {product.colors.slice(0, 5).map((color, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full border border-gray-300 inline-block shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                    title={language === 'th' && color.nameTh ? color.nameTh : color.name}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[10px] text-gray-400 font-medium ml-1">
                    +{product.colors.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Micro Category Breadcrumb */}
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
              {subCategory}
            </span>

            {/* Title */}
            <Link
              href={productHref}
              className="text-xs font-bold text-brand-brown group-hover:text-brand-amber transition-colors line-clamp-1"
            >
              {title}
            </Link>

            {/* Price */}
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-brown">
                ${product.basePrice}
              </span>
              {product.originalPrice && product.originalPrice > product.basePrice && (
                <span className="text-[11px] text-gray-400 line-through">
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
