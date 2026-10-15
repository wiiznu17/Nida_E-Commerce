'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { useLanguage } from '@/context/LanguageContext';
import { fetchCatalogProductsWithMeta } from '@/lib/catalogApi';
import type { StorefrontProduct } from '@repo/types';
import {
  CollectionBanner,
  CollectionSubCategoryPills,
  CollectionControlBar,
  CollectionProductGrid,
  CollectionEmptyState,
  DEPARTMENT_INFO,
  type SubCategoryItem,
} from '@/components/collection';

function CollectionPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const categoryParam = params?.category;
  const category = Array.isArray(categoryParam)
    ? categoryParam[0]
    : categoryParam ?? 'all';

  const { addToCart } = useCart();
  const { categories, getCategoryBySlug } = useCatalog();
  const { language, t } = useLanguage();

  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [serverProducts, setServerProducts] = useState<StorefrontProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Read filters from URL
  const selectedSubCategory = searchParams.get('subCategory')?.trim() ?? null;
  const selectedColor = searchParams.get('color')?.trim() ?? null;
  const sortBy = (searchParams.get('sort')?.trim() as
    | 'featured'
    | 'newest'
    | 'price-asc'
    | 'price-desc') ?? 'featured';

  const matchedCategory = useMemo(() => {
    return getCategoryBySlug(category);
  }, [category, getCategoryBySlug]);

  const isDepartment = ['women', 'men', 'kids', 'bags', 'shoes', 'home'].includes(category);

  // Available sub-categories derived from taxonomy
  const availableSubCategories = useMemo<SubCategoryItem[]>(() => {
    if (matchedCategory?.children && matchedCategory.children.length > 0) {
      return matchedCategory.children.map((child) => ({
        key: child.name,
        label: language === 'th' && child.nameTh ? child.nameTh : child.name,
      }));
    }

    const matchingCats = categories.filter((c) => {
      if (category === 'all') return true;
      if (isDepartment) return c.department?.toLowerCase() === category.toLowerCase();
      return c.slug === category || c.parentId === matchedCategory?.id;
    });

    const seen = new Set<string>();
    const result: SubCategoryItem[] = [];
    for (const c of matchingCats) {
      const cleanName = c.name?.trim();
      if (cleanName && !seen.has(cleanName)) {
        seen.add(cleanName);
        result.push({
          key: cleanName,
          label: language === 'th' && c.nameTh ? c.nameTh : cleanName,
        });
      }
    }
    return result;
  }, [category, isDepartment, matchedCategory, categories, language]);

  // URL state update handler
  const updateUrlFilters = (updates: {
    subCategory?: string | null;
    color?: string | null;
    sort?: string | null;
  }) => {
    const nextSub = updates.subCategory !== undefined ? updates.subCategory : selectedSubCategory;
    const nextCol = updates.color !== undefined ? updates.color : selectedColor;
    const nextSort = updates.sort !== undefined ? updates.sort : sortBy;

    const sp = new URLSearchParams();
    if (nextSub) sp.set('subCategory', nextSub);
    if (nextCol) sp.set('color', nextCol);
    if (nextSort && nextSort !== 'featured') sp.set('sort', nextSort);

    const queryString = sp.toString();
    router.push(`/collections/${category}${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  // Server Search Fetch Effect
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const sortMap: Record<string, 'featured' | 'newest' | 'price_asc' | 'price_desc'> = {
      featured: 'featured',
      newest: 'newest',
      'price-asc': 'price_asc',
      'price-desc': 'price_desc',
    };

    fetchCatalogProductsWithMeta({
      department: isDepartment ? category : undefined,
      category: !isDepartment && category !== 'all' ? category : undefined,
      subCategory: selectedSubCategory ?? undefined,
      colors: selectedColor ? [selectedColor] : undefined,
      tag: category === 'sale' ? 'SALE' : undefined,
      sortBy: sortMap[sortBy] ?? 'featured',
      limit: 48,
    })
      .then((res) => {
        if (!isCancelled) {
          setServerProducts(res.products);
          setTotalCount(res.total);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.warn('[CollectionPage] Server fetch error:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [category, isDepartment, selectedSubCategory, selectedColor, sortBy]);

  // Department Banner Details
  const deptData = DEPARTMENT_INFO[category];
  const currentTitle = deptData
    ? language === 'th'
      ? deptData.titleTh
      : deptData.title
    : matchedCategory
      ? language === 'th' && matchedCategory.nameTh
        ? matchedCategory.nameTh
        : matchedCategory.name
      : language === 'th'
        ? 'คอลเลกชันทั้งหมด'
        : 'ALL COLLECTIONS';

  const currentSubtitle = deptData
    ? language === 'th'
      ? deptData.subtitleTh
      : deptData.subtitle
    : matchedCategory?.description
      ? language === 'th' && matchedCategory.descriptionTh
        ? matchedCategory.descriptionTh
        : matchedCategory.description
      : language === 'th'
        ? 'สำรวจสินค้าแฟชั่นและไลฟ์สไตล์ระดับพรีเมียมจาก Nida'
        : 'Explore our complete catalog of timeless silhouettes and heritage staples.';

  const currentTag = deptData
    ? language === 'th'
      ? deptData.bannerTagTh
      : deptData.bannerTag
    : matchedCategory?.bannerTag;

  const currentBgImage = deptData?.bgImage ?? matchedCategory?.bannerImage;

  const handleAddToCart = (product: StorefrontProduct) => {
    const defaultSize =
      product.department === 'shoes'
        ? 'US 9'
        : product.category === 'bags' || product.category === 'home'
          ? 'One Size'
          : 'M';
    const defaultColor =
      product.colors && product.colors.length > 0 ? product.colors[0] : '#2B1810';
    addToCart(product, defaultSize, defaultColor);
  };

  return (
    <div className="w-full bg-white font-sans min-h-screen">
      {/* 1. EDITORIAL DEPARTMENT BANNER */}
      <CollectionBanner
        title={currentTitle}
        subtitle={currentSubtitle}
        bannerTag={currentTag}
        bgImage={currentBgImage}
      />

      {/* 2. SUB-CATEGORY QUICK PILLS */}
      <CollectionSubCategoryPills
        subCategories={availableSubCategories}
        selectedSubCategory={selectedSubCategory}
        totalCount={totalCount}
        onSelectSubCategory={(sub) => updateUrlFilters({ subCategory: sub })}
      />

      {/* 3. FILTER & SORT CONTROL BAR */}
      <CollectionControlBar
        selectedColor={selectedColor}
        sortBy={sortBy}
        gridCols={gridCols}
        onSelectColor={(color) => updateUrlFilters({ color })}
        onSortChange={(sort) => updateUrlFilters({ sort })}
        onToggleGridCols={(cols) => setGridCols(cols)}
      />

      {/* 4. MAIN PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-start justify-center pt-24 transition-opacity">
            <div className="w-8 h-8 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && serverProducts.length === 0 ? (
          <CollectionEmptyState
            onResetFilters={() => updateUrlFilters({ subCategory: null, color: null })}
          />
        ) : (
          <CollectionProductGrid
            products={serverProducts}
            gridCols={gridCols}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionPageContent />
    </Suspense>
  );
}
