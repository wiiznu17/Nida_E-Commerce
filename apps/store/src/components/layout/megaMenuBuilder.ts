import type { ApiCategory } from '@repo/types';
import type {
  MegaMenuData,
  MegaMenuPromo,
  MegaMenuCategoryGroup,
  MegaMenuLink,
} from './types';

const PROMO_IMAGES: Record<string, string> = {
  women:
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  men: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  kids: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  bags: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  shoes:
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  home: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  sale: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
};

const DEPARTMENTS = [
  'women',
  'men',
  'kids',
  'bags',
  'shoes',
  'home',
  'sale',
] as const;

export function buildDynamicMegaMenu(
  language: 'th' | 'en',
  categoriesByDept: Record<string, ApiCategory[]>,
  t: (key: string, fallback?: string) => string,
): MegaMenuData {
  const isTh = language === 'th';
  const result: MegaMenuData = {};

  for (const dept of DEPARTMENTS) {
    const promo: MegaMenuPromo = {
      tag: t(`mega.${dept}Tag`, isTh ? 'คอลเลกชันใหม่' : 'NEW COLLECTION'),
      title: t(
        `mega.${dept}Title`,
        isTh ? `คอลเลกชัน ${dept}` : `${dept.toUpperCase()} Collection`,
      ),
      subtitle: t(
        `mega.${dept}Subtitle`,
        isTh
          ? 'ดีไซน์ประณีตและการตัดเย็บสไตล์ร่วมสมัย'
          : 'Timeless modern tailoring and essentials.',
      ),
      image: PROMO_IMAGES[dept] ?? PROMO_IMAGES.women,
      link: `/collections/${dept}`,
    };

    if (dept === 'sale') {
      result.sale = {
        categories: [
          {
            title: t('mega.featuredTrends', 'Featured & Trends'),
            links: [
              { label: t('nav.allProducts', 'All Products'), href: '/collections/sale' },
              { label: t('nav.women', 'Women'), href: '/collections/women?sale=true' },
              { label: t('nav.men', 'Men'), href: '/collections/men?sale=true' },
              { label: t('nav.bags', 'Bags'), href: '/collections/bags?sale=true' },
            ],
          },
        ],
        promo,
      };
      continue;
    }

    const parentCats = categoriesByDept[dept] ?? [];
    const categoryGroups: MegaMenuCategoryGroup[] = [];

    if (parentCats.length >= 2) {
      for (const parent of parentCats.slice(0, 3)) {
        const title = isTh && parent.nameTh ? parent.nameTh : parent.name;
        const links: MegaMenuLink[] = [
          {
            label: isTh ? 'ดูสินค้าทั้งหมดในหมวดนี้' : `All ${title}`,
            href: `/collections/${parent.slug}`,
          },
        ];

        if (parent.children && parent.children.length > 0) {
          for (const sub of parent.children.slice(0, 6)) {
            links.push({
              label: isTh && sub.nameTh ? sub.nameTh : sub.name,
              href: `/collections/${sub.slug}`,
            });
          }
        }

        categoryGroups.push({ title, links });
      }
    } else if (parentCats.length === 1) {
      const parent = parentCats[0];
      const parentTitle = isTh && parent.nameTh ? parent.nameTh : parent.name;
      const children = parent.children ?? [];

      categoryGroups.push({
        title: t('mega.featuredTrends', 'Featured & Trends'),
        links: [
          { label: t('nav.allProducts', 'All Products'), href: `/collections/${dept}` },
          { label: parentTitle, href: `/collections/${parent.slug}` },
        ],
      });

      if (children.length > 0) {
        const mid = Math.ceil(children.length / 2);
        const col1 = children.slice(0, mid);
        const col2 = children.slice(mid);

        categoryGroups.push({
          title: parentTitle,
          links: col1.map((c) => ({
            label: isTh && c.nameTh ? c.nameTh : c.name,
            href: `/collections/${c.slug}`,
          })),
        });

        if (col2.length > 0) {
          categoryGroups.push({
            title: t('mega.moreCategories', 'More Categories'),
            links: col2.map((c) => ({
              label: isTh && c.nameTh ? c.nameTh : c.name,
              href: `/collections/${c.slug}`,
            })),
          });
        }
      }
    } else {
      categoryGroups.push({
        title: t('mega.featuredTrends', 'Featured & Trends'),
        links: [
          { label: t('nav.allProducts', 'All Products'), href: `/collections/${dept}` },
        ],
      });
    }

    result[dept] = {
      categories: categoryGroups,
      promo,
    };
  }

  return result;
}
