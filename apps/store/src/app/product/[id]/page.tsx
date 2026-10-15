'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { fetchProductByIdOrSlug } from '@/lib/catalogApi';
import type { StorefrontProduct } from '@repo/types';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
  getProductTag,
  getProductDescription,
} from '@/context/LanguageContext';
import {
  ChevronDown,
  Star,
  Heart,
  Truck,
  RefreshCw,
  ShieldCheck,
  Check,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { productsList, isLoading: isCatalogLoading } = useCatalog();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  const [fetchedProduct, setFetchedProduct] =
    useState<StorefrontProduct | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Match from CatalogContext or fetched directly
  const catalogProduct = productsList.find((p) => p.id === id || p.slug === id);
  const product = catalogProduct ?? fetchedProduct;

  useEffect(() => {
    if (!catalogProduct && id) {
      let isMounted = true;
      setIsFetching(true);
      fetchProductByIdOrSlug(id)
        .then((p) => {
          if (isMounted && p) setFetchedProduct(p);
        })
        .finally(() => {
          if (isMounted) setIsFetching(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [catalogProduct, id]);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const [isAdded, setIsAdded] = useState(false);

  // Available colors derived from product
  const availableColors = useMemo(() => {
    if (!product) return [];
    if (product.colorSwatches && product.colorSwatches.length > 0) {
      return product.colorSwatches.map((s) => ({
        hex: s.hex,
        name: isTh && s.nameTh ? s.nameTh : s.name,
      }));
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c, i) => ({
        hex: c,
        name:
          i === 0
            ? isTh
              ? 'สีกรมท่าคลาสสิก'
              : 'Classic Navy'
            : isTh
              ? `สีที่ ${i + 1}`
              : `Color ${i + 1}`,
      }));
    }
    return [{ hex: '#2B1810', name: isTh ? 'มาตรฐาน' : 'Standard' }];
  }, [product, isTh]);

  // Sync main image & color when product is loaded
  useEffect(() => {
    if (product) {
      if (product.image) setMainImage(product.image);
      if (availableColors.length > 0) {
        setSelectedColor(
          availableColors[0]?.name ?? (isTh ? 'มาตรฐาน' : 'Standard'),
        );
      }
    }
  }, [product?.id, availableColors, isTh]);

  // Derived sizes from variants or department defaults
  const sizes = useMemo(() => {
    if (!product) return ['S', 'M', 'L'];
    if (product.variants && product.variants.length > 0) {
      const uniqueSizes = Array.from(
        new Set(product.variants.map((v) => v.size).filter(Boolean)),
      );
      if (uniqueSizes.length > 0) return uniqueSizes;
    }
    if (product.department === 'shoes') {
      return ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'];
    }
    if (product.category === 'bags' || product.category === 'home') {
      return [isTh ? 'ไซส์เดียว' : 'ONE SIZE'];
    }
    return ['XS', 'S', 'M', 'L', 'XL'];
  }, [product, isTh]);

  // Image list
  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.secondaryImage && !list.includes(product.secondaryImage)) {
      list.push(product.secondaryImage);
    }
    if (product.images) {
      for (const img of product.images) {
        if (img.imageUrl && !list.includes(img.imageUrl)) {
          list.push(img.imageUrl);
        }
      }
    }
    return list.length > 0 ? list.slice(0, 5) : [product.image].filter(Boolean);
  }, [product]);

  if (!product) {
    if (isCatalogLoading || isFetching) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center font-sans">
          <div className="w-10 h-10 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-stone-500 font-bold">
            {t('common.loading') ?? 'Loading product...'}
          </p>
        </div>
      );
    }
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center font-sans">
        <h2 className="text-2xl font-black uppercase text-[#2B1810] mb-3">
          {t('catalog.noProducts') ?? 'Product Not Found'}
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          {isTh
            ? 'ไม่พบสินค้าที่คุณค้นหา หรือสินค้าอาจถูกย้ายไปแล้ว'
            : 'The product you are looking for does not exist or has been moved.'}
        </p>
        <Link
          href="/collections/all"
          className="inline-flex items-center px-6 py-3 bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest hover:bg-[#D97706] transition-colors"
        >
          {isTh ? 'กลับไปหน้าคอลเลกชัน' : 'BACK TO COLLECTIONS'}
        </Link>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const title = getProductTitle(product, language);
  const subCategory =
    getProductSubCategory(product, language) || product.category;
  const tag = getProductTag(product, language) || product.tag;
  const description = getProductDescription(product, language);

  const materialsText =
    isTh && product.materialsCareTh
      ? product.materialsCareTh
      : product.materialsCare
        ? product.materialsCare
        : isTh
          ? 'ผลิตจากเส้นใยธรรมชาติคุณภาพสูง ผ่านการคัดสรรอย่างประณีตตามมาตรฐานความยั่งยืน ซักเครื่องด้วยน้ำเย็นในโหมดถนอมผ้า ตากในที่ร่ม ห้ามใช้น้ำยาฟอกขาว'
          : '100% Certified Organic Cotton & Fine European Wool. Machine wash cold with like colors, gentle cycle. Tumble dry low or lay flat to dry. Do not bleach.';

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const relatedProducts = productsList
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.department === product.department ||
          p.category === product.category),
    )
    .slice(0, 4);

  const activeDisplayImage = mainImage || product.image;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-[#2B1810]">
          {t('product.home')}
        </Link>
        <span>/</span>
        <Link
          href={`/collections/${product.department?.toLowerCase() || product.category?.toLowerCase() || 'all'}`}
          className="hover:text-[#2B1810]"
        >
          {subCategory.toUpperCase()}
        </Link>
        <span>/</span>
        <span className="text-[#2B1810] truncate max-w-xs">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
        {/* Thumbnails (Left) */}
        <div className="hidden lg:flex flex-col space-y-3 col-span-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-all ${
                activeDisplayImage === img
                  ? 'border-[#2B1810] shadow-sm'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt={`${title} - ${isTh ? 'มุมที่' : 'View'} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Image Stage (Center) */}
        <div className="col-span-1 lg:col-span-6 bg-[#FAF7F2] aspect-[3/4] relative overflow-hidden border border-gray-200">
          <img
            src={activeDisplayImage}
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-500"
          />
          {tag && (
            <div className="absolute top-4 left-4 bg-[#2B1810] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-xs">
              {tag}
            </div>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white text-[#2B1810] rounded-full shadow-md transition-colors hover:text-[#D97706]"
            aria-label={t('product.saveWishlist')}
          >
            <Heart
              size={20}
              className={isWish ? 'fill-[#D97706] text-[#D97706]' : ''}
            />
          </button>
        </div>

        {/* Product Details & Actions (Right) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-start space-y-6">
          {/* Brand Flag & Category */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex w-10 h-1.5">
                <div className="w-1/3 bg-[#2B1810]"></div>
                <div className="w-1/3 bg-white border-y border-gray-200"></div>
                <div className="w-1/3 bg-[#F59E0B]"></div>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                NIDA • {subCategory}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2B1810]">
              {title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-600">
                {product.rating || 4.9} ({product.reviewsCount || 128}{' '}
                {isTh ? 'รีวิว' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Pricing with Strikethrough */}
          <div className="flex items-baseline space-x-3 pb-4 border-b border-gray-200">
            <span className="text-3xl font-black text-[#2B1810]">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-gray-400 line-through font-semibold">
                  ${product.originalPrice}
                </span>
                <span className="bg-[#D97706] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs">
                  {isTh ? 'ประหยัด ' : 'SAVE '}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  %
                </span>
              </>
            )}
          </div>

          {/* Special Promo Callout Box */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-3.5 rounded-xs flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-[#D97706]" />
              <span className="text-[#2B1810] font-bold">
                {isTh
                  ? 'ลดเพิ่ม 20% ด้วยโค้ดส่วนลด: '
                  : 'Extra 20% off with promo code: '}
                <strong className="text-[#D97706]">NIDA20</strong>
              </span>
            </div>
            <span className="text-gray-500 text-[11px] font-semibold">
              {isTh ? 'ในตะกร้า' : 'In cart'}
            </span>
          </div>

          {/* Color Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('product.selectColor')}:{' '}
                <span className="font-semibold text-gray-600">
                  {selectedColor}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {availableColors.map((col, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedColor(col.name);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColor === col.name
                      ? 'border-[#2B1810] scale-110 ring-2 ring-[#D97706]'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {selectedColor === col.name && (
                    <Check
                      size={14}
                      className={
                        col.hex === '#FFFFFF' ||
                        col.hex === '#FAF7F2' ||
                        col.hex === '#F59E0B'
                          ? 'text-black'
                          : 'text-white'
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {t('product.selectSize')}
              </span>
              <button className="text-xs font-bold text-[#2B1810] hover:text-[#D97706] underline tracking-wider">
                {t('product.sizeGuide')}
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-xs font-black tracking-wider uppercase border transition-all ${
                    selectedSize === size
                      ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#2B1810]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Bag CTA Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-black transition-all flex justify-center items-center space-x-2 shadow-lg ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2B1810] hover:bg-[#D97706] text-white hover:shadow-xl'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={18} /> <span>{t('product.added')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> <span>{t('product.addToBag')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-3 text-xs uppercase tracking-widest font-black border border-gray-300 text-[#2B1810] hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <Heart
                size={16}
                className={isWish ? 'fill-[#D97706] text-[#D97706]' : ''}
              />
              <span>
                {isWish
                  ? isTh
                    ? 'บันทึกในรายการที่ถูกใจแล้ว'
                    : 'SAVED TO WISHLIST'
                  : isTh
                    ? 'เพิ่มลงรายการที่ถูกใจ'
                    : 'ADD TO WISHLIST'}
              </span>
            </button>
          </div>

          {/* Delivery & Guarantees */}
          <div className="border-t border-gray-200 pt-6 space-y-3 text-xs text-gray-600">
            <div className="flex items-center space-x-3">
              <Truck size={18} className="text-[#D97706] flex-shrink-0" />
              <span>
                <strong>
                  {isTh ? 'จัดส่งมาตรฐานฟรี' : 'Free standard shipping'}
                </strong>{' '}
                {isTh
                  ? 'เมื่อสั่งซื้อครบ $100 ขึ้นไป พัสดุถึงภายใน 2-4 วันทำการ'
                  : 'on orders over $100. Arrives in 2-4 business days.'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw size={18} className="text-[#D97706] flex-shrink-0" />
              <span>
                <strong>
                  {isTh
                    ? 'เปลี่ยนและคืนสินค้าได้ใน 30 วัน'
                    : 'Free 30-day returns & exchanges'}
                </strong>{' '}
                {isTh
                  ? 'สะดวกสบายทั้งหน้าร้านและทางพัสดุ'
                  : 'in-store or by mail.'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck size={18} className="text-[#D97706] flex-shrink-0" />
              <span>
                <strong>
                  {isTh
                    ? 'การันตีคุณภาพของแท้ 100%'
                    : '100% Guaranteed Authentic Nida Craft'}
                </strong>{' '}
                {isTh
                  ? 'ตัดเย็บประณีตด้วยเส้นใยธรรมชาติอย่างยั่งยืน'
                  : 'with sustainable materials.'}
              </span>
            </div>
          </div>

          {/* Product Details Accordions */}
          <div className="border-t border-gray-200 pt-2">
            {/* Accordion 1: Description */}
            <div className="border-b border-gray-200">
              <button
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === 'details' ? null : 'details',
                  )
                }
                className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#2B1810]"
              >
                <span>{t('product.details')}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openAccordion === 'details' ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordion === 'details' && (
                <div className="pb-4 text-xs text-gray-600 leading-relaxed space-y-2">
                  <p>{description}</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      {isTh
                        ? 'ป้ายริบบิ้นแถบสามสีเอกลักษณ์ Nida ชายเสื้อ'
                        : 'Signature Nida tri-color flag tab on hem'}
                    </li>
                    <li>
                      {isTh
                        ? 'โครงเสื้อทรงคลาสสิก สวมใส่สบาย คล่องตัว'
                        : 'Regular classic fit with relaxed shoulders'}
                    </li>
                    <li>
                      {isTh
                        ? 'เดินด้ายประณีตทุกจุด พร้อมอะไหล่สั่งทำพิเศษ'
                        : 'Reinforced stitching and custom engraved accents'}
                    </li>
                    <li>
                      {isTh
                        ? 'คัดสรรเส้นใยธรรมชาติด้วยมาตรฐานความยั่งยืน'
                        : 'Ethically sourced natural fibres'}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 2: Materials */}
            <div className="border-b border-gray-200">
              <button
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === 'materials' ? null : 'materials',
                  )
                }
                className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#2B1810]"
              >
                <span>{t('product.materials')}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openAccordion === 'materials' ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordion === 'materials' && (
                <div className="pb-4 text-xs text-gray-600 leading-relaxed">
                  {materialsText}
                </div>
              )}
            </div>

            {/* Accordion 3: Delivery */}
            <div className="border-b border-gray-200">
              <button
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === 'delivery' ? null : 'delivery',
                  )
                }
                className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#2B1810]"
              >
                <span>{t('product.deliveryReturns')}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openAccordion === 'delivery' ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordion === 'delivery' && (
                <div className="pb-4 text-xs text-gray-600 leading-relaxed space-y-1">
                  <p>
                    {isTh
                      ? '• จัดส่งภายใน 1-3 วันทำการสำหรับกรุงเทพฯ และ 2-4 วันสำหรับต่างจังหวัด'
                      : '• Standard delivery in 2-4 business days.'}
                  </p>
                  <p>
                    {isTh
                      ? '• สามารถเปลี่ยนหรือคืนสินค้าได้ภายใน 30 วันนับจากวันที่ได้รับสินค้า โดยสินค้าต้องอยู่ในสภาพสมบูรณ์พร้อมป้ายราคา'
                      : '• 30-day exchange and return policy provided items are unworn and tags intact.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="mt-24 pt-12 border-t border-gray-200">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#D97706]">
              {isTh ? 'สินค้าคู่ควร' : 'CURATED PAIRINGS'}
            </span>
            <h2 className="text-2xl font-black uppercase text-[#2B1810] tracking-tight">
              {t('product.youMayAlsoLike')}
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="text-xs font-bold uppercase tracking-wider text-[#2B1810] hover:text-[#D97706]"
          >
            {isTh ? 'ดูทั้งหมด →' : 'VIEW ALL →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => {
            const pTitle = getProductTitle(p, language);
            const pTag = getProductTag(p, language) || p.tag;

            return (
              <Link
                href={`/product/${p.slug || p.id}`}
                key={p.id}
                className="group block bg-white"
              >
                <div className="aspect-[3/4] bg-[#FAF7F2] mb-3 overflow-hidden border border-gray-100 relative">
                  <img
                    src={p.image}
                    alt={pTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {pTag && (
                    <span className="absolute top-2 left-2 bg-[#2B1810] text-white text-[8px] font-black uppercase px-2 py-0.5">
                      {pTag}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-[#2B1810] group-hover:text-[#D97706] line-clamp-1 mb-1">
                  {pTitle}
                </h3>
                <p className="text-xs font-black text-[#2B1810]">${p.price}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
