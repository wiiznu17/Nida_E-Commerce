export interface ProductFilterState {
  search: string;
  department: string;
  category: string;
  status: 'all' | 'published' | 'draft';
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

export const DEFAULT_FILTERS: ProductFilterState = {
  search: '',
  department: 'all',
  category: 'all',
  status: 'all',
  sortBy: 'newest',
};
