import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchPageView } from '@/components/search';
import { LoadingSpinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Explore Catalog & Search Products | NIDA',
  description:
    'Discover all luxury prep apparel, tailored coats, leather goods, footwear, and lifestyle essentials from the full NIDA collection.',
  openGraph: {
    title: 'Explore Catalog & Search Products | NIDA',
    description:
      'Discover all luxury prep apparel, tailored coats, leather goods, footwear, and lifestyle essentials from the full NIDA collection.',
    siteName: 'NIDA Official Store',
    type: 'website',
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <SearchPageView />
    </Suspense>
  );
}
