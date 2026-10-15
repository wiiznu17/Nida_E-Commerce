import type { StorefrontProduct } from '@repo/types';

export type PriceRangeKey = 'under100' | '100-200' | 'over200' | null;
export type SortOptionKey = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface FilterState {
  departments: string[];
  subCategories: string[];
  priceRange: PriceRangeKey;
  onSale: boolean;
  newArrivals: boolean;
  sortBy: SortOptionKey;
}

export interface FilterCategoryOption {
  key: string;
  labelEn: string;
  labelTh: string;
}

export interface CatalogFilterOptions {
  departments: string[];
  subCategories: FilterCategoryOption[];
}

export interface CatalogFilterSidebarProps {
  filters: FilterState;
  filterOptions: CatalogFilterOptions;
  activeFilterCount: number;
  onToggleDepartment: (dept: string) => void;
  onToggleSubCategory: (subCat: string) => void;
  onPriceRangeChange: (priceRange: PriceRangeKey) => void;
  onToggleOnSale: (onSale: boolean) => void;
  onToggleNewArrivals: (newArrivals: boolean) => void;
  onClearAll: () => void;
}

export interface CatalogTopBarProps {
  title?: string;
  searchQuery?: string;
  totalCount: number;
  isFilterVisible: boolean;
  activeFilterCount: number;
  sortBy: SortOptionKey;
  onToggleFilter: () => void;
  onOpenMobileFilter: () => void;
  onSortChange: (sort: SortOptionKey) => void;
}

export interface CatalogMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  children: React.ReactNode;
}

export interface CatalogProductGridProps {
  products: StorefrontProduct[];
  isFilterVisible: boolean;
  onAddToCart: (product: StorefrontProduct) => void;
}
