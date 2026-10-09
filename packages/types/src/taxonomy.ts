// ====================================================
// @repo/types — Product Taxonomy Enums & Lookup Tables
// ====================================================

// --- 1. Department Enum & Types ---
export const ProductDepartment = {
  WOMEN: 'women',
  MEN: 'men',
  KIDS: 'kids',
  BAGS: 'bags',
  SHOES: 'shoes',
  HOME: 'home',
} as const;
export type ProductDepartment = (typeof ProductDepartment)[keyof typeof ProductDepartment];

// --- 2. Category Enum & Types ---
export const ProductCategory = {
  APPAREL: 'apparel',
  BAGS: 'bags',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories',
  HOME: 'home',
} as const;
export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

// --- 3. Sub-Category Enum & Types ---
export const ProductSubCategory = {
  // Apparel
  SWEATERS_AND_KNITS: 'SWEATERS_AND_KNITS',
  COATS_AND_JACKETS: 'COATS_AND_JACKETS',
  SHIRTS_AND_TOPS: 'SHIRTS_AND_TOPS',
  POLOS_AND_TSHIRTS: 'POLOS_AND_TSHIRTS',
  DRESSES: 'DRESSES',
  DENIM_AND_PANTS: 'DENIM_AND_PANTS',
  PANTS_AND_SHORTS: 'PANTS_AND_SHORTS',
  OUTERWEAR: 'OUTERWEAR',
  POLOS_AND_TEES: 'POLOS_AND_TEES',

  // Bags
  CROSSBODY_BAGS: 'CROSSBODY_BAGS',
  TRAVEL_AND_DUFFLES: 'TRAVEL_AND_DUFFLES',
  TOTES_AND_BACKPACKS: 'TOTES_AND_BACKPACKS',
  WALLETS_AND_CARDHOLDERS: 'WALLETS_AND_CARDHOLDERS',

  // Shoes
  SNEAKERS: 'SNEAKERS',
  DRESS_SHOES: 'DRESS_SHOES',
  LOAFERS_AND_BOOTS: 'LOAFERS_AND_BOOTS',

  // Accessories
  HATS_AND_CAPS: 'HATS_AND_CAPS',
  BELTS: 'BELTS',
  SCARVES_AND_ACCESSORIES: 'SCARVES_AND_ACCESSORIES',

  // Home & Living
  BATH_AND_BEDDING: 'BATH_AND_BEDDING',
  HOME_FRAGRANCE: 'HOME_FRAGRANCE',
  TABLEWARE_AND_LIVING: 'TABLEWARE_AND_LIVING',
} as const;
export type ProductSubCategory = (typeof ProductSubCategory)[keyof typeof ProductSubCategory];

// --- 4. Marketing Tag Enum & Types ---
export const MarketingTagKey = {
  NEW_ARRIVAL: 'NEW_ARRIVAL',
  BESTSELLER: 'BESTSELLER',
  SALE: 'SALE',
  EXCLUSIVE: 'EXCLUSIVE',
  LIMITED_EDITION: 'LIMITED_EDITION',
  PRE_ORDER: 'PRE_ORDER',
} as const;
export type MarketingTagKey = (typeof MarketingTagKey)[keyof typeof MarketingTagKey];

// --- 5. Taxonomy Metadata Interfaces ---
export interface DepartmentOption {
  id: ProductDepartment;
  labelEn: string;
  labelTh: string;
  allowedCategories: ProductCategory[];
}

export interface CategoryOption {
  id: ProductCategory;
  labelEn: string;
  labelTh: string;
}

export interface SubCategoryOption {
  key: ProductSubCategory;
  category: ProductCategory;
  labelEn: string;
  labelTh: string;
  departments?: ProductDepartment[];
}

export interface MarketingTagOption {
  key: MarketingTagKey;
  labelEn: string;
  labelTh: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  descriptionEn?: string;
  descriptionTh?: string;
}

// --- 6. Predefined Master Taxonomy Data ---
export const PRODUCT_DEPARTMENTS: DepartmentOption[] = [
  {
    id: ProductDepartment.WOMEN,
    labelEn: 'Women',
    labelTh: 'เสื้อผ้าสตรี (Women)',
    allowedCategories: [
      ProductCategory.APPAREL,
      ProductCategory.BAGS,
      ProductCategory.SHOES,
      ProductCategory.ACCESSORIES,
    ],
  },
  {
    id: ProductDepartment.MEN,
    labelEn: 'Men',
    labelTh: 'เสื้อผ้าบุรุษ (Men)',
    allowedCategories: [
      ProductCategory.APPAREL,
      ProductCategory.BAGS,
      ProductCategory.SHOES,
      ProductCategory.ACCESSORIES,
    ],
  },
  {
    id: ProductDepartment.KIDS,
    labelEn: 'Kids',
    labelTh: 'เด็ก (Kids)',
    allowedCategories: [
      ProductCategory.APPAREL,
      ProductCategory.BAGS,
      ProductCategory.SHOES,
      ProductCategory.ACCESSORIES,
    ],
  },
  {
    id: ProductDepartment.BAGS,
    labelEn: 'Bags',
    labelTh: 'กระเป๋าและเครื่องหนัง (Bags)',
    allowedCategories: [ProductCategory.BAGS, ProductCategory.ACCESSORIES],
  },
  {
    id: ProductDepartment.SHOES,
    labelEn: 'Shoes',
    labelTh: 'รองเท้า (Shoes)',
    allowedCategories: [ProductCategory.SHOES, ProductCategory.ACCESSORIES],
  },
  {
    id: ProductDepartment.HOME,
    labelEn: 'Home & Living',
    labelTh: 'ของแต่งบ้าน (Home & Living)',
    allowedCategories: [ProductCategory.HOME],
  },
];

export const PRODUCT_CATEGORIES: CategoryOption[] = [
  { id: ProductCategory.APPAREL, labelEn: 'Apparel', labelTh: 'เครื่องแต่งกาย (Apparel)' },
  { id: ProductCategory.BAGS, labelEn: 'Bags', labelTh: 'กระเป๋า (Bags)' },
  { id: ProductCategory.SHOES, labelEn: 'Shoes', labelTh: 'รองเท้า (Shoes)' },
  { id: ProductCategory.ACCESSORIES, labelEn: 'Accessories', labelTh: 'เครื่องประดับ (Accessories)' },
  { id: ProductCategory.HOME, labelEn: 'Home & Living', labelTh: 'ของใช้ในบ้าน (Home & Living)' },
];

export const PRODUCT_SUB_CATEGORIES: SubCategoryOption[] = [
  // --- APPAREL ---
  {
    key: ProductSubCategory.SWEATERS_AND_KNITS,
    category: ProductCategory.APPAREL,
    labelEn: 'Sweaters & Knits',
    labelTh: 'สเวตเตอร์และเสื้อไหมพรม',
    departments: [ProductDepartment.WOMEN, ProductDepartment.MEN],
  },
  {
    key: ProductSubCategory.COATS_AND_JACKETS,
    category: ProductCategory.APPAREL,
    labelEn: 'Coats & Jackets',
    labelTh: 'เสื้อโค้ทและแจ็คเก็ต',
    departments: [ProductDepartment.WOMEN, ProductDepartment.MEN],
  },
  {
    key: ProductSubCategory.SHIRTS_AND_TOPS,
    category: ProductCategory.APPAREL,
    labelEn: 'Shirts & Tops',
    labelTh: 'เสื้อเชิ้ตและเสื้อท็อป',
    departments: [ProductDepartment.WOMEN, ProductDepartment.MEN],
  },
  {
    key: ProductSubCategory.POLOS_AND_TSHIRTS,
    category: ProductCategory.APPAREL,
    labelEn: 'Polos & T-Shirts',
    labelTh: 'เสื้อโปโลและเสื้อยืด',
    departments: [ProductDepartment.WOMEN, ProductDepartment.MEN],
  },
  {
    key: ProductSubCategory.DRESSES,
    category: ProductCategory.APPAREL,
    labelEn: 'Dresses',
    labelTh: 'เดรสและชุดกระโปรง',
    departments: [ProductDepartment.WOMEN, ProductDepartment.KIDS],
  },
  {
    key: ProductSubCategory.DENIM_AND_PANTS,
    category: ProductCategory.APPAREL,
    labelEn: 'Denim & Pants',
    labelTh: 'เดนิมและกางเกงขายาว',
    departments: [ProductDepartment.WOMEN, ProductDepartment.MEN],
  },
  {
    key: ProductSubCategory.PANTS_AND_SHORTS,
    category: ProductCategory.APPAREL,
    labelEn: 'Pants & Shorts',
    labelTh: 'กางเกงขายาวและขาสั้น',
    departments: [ProductDepartment.WOMEN, ProductDepartment.MEN],
  },
  {
    key: ProductSubCategory.OUTERWEAR,
    category: ProductCategory.APPAREL,
    labelEn: 'Outerwear',
    labelTh: 'เสื้อคลุมและแจ็คเก็ตเด็ก',
    departments: [ProductDepartment.KIDS],
  },
  {
    key: ProductSubCategory.POLOS_AND_TEES,
    category: ProductCategory.APPAREL,
    labelEn: 'Polos & Tees',
    labelTh: 'เสื้อโปโลและเสื้อยืดเด็ก',
    departments: [ProductDepartment.KIDS],
  },

  // --- BAGS ---
  {
    key: ProductSubCategory.CROSSBODY_BAGS,
    category: ProductCategory.BAGS,
    labelEn: 'Crossbody Bags',
    labelTh: 'กระเป๋าสะพายข้าง',
  },
  {
    key: ProductSubCategory.TRAVEL_AND_DUFFLES,
    category: ProductCategory.BAGS,
    labelEn: 'Travel & Duffles',
    labelTh: 'กระเป๋าเดินทางและดัฟเฟิล',
  },
  {
    key: ProductSubCategory.TOTES_AND_BACKPACKS,
    category: ProductCategory.BAGS,
    labelEn: 'Totes & Backpacks',
    labelTh: 'กระเป๋าโท้ทและเป้',
  },
  {
    key: ProductSubCategory.WALLETS_AND_CARDHOLDERS,
    category: ProductCategory.BAGS,
    labelEn: 'Wallets & Cardholders',
    labelTh: 'กระเป๋าสตางค์และที่ใส่บัตร',
  },

  // --- SHOES ---
  {
    key: ProductSubCategory.SNEAKERS,
    category: ProductCategory.SHOES,
    labelEn: 'Sneakers',
    labelTh: 'รองเท้าสนีกเกอร์',
  },
  {
    key: ProductSubCategory.DRESS_SHOES,
    category: ProductCategory.SHOES,
    labelEn: 'Dress Shoes',
    labelTh: 'รองเท้าหนังทางการ',
  },
  {
    key: ProductSubCategory.LOAFERS_AND_BOOTS,
    category: ProductCategory.SHOES,
    labelEn: 'Loafers & Boots',
    labelTh: 'รองเท้าโลฟเฟอร์และบูท',
  },

  // --- ACCESSORIES ---
  {
    key: ProductSubCategory.HATS_AND_CAPS,
    category: ProductCategory.ACCESSORIES,
    labelEn: 'Hats & Caps',
    labelTh: 'หมวกและหมวกแก๊ป',
  },
  {
    key: ProductSubCategory.BELTS,
    category: ProductCategory.ACCESSORIES,
    labelEn: 'Belts',
    labelTh: 'เข็มขัด',
  },
  {
    key: ProductSubCategory.SCARVES_AND_ACCESSORIES,
    category: ProductCategory.ACCESSORIES,
    labelEn: 'Scarves & Small Accessories',
    labelTh: 'ผ้าพันคอและเครื่องประดับชิ้นเล็ก',
  },

  // --- HOME ---
  {
    key: ProductSubCategory.BATH_AND_BEDDING,
    category: ProductCategory.HOME,
    labelEn: 'Bath & Bedding',
    labelTh: 'เครื่องนอนและห้องน้ำ',
  },
  {
    key: ProductSubCategory.HOME_FRAGRANCE,
    category: ProductCategory.HOME,
    labelEn: 'Home Fragrance',
    labelTh: 'เครื่องหอมและตกแต่งบ้าน',
  },
  {
    key: ProductSubCategory.TABLEWARE_AND_LIVING,
    category: ProductCategory.HOME,
    labelEn: 'Tableware & Living',
    labelTh: 'จานชามและของแต่งบ้าน',
  },
];

// --- 6. Helper Query Utilities ---
export function getSubCategoriesFor(category?: string, department?: string): SubCategoryOption[] {
  return PRODUCT_SUB_CATEGORIES.filter((sub) => {
    if (category && sub.category !== category) return false;
    if (department && sub.departments && !sub.departments.includes(department as ProductDepartment)) {
      return false;
    }
    return true;
  });
}

export function findSubCategoryByKey(key: string): SubCategoryOption | undefined {
  return PRODUCT_SUB_CATEGORIES.find((s) => s.key === key);
}

export function findSubCategoryByLabel(labelEnOrTh: string): SubCategoryOption | undefined {
  const normalized = labelEnOrTh.trim().toLowerCase();
  return PRODUCT_SUB_CATEGORIES.find(
    (s) =>
      s.labelEn.toLowerCase() === normalized ||
      s.labelTh.toLowerCase() === normalized ||
      s.key.toLowerCase() === normalized,
  );
}

export function isValidSubCategory(labelOrKey: string): boolean {
  return Boolean(findSubCategoryByLabel(labelOrKey));
}

// --- 7. Master Marketing Tags Data & Helpers ---
export const MARKETING_TAGS: MarketingTagOption[] = [
  {
    key: MarketingTagKey.NEW_ARRIVAL,
    labelEn: 'NEW ARRIVAL',
    labelTh: 'สินค้าใหม่',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
    badgeBorder: '#A7F3D0',
    descriptionEn: 'Recently launched new styles',
    descriptionTh: 'สินค้าคอลเลกชันล่าสุด',
  },
  {
    key: MarketingTagKey.BESTSELLER,
    labelEn: 'BESTSELLER',
    labelTh: 'สินค้าขายดี',
    badgeBg: '#FFFBEB',
    badgeText: '#B45309',
    badgeBorder: '#FDE68A',
    descriptionEn: 'High demand & customer favorite',
    descriptionTh: 'สินค้ายอดนิยมประจำฤดูกาล',
  },
  {
    key: MarketingTagKey.SALE,
    labelEn: 'SALE',
    labelTh: 'ลดราคาพิเศษ',
    badgeBg: '#FEF2F2',
    badgeText: '#991B1B',
    badgeBorder: '#FECACA',
    descriptionEn: 'Special promotional pricing',
    descriptionTh: 'สินค้าลดราคาโปรโมชัน',
  },
  {
    key: MarketingTagKey.EXCLUSIVE,
    labelEn: 'EXCLUSIVE',
    labelTh: 'คอลเลกชันพิเศษ',
    badgeBg: '#F5F3FF',
    badgeText: '#5B21B6',
    badgeBorder: '#DDD6FE',
    descriptionEn: 'Brand exclusive signature piece',
    descriptionTh: 'สินค้าเอกสิทธิ์เฉพาะ NIDA',
  },
  {
    key: MarketingTagKey.LIMITED_EDITION,
    labelEn: 'LIMITED EDITION',
    labelTh: 'จำนวนจำกัด',
    badgeBg: '#2B1810',
    badgeText: '#F59E0B',
    badgeBorder: '#D97706',
    descriptionEn: 'Strictly limited manufacturing run',
    descriptionTh: 'ผลิตจำนวนจำกัดพิเศษ',
  },
  {
    key: MarketingTagKey.PRE_ORDER,
    labelEn: 'PRE-ORDER',
    labelTh: 'เปิดพรีออเดอร์',
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    badgeBorder: '#BFDBFE',
    descriptionEn: 'Advance ordering before official release',
    descriptionTh: 'สั่งจองล่วงหน้าก่อนวางจำหน่าย',
  },
];

export function findMarketingTagByKey(key: string): MarketingTagOption | undefined {
  return MARKETING_TAGS.find((t) => t.key === key);
}

export function findMarketingTagByLabel(labelEnOrTh: string): MarketingTagOption | undefined {
  const normalized = labelEnOrTh.trim().toUpperCase();
  return MARKETING_TAGS.find(
    (t) =>
      t.labelEn.toUpperCase() === normalized ||
      t.labelTh.toUpperCase() === normalized ||
      t.key.toUpperCase() === normalized,
  );
}
