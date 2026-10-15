import type { StorefrontProduct } from '@repo/types';

export interface FilterState {
  departments: string[];
  subCategories: string[];
  priceRange: 'under100' | '100-200' | 'over200' | null;
  colors: string[];
  onSale: boolean;
  newArrivals: boolean;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc';
}

export interface SubCategoryOption {
  key: string;
  labelEn: string;
  labelTh: string;
}

export interface SearchFilterOptions {
  departments: string[];
  subCategories: SubCategoryOption[];
  colors: string[];
}

export interface SearchTopBarProps {
  query: string;
  totalCount: number;
  isFilterVisible: boolean;
  activeFilterCount: number;
  sortBy: FilterState['sortBy'];
  onToggleFilter: () => void;
  onOpenMobileFilter: () => void;
  onSortChange: (sort: FilterState['sortBy']) => void;
}

export interface SearchFilterSidebarProps {
  filters: FilterState;
  filterOptions: SearchFilterOptions;
  activeFilterCount: number;
  onToggleDepartment: (dept: string) => void;
  onToggleSubCategory: (subCat: string) => void;
  onToggleColor: (colorHex: string) => void;
  onPriceRangeChange: (priceRange: FilterState['priceRange']) => void;
  onToggleOnSale: (checked: boolean) => void;
  onToggleNewArrivals: (checked: boolean) => void;
  onClearAll: () => void;
}

export interface SearchProductGridProps {
  products: StorefrontProduct[];
  isFilterVisible: boolean;
  onAddToCart: (product: StorefrontProduct) => void;
}

export interface SearchMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  children: React.ReactNode;
}
