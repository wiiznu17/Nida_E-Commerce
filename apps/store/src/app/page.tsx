'use client';

import React from 'react';
import {
  HeroBillboard,
  ValuePropsStrip,
  SplitEditorialBento,
  PromoRibbon,
  TrendingProductsSection,
  CategoryDiscoveryTiles,
  BrandStoryBanner,
} from '@/components/home';

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
