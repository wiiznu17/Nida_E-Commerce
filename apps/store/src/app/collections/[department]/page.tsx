import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CollectionDepartmentView } from '@/components/collection';
import { LoadingSpinner } from '@/components/ui';

interface Props {
  params: Promise<{ department: string }>;
}

const DEPARTMENT_METADATA_MAP: Record<
  string,
  { title: string; description: string }
> = {
  men: {
    title: "Men's Luxury Collection — Timeless Prep & Modern Classic",
    description:
      "Explore NIDA's curated Men's luxury apparel, tailored jackets, knitwear, and essential prep wear.",
  },
  women: {
    title: "Women's Collection — Refined Elegance & Heritage Craft",
    description:
      "Discover the NIDA Women's collection. Beautifully draped dresses, intentional silhouettes, and timeless essentials.",
  },
  shoes: {
    title: 'Footwear & Loafers — Handcrafted Luxury Shoes',
    description:
      'Step into artisanal craftsmanship with NIDA leather footwear, Belgian loafers, and heritage boots.',
  },
  bags: {
    title: 'Leather Bags & Small Leather Goods — NIDA Handcrafted',
    description:
      'Artisanal leather totes, structured bags, and timeless leather goods crafted with durable precision.',
  },
  home: {
    title: 'Home & Living — Modern Classic Lifestyle',
    description:
      'Curated lifestyle essentials, artisanal ceramics, and cozy textures designed to enrich your sanctuary.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { department } = await params;
  const normalized = department.toLowerCase();
  const info = DEPARTMENT_METADATA_MAP[normalized] ?? {
    title: `${department.charAt(0).toUpperCase() + department.slice(1)} Collection — NIDA Apparel`,
    description: `Shop the latest ${department} collection at NIDA. Intentional craftsmanship and modern classic luxury.`,
  };

  return {
    title: `${info.title} | NIDA`,
    description: info.description,
    openGraph: {
      title: `${info.title} | NIDA`,
      description: info.description,
      siteName: 'NIDA Official Store',
      type: 'website',
    },
  };
}

export default function CollectionDepartmentPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <CollectionDepartmentView />
    </Suspense>
  );
}
