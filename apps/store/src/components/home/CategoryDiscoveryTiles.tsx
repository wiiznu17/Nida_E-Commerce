'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const CategoryDiscoveryTiles: React.FC = () => {
  const { t } = useLanguage();

  const categories = [
    {
      title: t('home.catSweaters'),
      href: '/collections/women',
      image:
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: t('home.catPolos'),
      href: '/collections/men',
      image:
        'https://images.unsplash.com/photo-1625910513413-568b209a3c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: t('home.catBags'),
      href: '/collections/bags',
      image:
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      title: t('home.catFootwear'),
      href: '/collections/shoes',
      image:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section className="bg-brand-warm-cream py-20 border-t border-brand-border">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-12">
          <span className="text-xs font-black tracking-[0.25em] text-brand-amber uppercase block mb-2">
            {t('home.discoverDept')}
          </span>
          <h2 className="text-3xl font-black text-brand-brown uppercase tracking-tight">
            {t('home.essentialCategories')}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group block bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    {cat.title}
                  </span>
                  <span className="text-white/80 text-xs flex items-center mt-1 font-semibold group-hover:text-white">
                    {t('home.shopNow')}
                    <ChevronRight
                      size={14}
                      className="ml-1 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
