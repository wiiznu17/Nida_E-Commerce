'use client';

import React from 'react';
import {
  ProductGallery,
  ProductInfo,
  ProductVariantSelector,
  ProductActions,
  ProductAccordions,
  ProductRecommendations,
  useProductDetail,
} from '@/components/product';
import { Breadcrumb, EmptyState, LoadingSpinner } from '@/components/ui';

export default function ProductDetailPage() {
  const {
    product,
    isLoading,
    title,
    subCategory,
    description,
    displayPrice,
    displayOriginalPrice,
    materialsText,
    images,
    activeDisplayImage,
    isWish,
    isAdded,
    availableColors,
    selectedColor,
    setSelectedColor,
    sizes,
    selectedSize,
    setSelectedSize,
    openAccordion,
    handleToggleAccordion,
    setMainImage,
    handleAddToCart,
    handleToggleWishlist,
    relatedProducts,
    isTh,
    t,
  } = useProductDetail();

  if (!product) {
    if (isLoading) {
      return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 font-sans">
          <LoadingSpinner size="lg" text={t('common.loading') ?? 'Loading product...'} />
        </div>
      );
    }

    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 font-sans">
        <EmptyState
          title={t('catalog.noProducts') ?? 'Product Not Found'}
          description={
            isTh
              ? 'ไม่พบสินค้าที่คุณค้นหา หรือสินค้าอาจถูกย้ายไปแล้ว'
              : 'The product you are looking for does not exist or has been moved.'
          }
          action={{
            label: isTh ? 'ดูสินค้าทั้งหมด' : 'BACK TO ALL PRODUCTS',
            href: '/search',
          }}
        />
      </div>
    );
  }

  const deptSlug = product.department?.toLowerCase();
  const breadcrumbItems = [
    { label: t('product.home'), href: '/' },
    {
      label: subCategory.toUpperCase(),
      href: deptSlug ? `/collections/${deptSlug}` : '/search',
    },
    { label: title },
  ];

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 font-sans">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
        <ProductGallery
          product={product}
          images={images}
          activeImage={activeDisplayImage}
          isWish={isWish}
          title={title}
          onSelectImage={setMainImage}
          onToggleWishlist={handleToggleWishlist}
        />

        <div className="col-span-1 lg:col-span-5 flex flex-col justify-start space-y-6">
          <ProductInfo
            product={product}
            title={title}
            subCategory={subCategory}
            displayPrice={displayPrice}
            displayOriginalPrice={displayOriginalPrice}
          />

          <ProductVariantSelector
            availableColors={availableColors}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            sizes={sizes}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
          />

          <ProductActions
            isAdded={isAdded}
            isWish={isWish}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />

          <ProductAccordions
            description={description}
            materialsText={materialsText}
            openAccordion={openAccordion}
            onToggleAccordion={handleToggleAccordion}
          />
        </div>
      </div>

      <ProductRecommendations products={relatedProducts} />
    </div>
  );
}
