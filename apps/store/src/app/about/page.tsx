import React from 'react';
import type { Metadata } from 'next';
import { AboutContentView } from '@/components/about';

export const metadata: Metadata = {
  title: 'Our Story & Heritage — NIDA Modern Classic Apparel',
  description:
    'Discover the intentional design, heritage craftsmanship, and unwavering spirit behind NIDA. Founded with a commitment to sustainable natural fibers and timeless elegance.',
  openGraph: {
    title: 'Our Story & Heritage — NIDA Modern Classic Apparel',
    description:
      'Discover the intentional design, heritage craftsmanship, and unwavering spirit behind NIDA.',
    siteName: 'NIDA Official Store',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContentView />;
}
