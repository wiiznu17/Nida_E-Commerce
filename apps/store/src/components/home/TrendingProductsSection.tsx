'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { useLanguage } from '@/context/LanguageContext';
import { findMarketingTagByLabel } from '@repo/types';
import type { ApiProduct } from '@repo/types';
import { HomeProductCard } from './HomeProductCard';

interface TagTabItem {
  id: string;
  label: string;
}

export const TrendingProductsSection: React.FC = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { productsList } = useCatalog();
  const { t, language } = useLanguage();

  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  // Dynamically extract active marketing tags with at least 1 product (strictly no generic 'all' tab)
  const tabs = useMemo<TagTabItem[]>(() => {
    const list: TagTabItem[] = [];
    const tagCounts = new Map<string, { count: number; label: string; id: string }>();

    productsList.forEach((p) => {
      const raw = p.tag ?? p.tagTh;
      if (!raw) return;
      const preset = findMarketingTagByLabel(raw);
      const tagId = preset ? preset.key : raw.trim();
      const normKey = tagId.toUpperCase().replace(/[-_ ]/g, '');

      const label = preset
        ? language === 'th'
          ? preset.labelTh
          : preset.labelEn
        : language === 'th'
          ? (p.tagTh ?? raw)
          : raw;

      const existing = tagCounts.get(normKey);
      if (existing) {
        existing.count += 1;
      } else {
        tagCounts.set(normKey, { count: 1, label, id: tagId });
      }
    });

    // Prioritize TRENDING first if present, then sort by product count descending
    const sorted = Array.from(tagCounts.values())
      .sort((a, b) => {
        if (a.id === 'TRENDING') return -1;
        if (b.id === 'TRENDING') return 1;
        return b.count - a.count;
      })
      .slice(0, 5);

    sorted.forEach((item) => {
      list.push({ id: item.id, label: item.label });
    });

    return list;
  }, [productsList, language]);

  // Default active tab to the first marketing tag (e.g. TRENDING)
  const activeTab = selectedTab ?? tabs[0]?.id ?? '';

  // Filter products for trending section from live catalog based on active tag
  const trendingProducts = useMemo(() => {
    if (!activeTab) return [];
    const target = activeTab.toUpperCase().replace(/[-_ ]/g, '');
    return productsList
      .filter((p) => {
        const raw = p.tag ?? p.tagTh;
        if (!raw) return false;
        const preset = findMarketingTagByLabel(raw);
        const pKey = (preset ? preset.key : raw).toUpperCase().replace(/[-_ ]/g, '');
        return pKey === target || pKey.includes(target) || target.includes(pKey);
      })
      .slice(0, 8);
  }, [productsList, activeTab]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
      {/* Section Header & Tag Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-black tracking-[0.25em] text-brand-amber uppercase block mb-1">
            {t('home.dontMissOut')}
          </span>
          <h2 className="text-3xl font-black text-brand-brown uppercase tracking-tight">
            {t('home.trendingTitle')}
          </h2>
        </div>

        {/* Marketing Tag Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`text-xs font-black uppercase tracking-wider px-4 py-2 border transition-all whitespace-nowrap cursor-pointer rounded-xs ${
                activeTab === tab.id
                  ? 'bg-brand-brown text-white border-brand-brown shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-brown hover:text-brand-brown'
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
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
          />
        ))}
      </div>

      {/* View All CTA */}
      <div className="text-center mt-12">
        <Link
          href="/search"
          className="inline-flex items-center border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white px-8 py-3.5 font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
        >
          {t('home.viewAllProducts')} ({productsList.length}){' '}
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </section>
  );
};
