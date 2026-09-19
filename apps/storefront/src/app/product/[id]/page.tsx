'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ChevronDown, Star, Heart, Truck, RefreshCw, ShieldCheck, Check, Sparkles, ShoppingBag } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const product = products.find((p) => p.id === id) || products[0];
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? 'Classic Navy' : 'Standard',
  );
  const [mainImage, setMainImage] = useState(product.image);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const [isAdded, setIsAdded] = useState(false);

  const sizes =
    product.department === 'shoes'
      ? ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11']
      : product.category === 'bags' || product.category === 'home'
        ? ['ONE SIZE']
        : ['XS', 'S', 'M', 'L', 'XL'];

  const isWish = isInWishlist(product.id);

  // Additional imagery
  const images = [
    product.image,
    product.secondaryImage ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.department === product.department || p.category === product.category))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-[#2B1810]">
          HOME
        </Link>
        <span>/</span>
        <Link href={`/collections/${product.department || product.category}`} className="hover:text-[#2B1810]">
          {(product.department || product.category).toUpperCase()}
        </Link>
        <span>/</span>
        <span className="text-[#2B1810] truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
        {/* Thumbnails (Left) */}
        <div className="hidden lg:flex flex-col space-y-3 col-span-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-all ${
                mainImage === img ? 'border-[#2B1810] shadow-sm' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main Image Stage (Center) */}
        <div className="col-span-1 lg:col-span-6 bg-[#FAF7F2] aspect-[3/4] relative overflow-hidden border border-gray-200">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500"
          />
          {product.tag && (
            <div className="absolute top-4 left-4 bg-[#2B1810] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-xs">
              {product.tag}
            </div>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white text-[#2B1810] rounded-full shadow-md transition-colors hover:text-[#D97706]"
            aria-label="Save to wishlist"
          >
            <Heart size={20} className={isWish ? 'fill-[#D97706] text-[#D97706]' : ''} />
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
                NIDA {product.subCategory || product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2B1810]">{product.name}</h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-600">
                {product.rating || 4.9} ({product.reviewsCount || 128} reviews)
              </span>
            </div>
          </div>

          {/* Pricing with Strikethrough */}
          <div className="flex items-baseline space-x-3 pb-4 border-b border-gray-200">
            <span className="text-3xl font-black text-[#2B1810]">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-gray-400 line-through font-semibold">${product.originalPrice}</span>
                <span className="bg-[#D97706] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs">
                  SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Special Promo Callout Box */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-3.5 rounded-xs flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-[#D97706]" />
              <span className="text-[#2B1810] font-bold">
                Extra 20% off with promo code: <strong className="text-[#D97706]">NIDA20</strong>
              </span>
            </div>
            <span className="text-gray-500 text-[11px] font-semibold">In cart</span>
          </div>

          {/* Color Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                COLOR: <span className="font-semibold text-gray-600">{selectedColor}</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {(product.colors || ['#2B1810', '#FFFFFF', '#F59E0B']).map((col, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i === 0 ? 'Espresso Brown' : i === 1 ? 'Ivory White' : 'Honey Gold')}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColor.includes(i === 0 ? 'Brown' : i === 1 ? 'White' : 'Gold')
                      ? 'border-[#2B1810] scale-110 ring-2 ring-[#D97706]'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col }}
                  title={`Color variant ${i + 1}`}
                >
                  {selectedColor.includes(i === 0 ? 'Brown' : i === 1 ? 'White' : 'Gold') && (
                    <Check size={14} className={col === '#FFFFFF' || col === '#F59E0B' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">SELECT SIZE</span>
              <button className="text-xs font-bold text-[#2B1810] hover:text-[#D97706] underline tracking-wider">
                SIZE GUIDE
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
                isAdded ? 'bg-emerald-600 text-white' : 'bg-[#2B1810] hover:bg-[#D97706] text-white hover:shadow-xl'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={18} /> <span>ADDED TO YOUR SHOPPING BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> <span>ADD TO BAG</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-3 text-xs uppercase tracking-widest font-black border border-gray-300 text-[#2B1810] hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <Heart size={16} className={isWish ? 'fill-[#D97706] text-[#D97706]' : ''} />
              <span>{isWish ? 'SAVED TO WISHLIST' : 'ADD TO WISHLIST'}</span>
            </button>
          </div>

          {/* Delivery & Guarantees */}
          <div className="border-t border-gray-200 pt-6 space-y-3 text-xs text-gray-600">
            <div className="flex items-center space-x-3">
              <Truck size={18} className="text-[#D97706] flex-shrink-0" />
              <span>
                <strong>Free standard shipping</strong> on orders over $100. Arrives in 2-4 business days.
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw size={18} className="text-[#D97706] flex-shrink-0" />
              <span>
                <strong>Free 30-day returns & exchanges</strong> in-store or by mail.
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck size={18} className="text-[#D97706] flex-shrink-0" />
              <span>
                <strong>100% Guaranteed Authentic Nida Craft</strong> with sustainable materials.
              </span>
            </div>
          </div>

          {/* Product Details Accordions */}
          <div className="border-t border-gray-200 pt-2">
            {/* Accordion 1: Description */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#2B1810]"
              >
                <span>PRODUCT DETAILS & FIT</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openAccordion === 'details' ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordion === 'details' && (
                <div className="pb-4 text-xs text-gray-600 leading-relaxed space-y-2">
                  <p>
                    Reinventing collegiate classic style with premium natural yarns and thoughtful tailoring. Designed
                    for comfort, versatility, and lasting durability through repeated wear.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Signature Nida tri-color flag tab on hem</li>
                    <li>Regular classic fit with relaxed shoulders</li>
                    <li>Reinforced stitching and custom engraved buttons</li>
                    <li>Ethically sourced natural fibres</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 2: Materials */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                className="w-full py-4 flex justify-between items-center text-xs font-black uppercase tracking-wider text-[#2B1810]"
              >
                <span>MATERIALS & CARE</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openAccordion === 'materials' ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordion === 'materials' && (
                <div className="pb-4 text-xs text-gray-600 leading-relaxed">
                  100% Certified Organic Cotton & Fine European Wool. Machine wash cold with like colors, gentle cycle.
                  Tumble dry low or lay flat to dry. Do not bleach.
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
            <span className="text-xs font-black uppercase tracking-widest text-[#D97706]">CURATED PAIRINGS</span>
            <h2 className="text-2xl font-black uppercase text-[#2B1810] tracking-tight">YOU MAY ALSO LIKE</h2>
          </div>
          <Link
            href="/collections/all"
            className="text-xs font-bold uppercase tracking-wider text-[#2B1810] hover:text-[#D97706]"
          >
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <Link href={`/product/${p.id}`} key={p.id} className="group block bg-white">
              <div className="aspect-[3/4] bg-[#FAF7F2] mb-3 overflow-hidden border border-gray-100 relative">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {p.tag && (
                  <span className="absolute top-2 left-2 bg-[#2B1810] text-white text-[8px] font-black uppercase px-2 py-0.5">
                    {p.tag}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-[#2B1810] group-hover:text-[#D97706] line-clamp-1 mb-1">
                {p.name}
              </h3>
              <p className="text-xs font-black text-[#2B1810]">${p.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
