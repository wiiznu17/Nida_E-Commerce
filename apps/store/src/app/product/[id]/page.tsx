'use client';

import React from 'react';
import Link from 'next/link';
import {
  ProductGallery,
  ProductInfo,
  ProductVariantSelector,
  ProductActions,
  ProductAccordions,
  ProductRecommendations,
  useProductDetail,
} from '@/components/product';

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
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 text-center font-sans">
          <div className="w-10 h-10 border-2 border-brand-brown border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">
            {t('common.loading') ?? 'Loading product...'}
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 text-center font-sans">
        <h2 className="text-2xl font-black uppercase text-brand-brown mb-3">
          {t('catalog.noProducts') ?? 'Product Not Found'}
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          {isTh
            ? 'ไม่พบสินค้าที่คุณค้นหา หรือสินค้าอาจถูกย้ายไปแล้ว'
            : 'The product you are looking for does not exist or has been moved.'}
        </p>
        <Link
          href="/collections/all"
          className="inline-flex items-center px-6 py-3 bg-brand-brown text-white text-xs font-black uppercase tracking-widest hover:bg-brand-amber transition-colors"
        >
          {isTh ? 'กลับไปหน้าคอลเลกชัน' : 'BACK TO COLLECTIONS'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-brand-brown">
          {t('product.home')}
        </Link>
        <span>/</span>
        <Link
          href={`/collections/${product.department?.toLowerCase() || 'all'}`}
          className="hover:text-brand-brown"
        >
          {subCategory.toUpperCase()}
        </Link>
        <span>/</span>
        <span className="text-brand-brown truncate max-w-xs">{title}</span>
      </div>

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
