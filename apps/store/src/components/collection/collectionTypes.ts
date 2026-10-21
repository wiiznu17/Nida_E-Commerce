import type { ApiProduct } from '@repo/types';

export interface DepartmentMeta {
  title: string;
  titleTh: string;
  subtitle: string;
  subtitleTh: string;
  bannerTag?: string;
  bannerTagTh?: string;
  bgImage?: string;
}

export interface CollectionBannerProps {
  title: string;
  subtitle: string;
  bannerTag?: string;
  bgImage?: string;
}

export interface CategoryPillItem {
  slug: string;
  label: string;
  count?: number;
}

export interface CollectionCategoryNavProps {
  // Level 1: Category
  categories: CategoryPillItem[];
  selectedCategory: string | null;
  onSelectCategory: (categorySlug: string | null) => void;

  // Level 2: Sub Category
  subCategories: CategoryPillItem[];
  selectedSubCategory: string | null;
  onSelectSubCategory: (subCategorySlug: string | null) => void;

  totalCount: number;
}

export interface CollectionControlBarProps {
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc';
  gridCols: 3 | 4;
  totalCount?: number;
  onSortChange: (
    sort: 'featured' | 'newest' | 'price-asc' | 'price-desc',
  ) => void;
  onToggleGridCols: (cols: 3 | 4) => void;
}

export interface CollectionProductGridProps {
  products: ApiProduct[];
  gridCols: 3 | 4;
  onAddToCart: (product: ApiProduct, size?: string, color?: string) => void;
}
