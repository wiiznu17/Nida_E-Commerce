'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { useLanguage } from '@/context/LanguageContext';
import { catalogRequester } from '@/api';
import type { ApiProduct } from '@repo/types';
import { DEPARTMENT_INFO } from './collectionConstants';
import type { CategoryPillItem } from './collectionTypes';

export function useCollectionDepartment() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawDept = params?.department;
  const department = (
    typeof rawDept === 'string'
      ? rawDept
      : Array.isArray(rawDept)
        ? rawDept[0]
        : 'women'
  ).toLowerCase();

  // Redirect legacy /collections/all or invalid 'all' to /search
  useEffect(() => {
    if (department === 'all') {
      router.replace('/search');
    }
  }, [department, router]);

  const selectedCategory = searchParams.get('category')?.trim() ?? null;
  const selectedSubCategory = searchParams.get('subCategory')?.trim() ?? null;
  const sortBy =
    (searchParams.get('sort')?.trim() as
      'featured' | 'newest' | 'price-asc' | 'price-desc') ?? 'featured';

  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 24;

  const { addToCart } = useCart();
  const { categories, categoriesByDept } = useCatalog();
  const { language } = useLanguage();

  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [serverProducts, setServerProducts] = useState<ApiProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const primaryCategories = useMemo<CategoryPillItem[]>(() => {
    if (department === 'sale') return [];
    const deptCats = categoriesByDept[department] ?? [];
    return deptCats.map((cat) => ({
      slug: cat.slug,
      label: language === 'th' && cat.nameTh ? cat.nameTh : cat.name,
    }));
  }, [department, categoriesByDept, language]);

  const availableSubCategories = useMemo<CategoryPillItem[]>(() => {
    if (department === 'sale') return [];

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

  const updateUrlFilters = (updates: {
    category?: string | null;
    subCategory?: string | null;
    sort?: string | null;
    page?: number | null;
  }) => {
    const nextCat =
      updates.category !== undefined ? updates.category : selectedCategory;
    const nextSub =
      updates.subCategory !== undefined
        ? updates.subCategory
        : selectedSubCategory;
    const nextSort = updates.sort !== undefined ? updates.sort : sortBy;
    const nextPage = updates.page !== undefined ? updates.page : 1;

    const sp = new URLSearchParams();
    if (nextCat) sp.set('category', nextCat);
    if (nextSub) sp.set('subCategory', nextSub);
    if (nextSort && nextSort !== 'featured') sp.set('sort', nextSort);
    if (nextPage && nextPage > 1) sp.set('page', nextPage.toString());

    const queryString = sp.toString();
    router.push(
      `/collections/${department}${queryString ? `?${queryString}` : ''}`,
      { scroll: false },
    );
  };

  const handlePageChange = (newPage: number) => {
    updateUrlFilters({ page: newPage });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (department === 'all') return;

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

    catalogRequester
      .getProductsWithMeta({
        department: department !== 'sale' ? department : undefined,
        category: selectedCategory ?? undefined,
        subCategory: selectedSubCategory ?? undefined,
        tag: department === 'sale' ? 'SALE' : undefined,
        sortBy: sortMap[sortBy] ?? 'featured',
        page: currentPage,
        limit: pageSize,
      })
      .then((res) => {
        if (!isCancelled) {
          setServerProducts(res.products);
          setTotalCount(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.warn(
            '[CollectionDepartmentContent] Server fetch error:',
            err,
          );
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    department,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    currentPage,
    pageSize,
  ]);

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
        ? 'คอลเลกชัน'
        : 'COLLECTION';

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

  return {
    department,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    gridCols,
    setGridCols,
    primaryCategories,
    availableSubCategories,
    updateUrlFilters,
    serverProducts,
    totalCount,
    isLoading,
    currentTitle,
    currentSubtitle,
    currentTag,
    currentBgImage,
    addToCart,
  };
}
