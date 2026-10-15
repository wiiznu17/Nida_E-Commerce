import type { FilterState, PriceRangeKey, SortOptionKey } from './catalogTypes';

export const INITIAL_FILTER_STATE: FilterState = {
  departments: [],
  subCategories: [],
  priceRange: null,
  onSale: false,
  newArrivals: false,
  sortBy: 'featured',
};

export const STANDARD_DEPARTMENTS = [
  'women',
  'men',
  'kids',
  'bags',
  'shoes',
  'home',
] as const;

export const DEPARTMENT_LABELS: Record<string, { en: string; th: string }> = {
  women: { en: 'Women', th: 'ผู้หญิง' },
  men: { en: 'Men', th: 'ผู้ชาย' },
  kids: { en: 'Kids', th: 'เด็ก' },
  bags: { en: 'Bags & Leather', th: 'กระเป๋า' },
  shoes: { en: 'Shoes', th: 'รองเท้า' },
  home: { en: 'Home & Living', th: 'ของแต่งบ้าน' },
};

export const PRICE_OPTIONS: Array<{
  id: Exclude<PriceRangeKey, null>;
  i18nKey: string;
  min: number;
  max?: number;
}> = [
  { id: 'under100', i18nKey: 'search.under100', min: 0, max: 100 },
  { id: '100-200', i18nKey: 'search.between100And200', min: 100, max: 200 },
  { id: 'over200', i18nKey: 'search.over200', min: 200 },
];

export const SORT_OPTIONS: Array<{
  id: SortOptionKey;
  i18nKey: string;
}> = [
  { id: 'featured', i18nKey: 'search.featured' },
  { id: 'newest', i18nKey: 'search.newest' },
  { id: 'price-asc', i18nKey: 'search.priceLowToHigh' },
  { id: 'price-desc', i18nKey: 'search.priceHighToLow' },
];
