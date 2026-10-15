'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import type { StorefrontProduct } from '@repo/types';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, wishlistCount } = useWishlist();
  const { productsList, isLoading } = useCatalog();
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  const [addedId, setAddedId] = useState<string | null>(null);

  // Match saved IDs or slugs to active catalog products
  const wishlistProducts = useMemo(() => {
    return productsList.filter(
      (product) => wishlist.includes(product.id) || wishlist.includes(product.slug)
    );
  }, [productsList, wishlist]);

  const handleQuickAdd = (product: StorefrontProduct) => {
    const defaultSize =
      product.department === 'shoes'
        ? 'US 9'
        : product.category === 'bags' || product.category === 'home'
          ? 'One Size'
          : 'M';
    const defaultColor = product.colors?.[0] ?? '#2B1810';

    addToCart(product, defaultSize, defaultColor);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Editorial Luxury Header Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D9] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#D97706] bg-[#D97706]/10 px-3 py-1 rounded-full inline-block mb-3">
            NIDA CURATED
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-[#2B1810] tracking-tight">
            {t('wishlistPage.title')}
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-2 max-w-xl mx-auto leading-relaxed">
            {t('wishlistPage.subtitle')}
          </p>
          {wishlistProducts.length > 0 && (
            <div className="mt-4">
              <span className="inline-flex items-center text-xs font-bold text-[#2B1810] bg-white border border-[#EAE3D9] px-3.5 py-1.5 rounded-full shadow-xs">
                <Heart size={14} className="mr-1.5 text-[#D97706] fill-[#D97706]" />
                {wishlistProducts.length}{' '}
                {wishlistProducts.length === 1
                  ? t('wishlistPage.itemCount')
                  : t('wishlistPage.itemsCount')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-[#FAF7F2]/60 border border-[#EAE3D9] rounded-2xl p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-white border border-[#EAE3D9] flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Heart size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-black uppercase text-[#2B1810] tracking-tight">
              {t('wishlistPage.emptyTitle')}
            </h2>
            <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              {t('wishlistPage.emptyDesc')}
            </p>
            <div className="mt-6">
              <Link
                href="/collections/all"
                className="inline-flex items-center justify-center bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 hover:bg-[#D97706] transition-colors"
              >
                <span>{t('wishlistPage.exploreCatalog')}</span>
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => {
              const isAdded = addedId === product.id;
              const title =
                language === 'th' && product.nameTh ? product.nameTh : product.name;
              const subCategoryName =
                language === 'th' && product.subCategoryTh
                  ? product.subCategoryTh
                  : (product.subCategory ?? product.category);

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-white border border-[#EAE3D9] hover:border-[#2B1810] transition-colors"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-[#EAE3D9] text-gray-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    title={t('wishlistPage.remove')}
                    aria-label={t('wishlistPage.remove')}
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Image Container */}
                  <Link
                    href={`/product/${product.id}`}
                    className="relative aspect-[3/4] overflow-hidden bg-gray-50 block"
                  >
                    <img
                      src={product.image}
                      alt={title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-1">
                        {subCategoryName}
                      </span>
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs sm:text-sm font-bold text-[#2B1810] group-hover:text-[#D97706] transition-colors line-clamp-1 block mb-2"
                      >
                        {title}
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-[#EAE3D9]/60">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-black text-[#2B1810]">
                          ${product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Add to Bag Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className={`w-full py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isAdded
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#2B1810] text-white hover:bg-[#D97706]'
                        }`}
                      >
                        <ShoppingBag size={13} />
                        <span>
                          {isAdded
                            ? language === 'th'
                              ? 'เพิ่มแล้ว'
                              : 'ADDED'
                            : t('wishlistPage.addToBag')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
