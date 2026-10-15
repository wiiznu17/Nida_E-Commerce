'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { useLanguage } from '@/context/LanguageContext';
import { catalogRequester } from '@/api';
import type { ApiProduct } from '@repo/types';
import {
  CollectionBanner,
  CollectionCategoryNav,
  CollectionControlBar,
  CollectionProductGrid,
  CollectionEmptyState,
  DEPARTMENT_INFO,
  type CategoryPillItem,
} from '@/components/collection';

function CollectionDepartmentContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // 1. Direct Department from Route Parameter
  const rawDept = params?.department;
  const department = (
    typeof rawDept === 'string'
      ? rawDept
      : Array.isArray(rawDept)
        ? rawDept[0]
        : 'all'
  ).toLowerCase();

  // 2. Direct Category and SubCategory from URL Search Parameters
  const selectedCategory = searchParams.get('category')?.trim() ?? null;
  const selectedSubCategory = searchParams.get('subCategory')?.trim() ?? null;
  const sortBy =
    (searchParams.get('sort')?.trim() as
      | 'featured'
      | 'newest'
      | 'price-asc'
      | 'price-desc') ?? 'featured';

  const { addToCart } = useCart();
  const { categories, categoriesByDept } = useCatalog();
  const { language } = useLanguage();

  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [serverProducts, setServerProducts] = useState<ApiProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Primary categories for current department
  const primaryCategories = useMemo<CategoryPillItem[]>(() => {
    if (department === 'all' || department === 'sale') return [];
    const deptCats = categoriesByDept[department] ?? [];
    return deptCats.map((cat) => ({
      slug: cat.slug,
      label: language === 'th' && cat.nameTh ? cat.nameTh : cat.name,
    }));
  }, [department, categoriesByDept, language]);

  // 2. Subcategories based on active primary category
  const availableSubCategories = useMemo<CategoryPillItem[]>(() => {
    if (department === 'all' || department === 'sale') return [];

    // If a primary category is selected, show only its children
    if (selectedCategory) {
      const parent = categories.find((c) => c.slug === selectedCategory);
      if (parent?.children && parent.children.length > 0) {
        return parent.children.map((child) => ({
          slug: child.slug,
          label: language === 'th' && child.nameTh ? child.nameTh : child.name,
        }));
      }
      return [];
    }

    // If "All Categories" is selected, aggregate all subcategories in the department
    const deptCats = categoriesByDept[department] ?? [];
    const list: CategoryPillItem[] = [];
    const seen = new Set<string>();

    for (const parent of deptCats) {
      if (parent.children) {
        for (const child of parent.children) {
          if (!seen.has(child.slug)) {
            seen.add(child.slug);
            list.push({
              slug: child.slug,
              label:
                language === 'th' && child.nameTh ? child.nameTh : child.name,
            });
          }
        }
      }
    }
    return list;
  }, [department, selectedCategory, categories, categoriesByDept, language]);

  // Clean URL update handler
  const updateUrlFilters = (updates: {
    category?: string | null;
    subCategory?: string | null;
    sort?: string | null;
  }) => {
    const nextCat =
      updates.category !== undefined ? updates.category : selectedCategory;
    const nextSub =
      updates.subCategory !== undefined
        ? updates.subCategory
        : selectedSubCategory;
    const nextSort = updates.sort !== undefined ? updates.sort : sortBy;

    const sp = new URLSearchParams();
    if (nextCat) sp.set('category', nextCat);
    if (nextSub) sp.set('subCategory', nextSub);
    if (nextSort && nextSort !== 'featured') sp.set('sort', nextSort);

    const queryString = sp.toString();
    router.push(
      `/collections/${department}${queryString ? `?${queryString}` : ''}`,
      { scroll: false },
    );
  };

  // Server Fetch Effect
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const sortMap: Record<
      string,
      'featured' | 'newest' | 'price_asc' | 'price_desc'
    > = {
      featured: 'featured',
      newest: 'newest',
      'price-asc': 'price_asc',
      'price-desc': 'price_desc',
    };

    catalogRequester.getProductsWithMeta({
      department:
        department !== 'all' && department !== 'sale' ? department : undefined,
      category: selectedCategory ?? undefined,
      subCategory: selectedSubCategory ?? undefined,
      tag: department === 'sale' ? 'SALE' : undefined,
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
          console.warn('[CollectionDepartmentContent] Server fetch error:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [department, selectedCategory, selectedSubCategory, sortBy]);

  // Department and Category Banner Meta
  const deptData = DEPARTMENT_INFO[department];
  const matchedCategory = categories.find((c) => c.slug === selectedCategory);

  const currentTitle = matchedCategory
    ? language === 'th' && matchedCategory.nameTh
      ? matchedCategory.nameTh
      : matchedCategory.name
    : deptData
      ? language === 'th'
        ? deptData.titleTh
        : deptData.title
      : language === 'th'
        ? 'คอลเลกชันทั้งหมด'
        : 'ALL COLLECTIONS';

  const currentSubtitle = matchedCategory?.description
    ? language === 'th' && matchedCategory.descriptionTh
      ? matchedCategory.descriptionTh
      : matchedCategory.description
    : deptData
      ? language === 'th'
        ? deptData.subtitleTh
        : deptData.subtitle
      : language === 'th'
        ? 'สำรวจสินค้าแฟชั่นและไลฟ์สไตล์ระดับพรีเมียมจาก Nida'
        : 'Explore our complete catalog of timeless silhouettes and heritage staples.';

  const currentTag = matchedCategory?.bannerTag ?? deptData?.bannerTag;
  const currentBgImage = matchedCategory?.bannerImage ?? deptData?.bgImage;

  const handleAddToCart = (product: ApiProduct) => {
    const dept = (product.department || '').toLowerCase();
    const defaultSize =
      dept === 'shoes'
        ? 'US 9'
        : product.categorySlug === 'bags' || dept === 'home'
          ? 'One Size'
          : 'M';
    const defaultColor =
      product.colors && product.colors.length > 0
        ? product.colors[0]?.name || product.colors[0]?.hex
        : 'Standard';
    addToCart(product, defaultSize, defaultColor);
  };

  return (
    <div className="w-full bg-white font-sans min-h-screen">
      {/* 1. EDITORIAL BANNER */}
      <CollectionBanner
        title={currentTitle}
        subtitle={currentSubtitle}
        bannerTag={currentTag}
        bgImage={currentBgImage}
      />

      {/* 2. DOUBLE-TIER CATEGORY & SUB CATEGORY BARS */}
      <CollectionCategoryNav
        categories={primaryCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) =>
          updateUrlFilters({ category: cat, subCategory: null })
        }
        subCategories={availableSubCategories}
        selectedSubCategory={selectedSubCategory}
        onSelectSubCategory={(sub) => updateUrlFilters({ subCategory: sub })}
        totalCount={totalCount}
      />

      {/* 3. FILTER & SORT CONTROL BAR */}
      <CollectionControlBar
        sortBy={sortBy}
        gridCols={gridCols}
        totalCount={totalCount}
        onSortChange={(sort) => updateUrlFilters({ sort })}
        onToggleGridCols={(cols) => setGridCols(cols)}
      />

      {/* 4. MAIN PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-start justify-center pt-24 transition-opacity">
            <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && serverProducts.length === 0 ? (
          <CollectionEmptyState
            onResetFilters={() =>
              updateUrlFilters({
                category: null,
                subCategory: null,
              })
            }
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

export default function CollectionDepartmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionDepartmentContent />
    </Suspense>
  );
}
