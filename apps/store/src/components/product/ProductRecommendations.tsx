import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductBadge } from '@/components/ui';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import type { ApiProduct } from '@repo/types';

interface ProductRecommendationsProps {
  products: ApiProduct[];
}

export function ProductRecommendations({ products }: ProductRecommendationsProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  if (products.length === 0) return null;

  return (
    <div className="mt-24 pt-12 border-t border-gray-200">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-brand-amber">
            {isTh ? 'สินค้าคู่ควร' : 'CURATED PAIRINGS'}
          </span>
          <h2 className="text-2xl font-black uppercase text-brand-brown tracking-tight">
            {t('product.youMayAlsoLike')}
          </h2>
        </div>
        <Link
          href="/search"
          className="text-xs font-bold uppercase tracking-wider text-brand-brown hover:text-brand-amber inline-flex items-center space-x-1"
        >
          <span>{t('bento.viewAll')}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const pTitle = getProductTitle(p, language);

          return (
            <Link
              href={`/product/${p.slug || p.id}`}
              key={p.id}
              className="group block bg-white"
            >
              <div className="aspect-[3/4] bg-brand-warm-cream mb-3 overflow-hidden border border-gray-100 relative">
                {p.primaryImage ? (
                  <Image
                    src={p.primaryImage}
                    alt={pTitle}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No Image
                  </div>
                )}
                {(p.tag || p.tagTh) && (
                  <div className="absolute top-2 left-2 z-10">
                    <ProductBadge
                      tag={p.tag}
                      tagTh={p.tagTh}
                      language={language}
                      className="text-[8px] px-1.5 py-0.5"
                    />
                  </div>
                )}
              </div>
              <h3 className="text-xs font-bold text-brand-brown group-hover:text-brand-amber line-clamp-1 mb-1">
                {pTitle}
              </h3>
              <p className="text-xs font-black text-brand-brown font-mono">
                ฿{Number(p.basePrice).toLocaleString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
