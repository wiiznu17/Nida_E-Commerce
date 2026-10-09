'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  ShieldCheck,
  Star,
  Sparkles,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import type { Product } from '@/data/products';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
  getProductTag,
} from '@/context/LanguageContext';

export default function HomePage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { productsList } = useCatalog();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'women' | 'men' | 'bags'>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Filter products for trending section from live catalog
  const trendingProducts = productsList
    .filter((p) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'women') return p.department === 'women';
      if (activeTab === 'men') return p.department === 'men';
      if (activeTab === 'bags') return p.department === 'bags' || p.department === 'shoes';
      return true;
    })
    .slice(0, 8);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize =
      product.department === 'shoes'
        ? 'US 9'
        : product.category === 'bags' || product.category === 'home'
          ? 'One Size'
          : 'M';
    const defaultColor = product.colors && product.colors.length > 0 ? 'Navy / Classic' : 'Standard';
    addToCart(product, defaultSize, defaultColor);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('NIDA20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="w-full bg-white font-sans">
      {/* 1. HERO CAMPAIGN BILLBOARD */}
      <div className="relative w-full min-h-[580px] lg:min-h-[720px] bg-[#2B1810] flex items-center overflow-hidden">
        {/* Background Image with subtle editorial zoom */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2200&q=85"
            alt="Nida Modern Heritage Campaign"
            className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810] via-[#2B1810]/40 to-transparent lg:bg-gradient-to-r lg:from-[#2B1810]/90 lg:via-[#2B1810]/50 lg:to-transparent"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
          <div className="max-w-2xl text-white">
            {/* Tag / Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#F59E0B] text-[#2B1810] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles size={13} className="text-[#2B1810]" />
              <span>{t('home.heroTag')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] mb-6">
              {t('home.heroTitle1')}
              <br />
              {t('home.heroTitle2')}
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed mb-8 max-w-xl">
              {t('home.heroDesc')}
            </p>

            {/* Multi CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/collections/women"
                className="bg-white hover:bg-gray-100 text-[#2B1810] px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] text-center"
              >
                {t('home.shopWomen')}
              </Link>
              <Link
                href="/collections/men"
                className="bg-[#2B1810] hover:bg-[#D97706] border-2 border-white text-white px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg text-center"
              >
                {t('home.shopMen')}
              </Link>
              <Link
                href="/collections/sale"
                className="bg-[#F59E0B] hover:bg-[#D97706] text-[#2B1810] px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg text-center"
              >
                {t('home.shopSale')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VALUE PROPOSITIONS STRIP */}
      <div className="bg-[#FAF7F2] border-y border-[#EAE3D9] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <div className="p-2.5 bg-white text-[#2B1810] rounded-xs border border-gray-200">
              <Truck size={20} className="text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('home.freeShippingTitle')}
              </h4>
              <p className="text-[11px] text-gray-500">{t('home.freeShippingSub')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <div className="p-2.5 bg-white text-[#2B1810] rounded-xs border border-gray-200">
              <RefreshCw size={20} className="text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('home.returnsTitle')}
              </h4>
              <p className="text-[11px] text-gray-500">{t('home.returnsSub')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <div className="p-2.5 bg-white text-[#2B1810] rounded-xs border border-gray-200">
              <ShieldCheck size={20} className="text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('home.guaranteeTitle')}
              </h4>
              <p className="text-[11px] text-gray-500">{t('home.guaranteeSub')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <div className="p-2.5 bg-white text-[#2B1810] rounded-xs border border-gray-200">
              <Star size={20} className="text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('home.perksTitle')}
              </h4>
              <p className="text-[11px] text-gray-500">{t('home.perksSub')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SPLIT EDITORIAL BENTO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-black tracking-[0.25em] text-[#D97706] uppercase block mb-2">
            {t('home.curatedStories')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2B1810] uppercase tracking-tight">
            {t('home.seasonalSpotlight')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Story Card 1: Women's Outerwear */}
          <div className="relative group overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[16/12]">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Women's New Season"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/90 via-[#2B1810]/30 to-transparent flex flex-col justify-end p-8 sm:p-10">
              <span className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase mb-2">
                {t('home.storyWomenTag')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
                {t('home.storyWomenTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 mb-6 max-w-md line-clamp-2">
                {t('home.storyWomenDesc')}
              </p>
              <div>
                <Link
                  href="/collections/women"
                  className="inline-flex items-center bg-white text-[#2B1810] hover:bg-[#F59E0B] hover:text-[#2B1810] px-6 py-3 font-black text-xs tracking-widest uppercase transition-all shadow-md"
                >
                  {t('home.discoverWomen')} <ArrowRight size={14} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Story Card 2: Men's Collegiate & Polos */}
          <div className="relative group overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[16/12]">
            <img
              src="https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Men's New Season"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/90 via-[#2B1810]/30 to-transparent flex flex-col justify-end p-8 sm:p-10">
              <span className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase mb-2">
                {t('home.storyMenTag')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
                {t('home.storyMenTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 mb-6 max-w-md line-clamp-2">
                {t('home.storyMenDesc')}
              </p>
              <div>
                <Link
                  href="/collections/men"
                  className="inline-flex items-center bg-white text-[#2B1810] hover:bg-[#F59E0B] hover:text-[#2B1810] px-6 py-3 font-black text-xs tracking-widest uppercase transition-all shadow-md"
                >
                  {t('home.discoverMen')} <ArrowRight size={14} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PROMO CALLOUT RIBBON (EXTRA 20% OFF WITH CODE NIDA20) */}
      <div className="bg-[#2B1810] text-white py-8 border-y-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="inline-block bg-[#F59E0B] text-[#2B1810] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-2">
              {t('home.promoRibbonTag')}
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              {t('home.promoRibbonTitle')}
            </h3>
            <p className="text-xs text-gray-300">{t('home.promoRibbonDesc')}</p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-xs border border-white/20">
            <span className="font-mono text-lg font-black tracking-widest px-3 text-white">NIDA20</span>
            <button
              onClick={handleCopyCode}
              className="bg-white text-[#2B1810] hover:bg-[#F59E0B] hover:text-[#2B1810] font-black text-xs uppercase tracking-wider px-4 py-2 transition-colors flex items-center"
            >
              {copiedCode ? (
                <>
                  <Check size={14} className="mr-1 text-emerald-600" /> {t('home.copied')}
                </>
              ) : (
                t('home.copyCode')
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. TRENDING PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
            {[
              { id: 'all', label: t('home.tabAll') },
              { id: 'women', label: t('home.tabWomen') },
              { id: 'men', label: t('home.tabMen') },
              { id: 'bags', label: t('home.tabBags') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 border transition-all whitespace-nowrap ${
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
          {trendingProducts.map((product) => {
            const isWish = isInWishlist(product.id);
            const isJustAdded = addedProductId === product.id;
            const title = getProductTitle(product, language);
            const subCategory = getProductSubCategory(product, language);
            const tag = getProductTag(product, language) || product.tag;

            return (
              <div key={product.id} className="group flex flex-col bg-white relative">
                {/* Product Image Container */}
                <div className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden mb-4 border border-gray-100">
                  <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <img
                      src={product.image}
                      alt={title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </Link>

                  {/* Badge */}
                  {tag && (
                    <div className="absolute top-3 left-3 bg-[#2B1810] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-xs">
                      {tag}
                    </div>
                  )}

                  {/* Wishlist Heart Toggle */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#2B1810] rounded-full shadow-xs transition-colors hover:text-[#D97706]"
                    aria-label="Save to wishlist"
                  >
                    <Heart size={16} className={isWish ? 'fill-[#D97706] text-[#D97706]' : ''} />
                  </button>

                  {/* Quick Add Button on Hover */}
                  <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      disabled={isJustAdded}
                      className={`w-full py-3 font-black text-xs uppercase tracking-widest transition-colors shadow-md flex items-center justify-center space-x-2 ${
                        isJustAdded ? 'bg-emerald-600 text-white' : 'bg-[#2B1810] hover:bg-[#D97706] text-white'
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
                      {product.colors.length} {language === 'th' ? 'สี' : 'colors'}
                    </span>
                  </div>
                )}

                {/* Title and Category */}
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  {subCategory}
                </span>

                <Link
                  href={`/product/${product.id}`}
                  className="font-bold text-sm text-[#2B1810] group-hover:text-[#D97706] transition-colors line-clamp-1 mb-2"
                >
                  {title}
                </Link>

                {/* Price Display with Strikethrough for Sales */}
                <div className="mt-auto flex items-center space-x-2">
                  <span className="font-black text-base text-[#2B1810]">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through font-semibold">${product.originalPrice}</span>
                  )}
                  {product.originalPrice && (
                    <span className="text-[10px] font-black text-[#D97706] uppercase">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/collections/all"
            className="inline-flex items-center border-2 border-[#2B1810] text-[#2B1810] hover:bg-[#2B1810] hover:text-white px-8 py-3.5 font-black text-xs uppercase tracking-[0.2em] transition-all"
          >
            {t('home.viewAllProducts')} ({productsList.length}) <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* 6. CATEGORY DISCOVERY TILES */}
      <div className="bg-[#FAF7F2] py-20 border-t border-[#EAE3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-[0.25em] text-[#D97706] uppercase block mb-2">
              {t('home.discoverDept')}
            </span>
            <h2 className="text-3xl font-black text-[#2B1810] uppercase tracking-tight">
              {t('home.essentialCategories')}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link
              href="/collections/women"
              className="group block bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Sweaters & Knits"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {language === 'th' ? 'สเวตเตอร์และเสื้อไหมพรม' : 'SWEATERS & KNITS'}
                  </span>
                  <span className="text-white/80 text-xs flex items-center mt-1 font-semibold group-hover:text-white">
                    {language === 'th' ? 'เลือกชม' : 'Shop Now'}{' '}
                    <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/collections/men"
              className="group block bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1625910513413-568b209a3c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Polos & Shirts"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {language === 'th' ? 'เสื้อโปโลเฮอริเทจ' : 'HERITAGE POLOS'}
                  </span>
                  <span className="text-white/80 text-xs flex items-center mt-1 font-semibold group-hover:text-white">
                    {language === 'th' ? 'เลือกชม' : 'Shop Now'}{' '}
                    <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/collections/bags"
              className="group block bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Leather Bags"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {language === 'th' ? 'กระเป๋าหนังและเข็มขัด' : 'LEATHER BAGS & BELTS'}
                  </span>
                  <span className="text-white/80 text-xs flex items-center mt-1 font-semibold group-hover:text-white">
                    {language === 'th' ? 'เลือกชม' : 'Shop Now'}{' '}
                    <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/collections/shoes"
              className="group block bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Court Footwear"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {language === 'th' ? 'รองเท้าและสนีกเกอร์' : 'FOOTWEAR & SNEAKERS'}
                  </span>
                  <span className="text-white/80 text-xs flex items-center mt-1 font-semibold group-hover:text-white">
                    {language === 'th' ? 'เลือกชม' : 'Shop Now'}{' '}
                    <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 7. EDITORIAL BRAND STORY BANNER */}
      <div className="relative bg-[#2B1810] text-white py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="flex w-16 h-2">
              <div className="w-1/3 bg-[#2B1810]"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-[#F59E0B]"></div>
            </div>
          </div>
          <span className="text-xs font-black tracking-[0.3em] uppercase text-[#F59E0B] block mb-4">
            {t('home.heritageTag')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6">
            {t('home.heritageTitle1')}
            <br />
            {t('home.heritageTitle2')}
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            {t('home.heritageDesc')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/about"
              className="bg-white hover:bg-gray-100 text-[#2B1810] px-8 py-4 font-black text-xs uppercase tracking-[0.2em] transition-colors"
            >
              {t('home.readOurStory')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
