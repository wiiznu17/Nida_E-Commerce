import type { StorefrontProduct } from '@repo/types';

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

export interface SubCategoryItem {
  key: string;
  label: string;
}

export interface CollectionSubCategoryPillsProps {
  subCategories: SubCategoryItem[];
  selectedSubCategory: string | null;
  totalCount: number;
  onSelectSubCategory: (subCategory: string | null) => void;
}

export interface CollectionControlBarProps {
  selectedColor: string | null;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc';
  gridCols: 3 | 4;
  onSelectColor: (color: string | null) => void;
  onSortChange: (sort: 'featured' | 'newest' | 'price-asc' | 'price-desc') => void;
  onToggleGridCols: (cols: 3 | 4) => void;
}

export interface CollectionProductGridProps {
  products: StorefrontProduct[];
  gridCols: 3 | 4;
  onAddToCart: (product: StorefrontProduct) => void;
}
