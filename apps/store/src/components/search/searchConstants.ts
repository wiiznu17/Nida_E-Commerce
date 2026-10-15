import type { FilterState } from './searchTypes';

export const INITIAL_FILTER_STATE: FilterState = {
  departments: [],
  subCategories: [],
  priceRange: null,
  colors: [],
  onSale: false,
  newArrivals: false,
  sortBy: 'featured',
};

export const DEPARTMENT_LABELS: Record<string, { en: string; th: string }> = {
  women: { en: 'Women', th: 'ผู้หญิง' },
  men: { en: 'Men', th: 'ผู้ชาย' },
  kids: { en: 'Kids', th: 'เด็ก' },
  bags: { en: 'Bags & Leather', th: 'กระเป๋า' },
  shoes: { en: 'Shoes', th: 'รองเท้า' },
  home: { en: 'Home & Living', th: 'ของแต่งบ้าน' },
};

export const COLOR_NAMES: Record<string, { en: string; th: string }> = {
  '#2B1810': { en: 'Espresso Brown', th: 'น้ำตาลเอสเปรสโซ' },
  '#FFFFFF': { en: 'White', th: 'ขาว' },
  '#F59E0B': { en: 'Amber Gold', th: 'เหลืองอำพัน' },
  '#D4B996': { en: 'Warm Camel', th: 'กากีคาเมล' },
  '#111827': { en: 'Midnight Black', th: 'ดำสนิท' },
  '#4B5563': { en: 'Slate Gray', th: 'เทาสเลท' },
  '#78350F': { en: 'Mahogany', th: 'น้ำตาลมะฮอกกานี' },
  '#1E3A8A': { en: 'Navy Blue', th: 'น้ำเงินเนวี' },
  '#365314': { en: 'Olive Green', th: 'เขียวโอลีฟ' },
};

export const DEFAULT_PRODUCT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
