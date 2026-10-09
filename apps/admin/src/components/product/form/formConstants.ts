import type { SkuVariant } from '../../../data/adminData';

export const PRESET_COLORS = [
  { name: 'Nida Espresso', hex: '#2B1810' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Imperial Gold', hex: '#F59E0B' },
  { name: 'Oatmeal Beige', hex: '#D4C3B3' },
  { name: 'Noir Black', hex: '#111827' },
  { name: 'Midnight Navy', hex: '#1E293B' },
  { name: 'Burgundy Wine', hex: '#831843' },
  { name: 'Forest Olive', hex: '#365314' },
];

export const SIZE_PRESETS = {
  apparel: {
    labelEn: 'Apparel (XS - XL)',
    labelTh: 'เสื้อผ้า (XS - XL)',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  shoes: {
    labelEn: 'Shoes (US 7 - 11)',
    labelTh: 'รองเท้า (US 7 - 11)',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
  },
  onesize: {
    labelEn: 'One Size / Free Size',
    labelTh: 'ขนาดเดียว (One Size)',
    sizes: ['ONE SIZE'],
  },
};

export function getDepartmentCode(dept: string): string {
  switch (dept.toLowerCase()) {
    case 'women':
      return 'WMN';
    case 'men':
      return 'MEN';
    case 'kids':
      return 'KID';
    case 'bags':
      return 'BAG';
    case 'shoes':
      return 'SHO';
    case 'home':
      return 'HOM';
    default:
      return 'GEN';
  }
}

export function getColorName(hex: string): string {
  const match = PRESET_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  return match ? match.name : 'Custom Color';
}

export function getColorCode(hex: string): string {
  const match = PRESET_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  if (match) {
    if (match.name === 'Nida Espresso') return 'ESP';
    if (match.name === 'Pure White') return 'WHT';
    if (match.name === 'Imperial Gold') return 'GLD';
    if (match.name === 'Oatmeal Beige') return 'BGE';
    if (match.name === 'Noir Black') return 'BLK';
    if (match.name === 'Midnight Navy') return 'NVY';
    if (match.name === 'Burgundy Wine') return 'BUR';
    if (match.name === 'Forest Olive') return 'OLV';
  }
  return hex.replace('#', '').slice(0, 3).toUpperCase();
}

export function buildSkuMatrix(
  colors: string[],
  sizes: string[],
  currentSkus: SkuVariant[],
  dept: string,
): SkuVariant[] {
  const deptCode = getDepartmentCode(dept);
  const result: SkuVariant[] = [];

  for (const c of colors) {
    const cName = getColorName(c);
    const cCode = getColorCode(c);

    for (const s of sizes) {
      const existing = currentSkus.find(
        (item) => item.colorHex.toLowerCase() === c.toLowerCase() && item.size === s,
      );

      if (existing) {
        result.push({ ...existing });
      } else {
        const cleanSize = s.replace(/[^a-zA-Z0-9]/g, '');
        result.push({
          sku: `NIDA-${deptCode}-${cCode}-${cleanSize || 'STD'}`,
          size: s,
          colorName: cName,
          colorHex: c,
          stock: 0,
          lowStockThreshold: 5,
          priceAdjustment: 0,
        });
      }
    }
  }

  return result;
}
