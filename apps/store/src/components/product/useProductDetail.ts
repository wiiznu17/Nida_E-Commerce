'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { catalogRequester } from '@/api';
import {
  useLanguage,
  getProductTitle,
  getProductSubCategory,
  getProductDescription,
} from '@/context/LanguageContext';
import type { ApiProduct, ApiProductDetail } from '@repo/types';
import type { ProductColor, ProductAccordionKey } from './productTypes';

export function useProductDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { productsList, isLoading: isCatalogLoading } = useCatalog();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  const [fetchedProduct, setFetchedProduct] = useState<ApiProductDetail | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const catalogProduct = productsList.find((p) => p.id === id || p.slug === id);
  const product: ApiProductDetail | ApiProduct | undefined = fetchedProduct ?? catalogProduct;

  useEffect(() => {
    if (
      (!fetchedProduct || !fetchedProduct.variants || fetchedProduct.variants.length === 0) &&
      id
    ) {
      let isMounted = true;
      setIsFetching(true);
      catalogRequester
        .getProductByIdOrSlug(id)
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
  }, [id, fetchedProduct]);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [openAccordion, setOpenAccordion] = useState<ProductAccordionKey | null>('details');
  const [isAdded, setIsAdded] = useState(false);

  const availableColors: ProductColor[] = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, ProductColor>();

    if (
      'variants' in product &&
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      for (const v of product.variants) {
        if (!map.has(v.colorHex)) {
          map.set(v.colorHex, {
            hex: v.colorHex,
            name: isTh && v.colorNameTh ? v.colorNameTh : v.colorName,
          });
        }
      }
    } else if (
      'colors' in product &&
      Array.isArray(product.colors) &&
      product.colors.length > 0
    ) {
      for (const c of product.colors) {
        if (typeof c === 'object' && c !== null && 'hex' in c) {
          map.set(c.hex, {
            hex: c.hex,
            name: isTh && c.nameTh ? c.nameTh : c.name,
          });
        }
      }
    }

    return map.size > 0
      ? Array.from(map.values())
      : [{ hex: '#2B1810', name: isTh ? 'มาตรฐาน' : 'Standard' }];
  }, [product, isTh]);

  useEffect(() => {
    if (product) {
      const defaultImg =
        'primaryImage' in product && typeof product.primaryImage === 'string'
          ? product.primaryImage
          : 'images' in product && Array.isArray(product.images)
            ? (product.images.find((img) => img.isPrimary)?.imageUrl ??
              product.images[0]?.imageUrl ??
              '')
            : '';
      if (defaultImg) setMainImage(defaultImg);
      if (availableColors.length > 0) {
        setSelectedColor(availableColors[0]?.name ?? (isTh ? 'มาตรฐาน' : 'Standard'));
      }
    }
  }, [product?.id, availableColors, isTh]);

  const sizes = useMemo(() => {
    if (!product) return ['S', 'M', 'L'];
    if (
      'variants' in product &&
      product.variants &&
      product.variants.length > 0
    ) {
      const uniqueSizes = Array.from(
        new Set(product.variants.map((v) => v.size).filter(Boolean)),
      );
      if (uniqueSizes.length > 0) return uniqueSizes;
    }
    const dept = (product.department || '').toLowerCase();
    if (dept === 'shoes') {
      return ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'];
    }
    const catSlug =
      'categorySlug' in product
        ? product.categorySlug
        : 'category' in product &&
            typeof product.category === 'object' &&
            product.category !== null
          ? product.category.slug
          : '';
    if (catSlug === 'bags' || dept === 'home') {
      return [isTh ? 'ไซส์เดียว' : 'ONE SIZE'];
    }
    return ['XS', 'S', 'M', 'L', 'XL'];
  }, [product, isTh]);

  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if ('images' in product && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.imageUrl && !list.includes(img.imageUrl)) {
          list.push(img.imageUrl);
        }
      }
    }
    if (
      'primaryImage' in product &&
      product.primaryImage &&
      !list.includes(product.primaryImage)
    ) {
      list.unshift(product.primaryImage);
    }
    if (
      'secondaryImage' in product &&
      product.secondaryImage &&
      !list.includes(product.secondaryImage)
    ) {
      list.push(product.secondaryImage);
    }
    return list.length > 0 ? list.slice(0, 5) : [];
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product || !('variants' in product) || !product.variants) return undefined;
    return (
      product.variants.find((v) => {
        const matchSize = v.size.toLowerCase() === selectedSize.toLowerCase();
        const matchColor =
          v.colorName.toLowerCase() === selectedColor.toLowerCase() ||
          v.colorHex.toLowerCase() === selectedColor.toLowerCase();
        return matchSize && matchColor;
      }) ?? product.variants[0]
    );
  }, [product, selectedSize, selectedColor]);

  const isWish = product ? isInWishlist(product.id) : false;
  const title = product ? getProductTitle(product, language) : '';
  const subCategory = product ? getProductSubCategory(product, language) : '';
  const description = product ? getProductDescription(product, language) : '';

  const categorySlug =
    product && 'categorySlug' in product
      ? product.categorySlug
      : product && 'category' in product && typeof product.category === 'object' && product.category !== null
        ? product.category.slug
        : 'all';

  const displayPrice = currentVariant?.price ?? product?.basePrice ?? 0;
  const displayOriginalPrice = currentVariant?.compareAtPrice ?? product?.originalPrice;

  const materialsText =
    isTh && product && 'materialsCareTh' in product && product.materialsCareTh
      ? product.materialsCareTh
      : product && 'materialsCare' in product && product.materialsCare
        ? product.materialsCare
        : isTh
          ? 'ผลิตจากเส้นใยธรรมชาติคุณภาพสูง ผ่านการคัดสรรอย่างประณีตตามมาตรฐานความยั่งยืน ซักเครื่องด้วยน้ำเย็นในโหมดถนอมผ้า ตากในที่ร่ม ห้ามใช้น้ำยาฟอกขาว'
          : '100% Certified Organic Cotton & Fine European Wool. Machine wash cold with like colors, gentle cycle. Tumble dry low or lay flat to dry. Do not bleach.';

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, currentVariant?.id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist(product.id);
    }
  };

  const handleToggleAccordion = (key: ProductAccordionKey) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const relatedProducts = product
    ? productsList
        .filter(
          (p) =>
            p.id !== product.id &&
            (p.department === product.department || p.categorySlug === categorySlug),
        )
        .slice(0, 4)
    : [];

  const activeDisplayImage = mainImage || (images[0] ?? '');

  return {
    product,
    isLoading: isCatalogLoading || isFetching,
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
    language,
    isTh,
    t,
  };
}
