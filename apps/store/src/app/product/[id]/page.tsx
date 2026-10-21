import React from 'react';
import type { Metadata } from 'next';
import type { ApiProductDetail } from '@repo/types';
import { ProductDetailView } from '@/components/product';
import { catalogRequester } from '@/api';

interface Props {
  params: Promise<{ id: string }>;
}

function getProductCoverImage(product: ApiProductDetail): string | undefined {
  if (product.images.length === 0) return undefined;
  const primary = product.images.find((img) => img.isPrimary);
  return primary ? primary.imageUrl : product.images[0]?.imageUrl;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await catalogRequester.getProductByIdOrSlug(id);
    if (!product) {
      return {
        title: 'Product Details | NIDA Modern Classic Apparel',
        description:
          'Explore luxury fashion, timeless prep apparel, and crafted leather at NIDA.',
      };
    }

    const title = `${product.name} | NIDA Modern Classic`;
    const description =
      product.description ||
      `Shop ${product.name} at NIDA. Meticulously tailored luxury apparel and intentional design.`;
    const coverImage = getProductCoverImage(product);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: coverImage ? [{ url: coverImage }] : [],
        siteName: 'NIDA Official Store',
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Product Details | NIDA Modern Classic Apparel',
      description:
        'Explore luxury fashion, timeless prep apparel, and crafted leather at NIDA.',
    };
  }
}

export default function ProductDetailPage() {
  return <ProductDetailView />;
}
