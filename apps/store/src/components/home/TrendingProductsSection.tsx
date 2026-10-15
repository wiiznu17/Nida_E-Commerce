'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { useLanguage } from '@/context/LanguageContext';
import type { StorefrontProduct } from '@repo/types';
import { HomeProductCard } from './HomeProductCard';

export type TrendingTab = 'all' | 'women' | 'men' | 'bags';

export const TrendingProductsSection: React.FC = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { productsList } = useCatalog();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TrendingTab>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Filter products for trending section from live catalog
  const trendingProducts = productsList
    .filter((p) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'women') return p.department === 'women';
      if (activeTab === 'men') return p.department === 'men';
      if (activeTab === 'bags')
        return p.department === 'bags' || p.department === 'shoes';
      return true;
    })
    .slice(0, 8);

  const handleQuickAdd = (e: React.MouseEvent, product: StorefrontProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize =
      product.department === 'shoes'
        ? 'US 9'
        : product.category === 'bags' || product.category === 'home'
          ? 'One Size'
          : 'M';

    const defaultColor =
      product.colors && product.colors.length > 0
        ? 'Navy / Classic'
        : 'Standard';

    addToCart(product, defaultSize, defaultColor);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const tabs: Array<{ id: TrendingTab; label: string }> = [
    { id: 'all', label: t('home.tabAll') },
    { id: 'women', label: t('home.tabWomen') },
    { id: 'men', label: t('home.tabMen') },
    { id: 'bags', label: t('home.tabBags') },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Section Header & Department Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-black tracking-[0.25em] text-[#D97706] uppercase block mb-1">
            {t('home.dontMissOut')}
          </span>
          <h2 className="text-3xl font-black text-[#2B1810] uppercase tracking-tight">
            {t('home.trendingTitle')}
          </h2>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-black uppercase tracking-wider px-4 py-2 border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2B1810] text-white border-[#2B1810]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#2B1810]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {trendingProducts.map((product) => (
          <HomeProductCard
            key={product.id}
            product={product}
            isWish={isInWishlist(product.id)}
            isJustAdded={addedProductId === product.id}
            onToggleWishlist={toggleWishlist}
            onQuickAdd={handleQuickAdd}
          />
        ))}
      </div>

      {/* View All CTA */}
      <div className="text-center mt-12">
        <Link
          href="/collections/all"
          className="inline-flex items-center border-2 border-[#2B1810] text-[#2B1810] hover:bg-[#2B1810] hover:text-white px-8 py-3.5 font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
        >
          {t('home.viewAllProducts')} ({productsList.length}){' '}
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </section>
  );
};
