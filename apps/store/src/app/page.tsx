import React from 'react';
import type { Metadata } from 'next';
import {
  HeroBillboard,
  ValuePropsStrip,
  SplitEditorialBento,
  PromoRibbon,
  TrendingProductsSection,
  CategoryDiscoveryTiles,
  BrandStoryBanner,
} from '@/components/home';

export const metadata: Metadata = {
  title: 'NIDA — Modern Classic Apparel & Luxury Lifestyle',
  description:
    'Explore curated luxury fashion, timeless prep essentials, crafted leather bags, and intentional apparel designed for the modern wardrobe.',
  openGraph: {
    title: 'NIDA — Modern Classic Apparel & Luxury Lifestyle',
    description:
      'Explore curated luxury fashion, timeless prep essentials, crafted leather bags, and intentional apparel.',
    siteName: 'NIDA Official Store',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="w-full bg-white font-sans">
      <HeroBillboard />
      <ValuePropsStrip />
      <SplitEditorialBento />
      <PromoRibbon />
      <TrendingProductsSection />
      <CategoryDiscoveryTiles />
      <BrandStoryBanner />
    </div>
  );
}
