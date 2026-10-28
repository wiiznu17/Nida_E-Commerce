'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCatalog } from '@/context/CatalogContext';

interface DepartmentTileConfig {
  id: string;
  labelKey: string;
  href: string;
  defaultImage: string;
}

const DEPARTMENTS: DepartmentTileConfig[] = [
  {
    id: 'women',
    labelKey: 'nav.women',
    href: '/collections/women',
    defaultImage:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'men',
    labelKey: 'nav.men',
    href: '/collections/men',
    defaultImage:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kids',
    labelKey: 'nav.kids',
    href: '/collections/kids',
    defaultImage:
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bags',
    labelKey: 'nav.bags',
    href: '/collections/bags',
    defaultImage:
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'shoes',
    labelKey: 'nav.shoes',
    href: '/collections/shoes',
    defaultImage:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fragrance',
    labelKey: 'nav.fragrance',
    href: '/collections/fragrance',
    defaultImage:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  },
];

export const CategoryDiscoveryTiles: React.FC = () => {
  const { t } = useLanguage();
  const { productsList } = useCatalog();

  return (
    <section className="bg-brand-warm-cream py-16 sm:py-20 border-t border-brand-border">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[11px] font-black tracking-[0.25em] text-brand-amber uppercase block mb-2">
            {t('home.discoverDept')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-brown uppercase tracking-tight">
            {t('home.shopByDepartment')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {DEPARTMENTS.map((dept) => {
            const dynamicProduct = productsList.find(
              (p) => p.department.toLowerCase() === dept.id && p.primaryImage,
            );
            const coverImage =
              dynamicProduct?.primaryImage ?? dept.defaultImage;

            return (
              <Link
                key={dept.id}
                href={dept.href}
                className="group relative block bg-white border border-brand-border/70 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 rounded-sm"
              >
                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden relative">
                  <img
                    src={coverImage}
                    alt={t(dept.labelKey)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== dept.defaultImage) {
                        e.currentTarget.src = dept.defaultImage;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/85 via-brand-brown/25 to-transparent flex flex-col justify-end p-4 transition-colors duration-300 group-hover:from-brand-brown/95">
                    <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wider line-clamp-1">
                      {t(dept.labelKey)}
                    </span>
                    <span className="text-white/75 text-[11px] flex items-center mt-1 font-medium group-hover:text-brand-warm-cream transition-colors">
                      {t('home.shopNow')}
                      <ChevronRight
                        size={12}
                        className="ml-0.5 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
