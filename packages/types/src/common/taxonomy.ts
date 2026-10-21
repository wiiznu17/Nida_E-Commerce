// @repo/types — Master Product Taxonomy Definitions

import { Department } from './enums.js';

// --- 1. Department Preset Options ---
export interface DepartmentOption {
  id: Department;
  labelEn: string;
  labelTh: string;
}

export const PRODUCT_DEPARTMENTS: DepartmentOption[] = [
  { id: Department.WOMEN, labelEn: 'Women', labelTh: 'เสื้อผ้าสตรี' },
  { id: Department.MEN, labelEn: 'Men', labelTh: 'เสื้อผ้าบุรุษ' },
  { id: Department.KIDS, labelEn: 'Kids', labelTh: 'เด็ก' },
  { id: Department.BAGS, labelEn: 'Bags', labelTh: 'กระเป๋าและเครื่องหนัง' },
  { id: Department.SHOES, labelEn: 'Shoes', labelTh: 'รองเท้า' },
  { id: Department.HOME, labelEn: 'Home & Living', labelTh: 'ของแต่งบ้าน' },
];

// --- 2. Marketing Tags Enum & Preset Options ---
export const MarketingTagKey = {
  NEW_ARRIVAL: 'NEW_ARRIVAL',
  BESTSELLER: 'BESTSELLER',
  TRENDING: 'TRENDING',
  SALE: 'SALE',
  EXCLUSIVE: 'EXCLUSIVE',
  LIMITED_EDITION: 'LIMITED_EDITION',
  PRE_ORDER: 'PRE_ORDER',
} as const;
export type MarketingTagKey =
  (typeof MarketingTagKey)[keyof typeof MarketingTagKey];

export type MarketingTag = MarketingTagKey;
export const MarketingTag = MarketingTagKey;

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
    key: MarketingTagKey.TRENDING,
    labelEn: 'TRENDING',
    labelTh: 'กำลังนิยม',
    badgeBg: '#FFF7ED',
    badgeText: '#C2410C',
    badgeBorder: '#FFEDD5',
    descriptionEn: 'High trending interest & buzz',
    descriptionTh: 'สินค้ามาแรงและได้รับความสนใจสูง',
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

export function findMarketingTagByLabel(
  labelEnOrTh?: string | null,
): MarketingTagOption | undefined {
  if (!labelEnOrTh) return undefined;
  const normalized = labelEnOrTh.trim().toUpperCase();
  const normalizedSpaces = normalized.replace(/_/g, ' ');
  const normalizedNoHyphen = normalizedSpaces.replace(/-/g, ' ');
  return MARKETING_TAGS.find(
    (t) =>
      t.key.toUpperCase() === normalized ||
      t.labelEn.toUpperCase() === normalized ||
      t.labelEn.toUpperCase() === normalizedSpaces ||
      t.labelEn.toUpperCase() === normalizedNoHyphen ||
      t.labelTh.toUpperCase() === normalized ||
      (normalized === 'NEW' && t.key === MarketingTagKey.NEW_ARRIVAL) ||
      (normalized === 'POPULAR' && t.key === MarketingTagKey.TRENDING),
  );
}

export function getMarketingTagOption(
  tag?: MarketingTagKey | string | null,
): MarketingTagOption | undefined {
  if (!tag) return undefined;
  return (
    MARKETING_TAGS.find((t) => t.key === tag) ?? findMarketingTagByLabel(tag)
  );
}
