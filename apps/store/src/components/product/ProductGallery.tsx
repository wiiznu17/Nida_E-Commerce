import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { ProductBadge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiProduct, ApiProductDetail } from '@repo/types';

interface ProductGalleryProps {
  product: ApiProduct | ApiProductDetail;
  images: string[];
  activeImage: string;
  isWish: boolean;
  title: string;
  onSelectImage: (img: string) => void;
  onToggleWishlist: () => void;
}

export function ProductGallery({
  product,
  images,
  activeImage,
  isWish,
  title,
  onSelectImage,
  onToggleWishlist,
}: ProductGalleryProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  return (
    <div className="col-span-1 lg:col-span-7 grid grid-cols-1 lg:grid-cols-7 gap-4">
      {/* Thumbnails (Left) */}
      <div className="hidden lg:flex flex-col space-y-3 col-span-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectImage(img)}
            className={`aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-all relative cursor-pointer ${
              activeImage === img
                ? 'border-brand-brown shadow-2xs'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <Image
              src={img}
              alt={`${title} - ${isTh ? 'มุมที่' : 'View'} ${idx + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image Stage */}
      <div className="col-span-1 lg:col-span-6 bg-brand-warm-cream aspect-[3/4] relative overflow-hidden border border-gray-200">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}

        {(product.tag || product.tagTh) && (
          <div className="absolute top-4 left-4 z-10">
            <ProductBadge
              tag={product.tag}
              tagTh={product.tagTh}
              language={language}
              className="text-[10px] px-3 py-1"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleWishlist}
          className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white text-brand-brown rounded-full shadow-md transition-colors hover:text-brand-amber cursor-pointer z-10"
          aria-label={t('product.saveWishlist')}
        >
          <Heart
            size={20}
            className={isWish ? 'fill-brand-amber text-brand-amber' : ''}
          />
        </button>
      </div>
    </div>
  );
}
