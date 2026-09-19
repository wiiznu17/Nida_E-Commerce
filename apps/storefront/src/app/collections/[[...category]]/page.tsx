'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ChevronDown, Check, Heart, ShoppingBag, Grid3X3, LayoutGrid } from 'lucide-react';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const categoryParam = params?.category;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam || 'all';

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState<4 | 3>(4);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Department / Category Metadata
  const departmentInfo: Record<string, { title: string; subtitle: string; bannerTag?: string; bgImage?: string }> = {
    women: {
      title: "WOMEN'S COLLECTION",
      subtitle: 'Classic prep meets modern relaxed tailoring. Sweaters, trench coats, shirts, and versatile denim.',
      bannerTag: 'AUTUMN / WINTER 2026',
      bgImage:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    men: {
      title: "MEN'S COLLECTION",
      subtitle: 'Heritage American cool. Iconic pique polos, oxford shirts, varsity outerwear, and tailored chinos.',
      bannerTag: 'HERITAGE ICONS',
      bgImage:
        'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    kids: {
      title: 'KIDS & MINI PREP',
      subtitle: 'Durable, comfortable, and vibrant clothing designed for young explorers and school days.',
      bannerTag: 'BACK TO SCHOOL',
      bgImage:
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    bags: {
      title: 'BAGS & LEATHER ACCESSORIES',
      subtitle: 'Crafted with supple pebble leather, signature ribbon accents, and durable brass hardware.',
      bannerTag: 'LEATHER WORKSHOP',
      bgImage:
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    shoes: {
      title: 'FOOTWEAR & SNEAKERS',
      subtitle: 'Clean retro court silhouettes and handcrafted loafers made for cushioned everyday ease.',
      bannerTag: 'EVERYDAY PERFORMANCE',
      bgImage:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    home: {
      title: 'HOME & LIFESTYLE',
      subtitle: 'Elevate your sanctuary with striped organic towels, hinoki wood candles, and artisan ceramics.',
      bannerTag: 'INTENTIONAL LIVING',
      bgImage:
        'https://images.unsplash.com/photo-1583847268964-b28ce8f31161?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    sale: {
      title: 'SALE MARKDOWNS',
      subtitle: 'Take up to 50% off select seasonal styles. Plus extra 20% off with code NIDA20.',
      bannerTag: 'SPECIAL PROMOTION - UP TO 50% OFF',
      bgImage:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    all: {
      title: 'ALL PRODUCTS',
      subtitle: 'Discover our full range of apparel, bags, shoes, and home lifestyle objects.',
      bannerTag: 'COMPLETE CATALOGUE',
      bgImage:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    },
    // Backwards compatibility keys
    apparel: {
      title: 'APPAREL',
      subtitle: 'Tailored knits, outerwear, polos, and trousers for modern living.',
      bannerTag: 'READY TO WEAR',
    },
    accessories: {
      title: 'ACCESSORIES',
      subtitle: 'Caps, reversible belts, wallets, and finishing touches.',
      bannerTag: 'SIGNATURE PIECES',
    },
  };

  const currentInfo = departmentInfo[category] || departmentInfo.all;

  // Filter products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
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
  }, [category, selectedSubCategory, selectedColor, sortBy]);

  // Extract unique subcategories
  const availableSubCategories = useMemo(() => {
    const subs = new Set<string>();
    products.forEach((p) => {
      if (category === 'all' || p.department === category || p.category === category) {
        if (p.subCategory) subs.add(p.subCategory);
      }
    });
    return Array.from(subs);
  }, [category]);

  const handleQuickAdd = (e: React.MouseEvent, product: (typeof products)[0]) => {
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

  return (
    <div className="w-full bg-white font-sans min-h-screen">
      {/* 1. EDITORIAL DEPARTMENT BANNER */}
      <div className="bg-[#2B1810] text-white py-12 sm:py-16 px-4 relative overflow-hidden">
        {currentInfo.bgImage && (
          <div className="absolute inset-0 opacity-20">
            <img src={currentInfo.bgImage} alt={currentInfo.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex justify-center items-center space-x-2 text-[11px] font-black uppercase tracking-[0.25em] text-gray-300 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <span>/</span>
            <span>COLLECTIONS</span>
            <span>/</span>
            <span className="text-[#F59E0B]">{category.toUpperCase()}</span>
          </div>

          {currentInfo.bannerTag && (
            <span className="inline-block bg-[#F59E0B] text-[#2B1810] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-3">
              {currentInfo.bannerTag}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
            {currentInfo.title}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            {currentInfo.subtitle}
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
              ALL ({filteredProducts.length})
            </button>
            {availableSubCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(selectedSubCategory === sub ? null : sub)}
                className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                  selectedSubCategory === sub ? 'bg-[#2B1810] text-white' : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub}
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
                COLOR {selectedColor && <span className="ml-1 text-[#D97706] font-black">•</span>}
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
                      Clear Color Filter
                    </button>
                  )}
                </div>
              )}
            </div>

            <span className="text-gray-400 font-normal">Showing {filteredProducts.length} items</span>
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
                SORT BY:{' '}
                <span className="ml-1 text-gray-500 font-semibold">{sortBy.replace('-', ' ').toUpperCase()}</span>
                <ChevronDown size={14} className="ml-1" />
              </button>

              {activeDropdown === 'sort' && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 shadow-xl py-2 z-40">
                  {[
                    { id: 'featured', label: 'FEATURED' },
                    { id: 'price-asc', label: 'PRICE: LOW TO HIGH' },
                    { id: 'price-desc', label: 'PRICE: HIGH TO LOW' },
                    { id: 'rating', label: 'TOP RATED' },
                  ].map((option) => (
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
            <h3 className="text-xl font-bold text-[#2B1810]">NO PRODUCTS FOUND</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              We couldn't find items matching your current filters. Try resetting the filters or check another category.
            </p>
            <button
              onClick={() => {
                setSelectedSubCategory(null);
                setSelectedColor(null);
              }}
              className="bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest px-6 py-3 hover:bg-[#D97706] transition-colors"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-x-6 gap-y-12`}
          >
            {filteredProducts.map((product) => {
              const isWish = isInWishlist(product.id);
              const isJustAdded = addedProductId === product.id;

              return (
                <div key={product.id} className="group flex flex-col bg-white relative">
                  {/* Image Card Container */}
                  <div className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden mb-4 border border-gray-100">
                    <Link href={`/product/${product.id}`} className="block w-full h-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </Link>

                    {/* Tag badge */}
                    {product.tag && (
                      <div className="absolute top-3 left-3 bg-[#2B1810] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-xs">
                        {product.tag}
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
                            <Check size={14} /> <span>ADDED TO BAG</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} /> <span>QUICK ADD</span>
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
                      <span className="text-[10px] text-gray-400 font-medium ml-1">{product.colors.length} colors</span>
                    </div>
                  )}

                  {/* Category breadcrumb label */}
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {product.subCategory || product.category}
                  </span>

                  {/* Product title */}
                  <Link
                    href={`/product/${product.id}`}
                    className="font-bold text-sm text-[#2B1810] group-hover:text-[#D97706] transition-colors line-clamp-1 mb-2"
                  >
                    {product.name}
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
