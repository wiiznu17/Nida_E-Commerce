'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { ChevronDown, Check, Heart, ShoppingBag, Grid3X3, LayoutGrid } from 'lucide-react';

export default function CollectionPage() {
  const params = useParams();
  const categoryParam = params?.category;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam || 'all';

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { productsList } = useCatalog();
  const { language, t } = useLanguage();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState<4 | 3>(4);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Department / Category Metadata
  const departmentInfo: Record<
    string,
    { title: string; titleTh: string; subtitle: string; subtitleTh: string; bannerTag?: string; bannerTagTh?: string; bgImage?: string }
  > = {
    women: {
      title: "WOMEN'S COLLECTION",
      titleTh: 'คอลเลกชันสำหรับผู้หญิง',
      subtitle: 'Classic prep meets modern relaxed tailoring. Sweaters, trench coats, shirts, and versatile denim.',
      subtitleTh: 'สไตล์เพรปปี้คลาสสิกผสานโครงเสื้อผ่อนคลายร่วมสมัย สเวตเตอร์ไหมพรม เทรนช์โค้ท และยีนส์อเนกประสงค์',
      bannerTag: 'AUTUMN / WINTER 2026',
      bannerTagTh: 'ฤดูใบไม้ร่วง / หนาว 2026',
      bgImage:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    men: {
      title: "MEN'S COLLECTION",
      titleTh: 'คอลเลกชันสำหรับผู้ชาย',
      subtitle: 'Heritage American cool. Iconic pique polos, oxford shirts, varsity outerwear, and tailored chinos.',
      subtitleTh: 'มรดกความเท่สไตล์อเมริกันคลาสสิก โปโลผ้าปิเก้ไอคอนิก เชิ้ตอ็อกซ์ฟอร์ด และชิโน่คัตติ้งเนี้ยบ',
      bannerTag: 'HERITAGE ICONS',
      bannerTagTh: 'เฮอริเทจไอคอน',
      bgImage:
        'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    kids: {
      title: 'KIDS & MINI PREP',
      titleTh: 'คอลเลกชันเด็ก & มินิเพรป',
      subtitle: 'Durable, comfortable, and vibrant clothing designed for young explorers and school days.',
      subtitleTh: 'เสื้อผ้าที่ทนทาน สวมใส่สบาย สีสันสดใส ออกแบบเพื่อวัยแห่งการเรียนรู้และการเล่นสนุก',
      bannerTag: 'BACK TO SCHOOL',
      bannerTagTh: 'เปิดเทอมสดใส',
      bgImage:
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    bags: {
      title: 'BAGS & LEATHER ACCESSORIES',
      titleTh: 'กระเป๋าและเครื่องหนังพรีเมียม',
      subtitle: 'Crafted with supple pebble leather, signature ribbon accents, and durable brass hardware.',
      subtitleTh: 'รังสรรค์ด้วยหนังเกรนแท้เนื้อละเอียด สายริบบิ้นสามสีเอกลักษณ์ และอะไหล่ทองเหลืองสุดประณีต',
      bannerTag: 'LEATHER WORKSHOP',
      bannerTagTh: 'เวิร์กช็อปเครื่องหนัง',
      bgImage:
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    shoes: {
      title: 'FOOTWEAR & SNEAKERS',
      titleTh: 'รองเท้าสนีกเกอร์และโลฟเฟอร์',
      subtitle: 'Clean retro court silhouettes and handcrafted loafers made for cushioned everyday ease.',
      subtitleTh: 'ทรงคอร์ทเทนนิสเรโทรสุดคลีน และรองเท้าโลฟเฟอร์งานฝีมือ พื้นรองรับน้ำหนักเพื่อความนุ่มสบายตลอดวัน',
      bannerTag: 'EVERYDAY PERFORMANCE',
      bannerTagTh: 'ความสบายในทุกวัน',
      bgImage:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    home: {
      title: 'HOME & LIFESTYLE',
      titleTh: 'ของแต่งบ้านและไลฟ์สไตล์',
      subtitle: 'Elevate your sanctuary with striped organic towels, hinoki wood candles, and artisan ceramics.',
      subtitleTh: 'เติมเต็มความสงบในบ้านด้วยผ้าขนหนูออร์แกนิก เทียนหอมไม้ฮิโนกิ และเครื่องเคลือบดินเผางานช่างศิลป์',
      bannerTag: 'INTENTIONAL LIVING',
      bannerTagTh: 'วิถีชีวิตอย่างมีระดับ',
      bgImage:
        'https://images.unsplash.com/photo-1583847268964-b28ce8f31161?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    sale: {
      title: 'SALE MARKDOWNS',
      titleTh: 'สินค้าลดราคาพิเศษ',
      subtitle: 'Take up to 50% off select seasonal styles. Plus extra 20% off with code NIDA20.',
      subtitleTh: 'ลดสูงสุด 50% สำหรับสินค้าประจำฤดูกาล พร้อมลดเพิ่มอีก 20% เมื่อกรอกโค้ด NIDA20',
      bannerTag: 'SPECIAL PROMOTION - UP TO 50% OFF',
      bannerTagTh: 'โปรโมชันพิเศษ - ลดสูงสุด 50%',
      bgImage:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    all: {
      title: 'ALL PRODUCTS',
      titleTh: 'สินค้าทั้งหมด',
      subtitle: 'Discover our full range of apparel, bags, shoes, and home lifestyle objects.',
      subtitleTh: 'เลือกชมสินค้าคุณภาพทั้งหมด ทั้งเสื้อผ้า กระเป๋า รองเท้า และของแต่งบ้านสไตล์ Nida',
      bannerTag: 'COMPLETE CATALOGUE',
      bannerTagTh: 'แคตตาล็อกสินค้าครบครัน',
      bgImage:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
  };

  const currentInfo = departmentInfo[category] || departmentInfo.all;
  const currentTitle = language === 'th' ? currentInfo.titleTh : currentInfo.title;
  const currentSubtitle = language === 'th' ? currentInfo.subtitleTh : currentInfo.subtitle;
  const currentTag = language === 'th' ? currentInfo.bannerTagTh : currentInfo.bannerTag;

  // Filter products
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((p) => {
      if (category === 'all') return true;
      if (category === 'sale') return Boolean(p.originalPrice && p.originalPrice > p.price);
      if (category === 'apparel') return p.category === 'apparel' || p.department === 'women' || p.department === 'men';
      return p.department === category || p.category === category;
    });

    if (selectedSubCategory) {
      list = list.filter((p) => p.subCategory === selectedSubCategory);
    }

    if (selectedColor) {
      list = list.filter((p) => p.colors && p.colors.includes(selectedColor));
    }

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [category, selectedSubCategory, selectedColor, sortBy, productsList]);

  // Extract unique subcategories
  const availableSubCategories = useMemo(() => {
    const subs = new Map<string, string>();
    productsList.forEach((p) => {
      if (category === 'all' || p.department === category || p.category === category) {
        if (p.subCategory) {
          subs.set(p.subCategory, p.subCategoryTh || p.subCategory);
        }
      }
    });
    return Array.from(subs.entries()).map(([key, labelTh]) => ({
      key,
      label: language === 'th' ? labelTh : key,
    }));
  }, [category, language, productsList]);

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

  const sortOptions = [
    { id: 'featured', label: t('catalog.sortFeatured') },
    { id: 'price-asc', label: t('catalog.sortPriceAsc') },
    { id: 'price-desc', label: t('catalog.sortPriceDesc') },
    { id: 'rating', label: t('catalog.sortRating') },
  ];

  const currentSortLabel = sortOptions.find((o) => o.id === sortBy)?.label || t('catalog.sortFeatured');

  return (
    <div className="w-full bg-white font-sans min-h-screen">
      {/* 1. EDITORIAL DEPARTMENT BANNER */}
      <div className="bg-[#2B1810] text-white py-12 sm:py-16 px-4 relative overflow-hidden">
        {currentInfo.bgImage && (
          <div className="absolute inset-0 opacity-20">
            <img src={currentInfo.bgImage} alt={currentTitle} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex justify-center items-center space-x-2 text-[11px] font-black uppercase tracking-[0.25em] text-gray-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              {language === 'th' ? 'หน้าแรก' : 'HOME'}
            </Link>
            <span>/</span>
            <span>{language === 'th' ? 'คอลเลกชัน' : 'COLLECTIONS'}</span>
            <span>/</span>
            <span className="text-[#F59E0B]">{currentTitle}</span>
          </div>

          {currentTag && (
            <span className="inline-block bg-[#F59E0B] text-[#2B1810] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-3">
              {currentTag}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
            {currentTitle}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            {currentSubtitle}
          </p>
        </div>
      </div>

      {/* 2. SUB-CATEGORY QUICK PILLS */}
      {availableSubCategories.length > 0 && (
        <div className="bg-[#FAF7F2] border-b border-[#EAE3D9] py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                selectedSubCategory === null ? 'bg-[#2B1810] text-white' : 'bg-white text-[#2B1810] hover:bg-gray-200'
              }`}
            >
              {language === 'th' ? 'ทั้งหมด' : 'ALL'} ({filteredProducts.length})
            </button>
            {availableSubCategories.map((sub) => (
              <button
                key={sub.key}
                onClick={() => setSelectedSubCategory(selectedSubCategory === sub.key ? null : sub.key)}
                className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                  selectedSubCategory === sub.key ? 'bg-[#2B1810] text-white' : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. FILTER & SORT CONTROL BAR */}
      <div className="border-b border-gray-200 bg-white sticky top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left: Filter dropdown buttons */}
          <div className="flex items-center space-x-6 text-xs font-bold text-[#2B1810]">
            {/* Color Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
                className="flex items-center hover:text-[#D97706] uppercase tracking-wider py-2"
              >
                {language === 'th' ? 'เลือกสี' : 'COLOR'}{' '}
                {selectedColor && <span className="ml-1 text-[#D97706] font-black">•</span>}
                <ChevronDown size={14} className="ml-1" />
              </button>
              {activeDropdown === 'color' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl p-3 z-40">
                  <div className="flex flex-wrap gap-2">
                    {['#2B1810', '#FFFFFF', '#F59E0B', '#D4B996', '#111827', '#4B5563', '#78350F'].map((col) => (
                      <button
                        key={col}
                        onClick={() => {
                          setSelectedColor(selectedColor === col ? null : col);
                          setActiveDropdown(null);
                        }}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === col ? 'border-[#2B1810] scale-110 ring-2 ring-[#D97706]' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: col }}
                      >
                        {selectedColor === col && (
                          <Check
                            size={12}
                            className={
                              col === '#FFFFFF' || col === '#F59E0B' || col === '#D4B996' ? 'text-black' : 'text-white'
                            }
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedColor && (
                    <button
                      onClick={() => {
                        setSelectedColor(null);
                        setActiveDropdown(null);
                      }}
                      className="mt-3 text-[11px] text-[#D97706] hover:underline font-bold block"
                    >
                      {language === 'th' ? 'ล้างตัวกรองสี' : 'Clear Color Filter'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <span className="text-gray-400 font-normal">
              {t('catalog.showing')} {filteredProducts.length} {t('catalog.items')}
            </span>
          </div>

          {/* Right: Sort & Grid Layout Buttons */}
          <div className="flex items-center space-x-4">
            {/* Grid Col toggles */}
            <div className="hidden sm:flex items-center space-x-1 text-gray-400 border-r border-gray-200 pr-4">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1 hover:text-[#2B1810] ${gridCols === 3 ? 'text-[#2B1810]' : ''}`}
                title="3-column view"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1 hover:text-[#2B1810] ${gridCols === 4 ? 'text-[#2B1810]' : ''}`}
                title="4-column view"
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className="text-xs font-bold text-[#2B1810] hover:text-[#D97706] flex items-center uppercase tracking-wider py-2"
              >
                {t('catalog.sortBy')}:{' '}
                <span className="ml-1 text-gray-500 font-semibold">{currentSortLabel}</span>
                <ChevronDown size={14} className="ml-1" />
              </button>

              {activeDropdown === 'sort' && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 shadow-xl py-2 z-40">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id as any);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 text-[#2B1810] flex items-center justify-between"
                    >
                      {option.label}
                      {sortBy === option.id && <Check size={14} className="text-[#D97706]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-gray-300" />
            <h3 className="text-xl font-bold text-[#2B1810]">{t('catalog.noProducts')}</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {language === 'th'
                ? 'ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก ลองรีเซ็ตตัวกรองหรือเลือกดูหมวดหมู่อื่น'
                : "We couldn't find items matching your current filters. Try resetting the filters or check another category."}
            </p>
            <button
              onClick={() => {
                setSelectedSubCategory(null);
                setSelectedColor(null);
              }}
              className="bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest px-6 py-3 hover:bg-[#D97706] transition-colors"
            >
              {t('catalog.resetFilters')}
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-x-6 gap-y-12`}
          >
            {filteredProducts.map((product) => {
              const isWish = isInWishlist(product.id);
              const isJustAdded = addedProductId === product.id;
              const title = getProductTitle(product, language);
              const subCategory = getProductSubCategory(product, language);
              const tag = getProductTag(product, language) || product.tag;

              return (
                <div key={product.id} className="group flex flex-col bg-white relative">
                  {/* Image Card Container */}
                  <div className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden mb-4 border border-gray-100">
                    <Link href={`/product/${product.id}`} className="block w-full h-full">
                      <img
                        src={product.image}
                        alt={title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
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

                  {/* Swatches */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center space-x-1.5 mb-2">
                      {product.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-2xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <span className="text-[10px] text-gray-400 font-medium ml-1">
                        {product.colors.length} {language === 'th' ? 'สี' : 'colors'}
                      </span>
                    </div>
                  )}

                  {/* Category breadcrumb label */}
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {subCategory}
                  </span>

                  {/* Product title */}
                  <Link
                    href={`/product/${product.id}`}
                    className="font-bold text-sm text-[#2B1810] group-hover:text-[#D97706] transition-colors line-clamp-1 mb-2"
                  >
                    {title}
                  </Link>

                  {/* Prices */}
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
        )}
      </div>
    </div>
  );
}
