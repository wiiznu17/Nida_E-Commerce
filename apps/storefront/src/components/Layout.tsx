'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  User,
  ShoppingBag,
  X,
  Heart,
  ChevronDown,
  MapPin,
  HelpCircle,
  ArrowRight,
  Menu,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  Star,
  Globe,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { products } from '../data/products';

// Signature tri-color emblem: Brown, White, Yellow
export function NidaLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="flex items-center space-x-2">
        <span className={`font-sans font-black tracking-[0.25em] text-[#2B1810] uppercase ${textSize}`}>NIDA</span>
      </div>
      {/* Signature Ribbon / Flag emblem in Brown, White, Yellow */}
      <div className="flex w-14 h-1.5 mt-0.5 rounded-xs overflow-hidden shadow-xs">
        <div className="w-1/3 bg-[#2B1810]"></div>
        <div className="w-1/3 bg-white border-y border-[#EAE3D9]"></div>
        <div className="w-1/3 bg-[#F59E0B]"></div>
      </div>
    </div>
  );
}

// Mega Menu Department Data
const MEGA_MENU_DATA: Record<
  string,
  {
    categories: { title: string; links: { label: string; href: string }[] }[];
    promo: { title: string; subtitle: string; tag: string; image: string; link: string };
  }
> = {
  women: {
    categories: [
      {
        title: 'Featured & Trends',
        links: [
          { label: 'New Arrivals', href: '/collections/women' },
          { label: 'Best Sellers', href: '/collections/women' },
          { label: 'The Cable-Knit Series', href: '/collections/women' },
          { label: 'Autumn / Winter 2026', href: '/collections/women' },
          { label: 'Sustainable Essentials', href: '/collections/women' },
        ],
      },
      {
        title: 'Clothing',
        links: [
          { label: 'Coats & Jackets', href: '/collections/women' },
          { label: 'Sweaters & Cardigans', href: '/collections/women' },
          { label: 'Polos & T-Shirts', href: '/collections/women' },
          { label: 'Shirts & Blouses', href: '/collections/women' },
          { label: 'Denim & Trousers', href: '/collections/women' },
          { label: 'Dresses & Skirts', href: '/collections/women' },
        ],
      },
      {
        title: 'Shoes & Accessories',
        links: [
          { label: 'Leather Crossbody Bags', href: '/collections/bags' },
          { label: 'Tote & Shoulder Bags', href: '/collections/bags' },
          { label: 'Court Sneakers', href: '/collections/shoes' },
          { label: 'Loafers & Flats', href: '/collections/shoes' },
          { label: 'Belts & Wallets', href: '/collections/accessories' },
        ],
      },
    ],
    promo: {
      tag: 'NEW SEASON EDIT',
      title: "Women's Autumn Collection",
      subtitle: 'Modern preppy silhouettes reimagined with luxe sustainable wools.',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      link: '/collections/women',
    },
  },
  men: {
    categories: [
      {
        title: 'Featured & Trends',
        links: [
          { label: 'New Arrivals', href: '/collections/men' },
          { label: 'Signature Polos', href: '/collections/men' },
          { label: 'Collegiate Prep Edit', href: '/collections/men' },
          { label: 'Heritage Outerwear', href: '/collections/men' },
          { label: 'Online Exclusives', href: '/collections/men' },
        ],
      },
      {
        title: 'Clothing',
        links: [
          { label: 'Pique & Oxford Polos', href: '/collections/men' },
          { label: 'Button-Down Shirts', href: '/collections/men' },
          { label: 'Jackets & Windbreakers', href: '/collections/men' },
          { label: 'Varsity & Bombers', href: '/collections/men' },
          { label: 'Chinos & Shorts', href: '/collections/men' },
          { label: 'Classic Denim', href: '/collections/men' },
        ],
      },
      {
        title: 'Shoes & Accessories',
        links: [
          { label: 'Leather Court Sneakers', href: '/collections/shoes' },
          { label: 'Penny Loafers', href: '/collections/shoes' },
          { label: 'Weekender Duffle Bags', href: '/collections/bags' },
          { label: 'Logo Twill Caps', href: '/collections/accessories' },
          { label: 'Reversible Belts', href: '/collections/accessories' },
        ],
      },
    ],
    promo: {
      tag: 'HERITAGE CLASSIC',
      title: "Men's Iconic Polos & Knits",
      subtitle: 'Premium pique and varsity tailoring built for everyday distinction.',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      link: '/collections/men',
    },
  },
  kids: {
    categories: [
      {
        title: 'Boys & Girls',
        links: [
          { label: 'All Kids Clothing', href: '/collections/kids' },
          { label: 'Boys Signature Polos', href: '/collections/kids' },
          { label: 'Girls Dresses & Skorts', href: '/collections/kids' },
          { label: 'Kids Windbreakers', href: '/collections/kids' },
          { label: 'Colorblock Hoodies', href: '/collections/kids' },
        ],
      },
      {
        title: 'Accessories & Shoes',
        links: [
          { label: 'Kids School Backpacks', href: '/collections/kids' },
          { label: 'Retro Mini Sneakers', href: '/collections/kids' },
          { label: 'Kids Caps & Hats', href: '/collections/kids' },
        ],
      },
    ],
    promo: {
      tag: 'MINI PREP',
      title: 'Kids Classic Collection',
      subtitle: 'Comfortable, durable designs inspired by our iconic heritage.',
      image:
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      link: '/collections/kids',
    },
  },
  bags: {
    categories: [
      {
        title: 'Bags by Style',
        links: [
          { label: 'All Bags', href: '/collections/bags' },
          { label: 'Signature Crossbody', href: '/collections/bags' },
          { label: 'Weekender & Duffle Bags', href: '/collections/bags' },
          { label: 'Work & Laptop Totes', href: '/collections/bags' },
        ],
      },
      {
        title: 'Small Leather Goods',
        links: [
          { label: 'Pebble Leather Wallets', href: '/collections/bags' },
          { label: 'Slim Cardholders', href: '/collections/bags' },
          { label: 'Luggage Tags & Pouches', href: '/collections/bags' },
        ],
      },
    ],
    promo: {
      tag: 'CRAFTSMANSHIP',
      title: 'Heritage Leather Collection',
      subtitle: 'Supple full-grain leather paired with custom palladium hardware.',
      image:
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      link: '/collections/bags',
    },
  },
  home: {
    categories: [
      {
        title: 'Bed & Bath',
        links: [
          { label: 'Organic Striped Towels', href: '/collections/home' },
          { label: 'Waffle Knit Throws', href: '/collections/home' },
          { label: 'Linen Pillow Covers', href: '/collections/home' },
        ],
      },
      {
        title: 'Home Fragrance & Décor',
        links: [
          { label: 'Artisan Hinoki Candles', href: '/collections/home' },
          { label: 'Ceramic Tableware & Vases', href: '/collections/home' },
          { label: 'Home Living Objects', href: '/collections/home' },
        ],
      },
    ],
    promo: {
      tag: 'INTENTIONAL LIVING',
      title: 'Nida Home & Décor',
      subtitle: 'Calm, architectural elegance for your personal sanctuary.',
      image:
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      link: '/collections/home',
    },
  },
  sale: {
    categories: [
      {
        title: 'Shop Sale By Category',
        links: [
          { label: "Women's Sale (Up to 50% Off)", href: '/collections/sale' },
          { label: "Men's Sale (Up to 50% Off)", href: '/collections/sale' },
          { label: 'Bags & Shoes Sale', href: '/collections/sale' },
          { label: 'Under $100 Specials', href: '/collections/sale' },
        ],
      },
      {
        title: 'Promotions',
        links: [
          { label: 'Extra 20% Off Code: NIDA20', href: '/collections/sale' },
          { label: 'Clearance & Final Markdowns', href: '/collections/sale' },
        ],
      },
    ],
    promo: {
      tag: 'LIMITED TIME ONLY',
      title: 'Mid-Season Spectacular',
      subtitle: 'Save up to 50% off timeless styles. Free shipping over $100.',
      image:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      link: '/collections/sale',
    },
  },
};

export function Header() {
  const { setIsCartOpen, items } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileAccordion, setActiveMobileAccordion] = useState<string | null>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter products for live search
  const searchResults =
    searchQuery.trim() === ''
      ? []
      : products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase())),
          )
          .slice(0, 6);

  const handleMouseEnter = (dept: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMegaMenu(dept);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  // Close menus on route change
  useEffect(() => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs font-sans">
      {/* 1. TOP UTILITY PROMO BANNER (Signature Brown Bar with Warm Yellow Accents) */}
      <div className="bg-[#2B1810] text-white text-[11px] font-semibold tracking-wider uppercase py-2 px-4 border-b border-[#1E110A]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="hidden lg:flex items-center space-x-6 text-white/80">
            <span className="flex items-center hover:text-white transition-colors cursor-pointer">
              <MapPin size={12} className="mr-1.5 text-[#F59E0B]" /> {language === 'th' ? 'ค้นหาสาขา' : 'Store Locator'}
            </span>
            <Link href="/about" className="hover:text-white transition-colors">
              {language === 'th' ? 'เกี่ยวกับแบรนด์ Nida' : 'About Nida'}
            </Link>
          </div>

          <div className="flex-1 text-center font-bold tracking-widest text-xs flex items-center justify-center space-x-2 px-2">
            <span className="bg-[#F59E0B] text-[#2B1810] text-[10px] px-2 py-0.5 font-black uppercase rounded-xs">
              {language === 'th' ? 'จำกัดเวลา' : 'LIMITED TIME'}
            </span>
            <span className="truncate">
              {language === 'th'
                ? 'FALL SALE: ลดสูงสุด 50% + โค้ดลดเพิ่ม 20%: '
                : 'FALL SALE: UP TO 50% OFF + EXTRA 20% WITH CODE: '}
              <strong className="underline decoration-[#F59E0B] underline-offset-2">NIDA20</strong>
            </span>
            <span className="hidden sm:inline text-white/60">
              {language === 'th' ? '| ส่งฟรีเมื่อครบ $100' : '| FREE SHIPPING OVER $100'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-white/80">
            {/* Language Switcher */}
            <div className="flex items-center space-x-0.5 bg-white/10 p-0.5 rounded-xs border border-white/20">
              <button
                type="button"
                onClick={() => setLanguage('th')}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded-xs transition-colors ${
                  language === 'th' ? 'bg-[#F59E0B] text-[#2B1810]' : 'text-white/80 hover:text-white'
                }`}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded-xs transition-colors ${
                  language === 'en' ? 'bg-[#F59E0B] text-[#2B1810]' : 'text-white/80 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <span className="text-white/30 hidden lg:inline">|</span>

            <Link
              href={isAuthenticated ? '/profile' : '/login'}
              className="hover:text-white transition-colors flex items-center text-xs"
            >
              <User size={12} className="mr-1" />
              <span className="hidden lg:inline">
                {isAuthenticated
                  ? language === 'th'
                    ? 'บัญชีของฉัน'
                    : 'My Account'
                  : language === 'th'
                    ? 'เข้าสู่ระบบ'
                    : 'Sign In'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="border-b border-[#EAE3D9] bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#2B1810] p-2 hover:bg-gray-100 rounded-xs transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo with Tri-Color Flag */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <NidaLogo size="md" />
            </Link>
          </div>

          {/* Primary Department Navigation (Desktop Mega Menu Triggers) */}
          <nav className="hidden lg:flex items-center space-x-8 h-full">
            {[
              { id: 'women', label: language === 'th' ? 'ผู้หญิง' : 'WOMEN', path: '/collections/women' },
              { id: 'men', label: language === 'th' ? 'ผู้ชาย' : 'MEN', path: '/collections/men' },
              { id: 'kids', label: language === 'th' ? 'เด็ก' : 'KIDS', path: '/collections/kids' },
              { id: 'bags', label: language === 'th' ? 'กระเป๋า' : 'BAGS & ACCESSORIES', path: '/collections/bags' },
              { id: 'shoes', label: language === 'th' ? 'รองเท้า' : 'SHOES', path: '/collections/shoes' },
              { id: 'home', label: language === 'th' ? 'ของแต่งบ้าน' : 'HOME & LIFESTYLE', path: '/collections/home' },
              { id: 'sale', label: language === 'th' ? 'ลดพิเศษ' : 'SALE', path: '/collections/sale', isSale: true },
            ].map((dept) => (
              <div
                key={dept.id}
                className="h-full flex items-center relative"
                onMouseEnter={() => handleMouseEnter(dept.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={dept.path}
                  className={`text-xs font-bold tracking-[0.15em] py-7 transition-colors flex items-center border-b-2 ${
                    dept.isSale
                      ? 'text-[#D97706] hover:text-[#B45309] border-transparent hover:border-[#D97706]'
                      : activeMegaMenu === dept.id
                        ? 'text-[#2B1810] border-[#2B1810]'
                        : 'text-[#2B1810] hover:text-[#D97706] border-transparent'
                  }`}
                >
                  {dept.label}
                  {dept.isSale && (
                    <span className="ml-1.5 bg-[#F59E0B] text-[#2B1810] text-[9px] px-1.5 py-0.2 font-black rounded-xs">
                      50% OFF
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right Action Icons (Search, Wishlist, Profile, Bag) */}
          <div className="flex items-center space-x-5">
            {/* Search Button / Bar trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#2B1810] hover:text-[#D97706] p-1.5 transition-colors relative flex items-center"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={2} />
              <span className="hidden xl:inline text-xs font-medium ml-2 text-gray-500 tracking-wider">
                {language === 'th' ? 'ค้นหา' : 'SEARCH'}
              </span>
            </button>

            {/* Wishlist Link */}
            <Link
              href="/collections/all"
              className="text-[#2B1810] hover:text-[#D97706] p-1.5 transition-colors relative hidden sm:flex items-center"
              title="Saved items"
            >
              <Heart size={20} strokeWidth={2} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F59E0B] text-[#2B1810] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              href={isAuthenticated ? '/profile' : '/login'}
              className="text-[#2B1810] hover:text-[#D97706] p-1.5 transition-colors"
              aria-label="Account"
            >
              <User size={20} strokeWidth={2} />
            </Link>

            {/* Shopping Bag Drawer Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#2B1810] hover:bg-[#D97706] text-white px-4 py-2.5 rounded-xs flex items-center space-x-2 transition-colors relative shadow-xs"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              <span className="text-xs font-bold tracking-widest hidden sm:inline">BAG</span>
              <span className="bg-[#F59E0B] text-[#2B1810] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center ml-1">
                {items.length}
              </span>
            </button>
          </div>
        </div>

        {/* 3. DESKTOP MEGA MENU FLYOUT */}
        {activeMegaMenu && MEGA_MENU_DATA[activeMegaMenu] && (
          <div
            className="absolute top-full left-0 w-full bg-white border-b-2 border-[#2B1810] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => handleMouseEnter(activeMegaMenu)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-8 py-10">
              <div className="grid grid-cols-12 gap-8">
                {/* Category Links Columns */}
                <div className="col-span-8 grid grid-cols-3 gap-8">
                  {MEGA_MENU_DATA[activeMegaMenu].categories.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-xs font-black tracking-[0.2em] text-[#2B1810] uppercase pb-2 border-b border-[#EAE3D9]">
                        {group.title}
                      </h4>
                      <ul className="space-y-2.5">
                        {group.links.map((link, lIdx) => (
                          <li key={lIdx}>
                            <Link
                              href={link.href}
                              className="text-xs font-medium text-gray-700 hover:text-[#D97706] transition-colors block py-0.5"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Campaign Promotional Highlight Tile */}
                <div className="col-span-4 border-l border-[#EAE3D9] pl-8">
                  <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-4 group cursor-pointer hover:border-[#2B1810] transition-all">
                    <div className="relative aspect-[16/10] overflow-hidden mb-4 bg-gray-200">
                      <img
                        src={MEGA_MENU_DATA[activeMegaMenu].promo.image}
                        alt={MEGA_MENU_DATA[activeMegaMenu].promo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute top-3 left-3 bg-[#2B1810] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        {MEGA_MENU_DATA[activeMegaMenu].promo.tag}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-[#2B1810] mb-1">
                      {MEGA_MENU_DATA[activeMegaMenu].promo.title}
                    </h5>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {MEGA_MENU_DATA[activeMegaMenu].promo.subtitle}
                    </p>
                    <Link
                      href={MEGA_MENU_DATA[activeMegaMenu].promo.link}
                      className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#2B1810] group-hover:text-[#D97706] transition-colors"
                    >
                      SHOP THIS EDIT{' '}
                      <ArrowRight size={12} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. EXPANDABLE SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b-2 border-[#2B1810] shadow-2xl z-40 py-8 px-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center border-b-2 border-[#2B1810] pb-3">
              <Search size={24} className="text-[#2B1810] mr-3" />
              <input
                type="text"
                placeholder="What are you looking for? (e.g., Cable-Knit, Polo, Trench Coat, Leather Bag)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-lg font-medium text-[#2B1810] placeholder-gray-400 outline-none"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-[#2B1810] p-1 ml-2">
                <X size={20} />
              </button>
            </div>

            {/* Quick Trending Searches */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-black text-gray-400 uppercase tracking-widest mr-2">Trending:</span>
              {[
                'Polo Shirts',
                'Cable-Knit Sweaters',
                'Trench Coats',
                'Leather Bags',
                'Court Sneakers',
                'Bath Towels',
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="bg-gray-100 hover:bg-[#2B1810] hover:text-white px-3 py-1 rounded-full text-gray-700 transition-colors font-medium"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Search Live Results Grid */}
            {searchResults.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                    Matching Products ({searchResults.length})
                  </h4>
                  <Link
                    href="/collections/all"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-xs font-bold text-[#D97706] hover:underline"
                  >
                    View All Results
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="group block text-left"
                    >
                      <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-2 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {item.tag && (
                          <span className="absolute top-1 left-1 bg-[#F59E0B] text-[#2B1810] text-[8px] font-black uppercase px-1">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#2B1810] line-clamp-1 group-hover:text-[#D97706]">
                        {item.name}
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">${item.price}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MOBILE DRAWER NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center pb-6 border-b border-gray-200">
              <NidaLogo size="sm" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Mobile Language Switcher */}
            <div className="pt-4 pb-2 border-b border-gray-100 flex items-center justify-start">
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('th')}
                  className={`px-3 py-1 text-xs font-black rounded-xs transition-colors ${
                    language === 'th' ? 'bg-[#2B1810] text-white' : 'text-gray-600'
                  }`}
                >
                  ภาษาไทย (TH)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-black rounded-xs transition-colors ${
                    language === 'en' ? 'bg-[#2B1810] text-white' : 'text-gray-600'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <div className="py-4 space-y-4 flex-1">
              {[
                { id: 'women', label: language === 'th' ? 'ผู้หญิง (Women)' : 'WOMEN', path: '/collections/women' },
                { id: 'men', label: language === 'th' ? 'ผู้ชาย (Men)' : 'MEN', path: '/collections/men' },
                { id: 'kids', label: language === 'th' ? 'เด็ก (Kids)' : 'KIDS', path: '/collections/kids' },
                {
                  id: 'bags',
                  label: language === 'th' ? 'กระเป๋า & เครื่องหนัง' : 'BAGS & ACCESSORIES',
                  path: '/collections/bags',
                },
                { id: 'shoes', label: language === 'th' ? 'รองเท้า (Shoes)' : 'SHOES', path: '/collections/shoes' },
                {
                  id: 'home',
                  label: language === 'th' ? 'ของแต่งบ้าน (Home)' : 'HOME & LIFESTYLE',
                  path: '/collections/home',
                },
                {
                  id: 'sale',
                  label: language === 'th' ? 'ลดพิเศษ (SALE 50%)' : 'SALE (UP TO 50% OFF)',
                  path: '/collections/sale',
                  isSale: true,
                },
              ].map((item) => (
                <div key={item.id} className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center">
                    <Link
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-sm font-black tracking-wider uppercase ${item.isSale ? 'text-[#D97706]' : 'text-[#2B1810]'}`}
                    >
                      {item.label}
                    </Link>
                    {MEGA_MENU_DATA[item.id] && (
                      <button
                        onClick={() => setActiveMobileAccordion(activeMobileAccordion === item.id ? null : item.id)}
                        className="p-1 text-gray-500"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${activeMobileAccordion === item.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                  {activeMobileAccordion === item.id && MEGA_MENU_DATA[item.id] && (
                    <div className="mt-3 pl-3 space-y-2 border-l-2 border-[#2B1810]">
                      {MEGA_MENU_DATA[item.id].categories
                        .flatMap((c) => c.links)
                        .map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-xs font-medium text-gray-600 hover:text-[#D97706] py-1"
                          >
                            {link.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200 space-y-3 text-xs font-semibold text-[#2B1810]">
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                About Nida Brand
              </Link>
              <Link
                href={isAuthenticated ? '/profile' : '/login'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1"
              >
                {isAuthenticated ? 'My Account' : 'Sign In / Join'}
              </Link>
              <div className="pt-2 text-[11px] text-gray-400">© 2026 NIDA. All Rights Reserved.</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Tommy Hilfiger Style Footer
export function Footer() {
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2B1810] text-white pt-16 pb-12 mt-20 border-t-4 border-[#F59E0B] font-sans">
      {/* Newsletter Signup Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-white/10">
        <div className="bg-[#1E110A] border border-white/10 p-8 md:p-12 rounded-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="bg-[#F59E0B] text-[#2B1810] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 inline-block mb-3">
              JOIN THE NIDA REWARDS CLUB
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              GET 20% OFF YOUR FIRST ORDER
            </h3>
            <p className="text-sm text-gray-300">
              Sign up to receive exclusive offers, new arrival alerts, and members-only private sale access.
            </p>
          </div>

          <div className="w-full lg:w-auto flex-1 max-w-md">
            {emailSubscribed ? (
              <div className="bg-[#10B981]/20 border border-[#10B981] p-4 rounded-xs text-white text-sm flex items-center justify-center space-x-2">
                <Check size={18} className="text-[#10B981]" />
                <span className="font-bold">Welcome to the club! Use code: NIDA20 at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white text-[#2B1810] px-4 py-3.5 text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#F59E0B]"
                />
                <button
                  type="submit"
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-[#2B1810] font-black text-xs tracking-widest uppercase px-6 py-3.5 transition-colors whitespace-nowrap"
                >
                  JOIN NOW
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand & Heritage */}
        <div>
          <div className="mb-6">
            <span className="font-black text-2xl tracking-[0.2em] text-white uppercase block">NIDA</span>
            <div className="flex w-14 h-1.5 mt-1">
              <div className="w-1/3 bg-[#2B1810]"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-[#F59E0B]"></div>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-6 font-normal">
            Founded by Phannida (นิดา / นีด้า), crafting modern classic apparel, fine leather bags, and refined
            lifestyle objects inspired by enduring design.
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-300">
            <span className="flex items-center">
              <Truck size={14} className="mr-1 text-[#F59E0B]" /> Fast Delivery
            </span>
            <span className="flex items-center">
              <ShieldCheck size={14} className="mr-1 text-[#F59E0B]" /> Secure Pay
            </span>
          </div>
        </div>

        {/* Col 2: Customer Care */}
        <div>
          <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-5 border-b border-white/10 pb-2">
            CUSTOMER ASSISTANCE
          </h4>
          <ul className="space-y-3 text-xs text-gray-300 font-medium">
            <li>
              <Link href="/track-order" className="hover:text-white transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-white transition-colors">
                Shipping & Delivery Policy
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Returns & 30-Day Exchanges
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Size Guide & Fit Advisor
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Contact Support: support@nida.com
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Explore Nida */}
        <div>
          <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-5 border-b border-white/10 pb-2">
            EXPLORE COLLECTIONS
          </h4>
          <ul className="space-y-3 text-xs text-gray-300 font-medium">
            <li>
              <Link href="/collections/women" className="hover:text-white transition-colors">
                Women's Collection
              </Link>
            </li>
            <li>
              <Link href="/collections/men" className="hover:text-white transition-colors">
                Men's Collection
              </Link>
            </li>
            <li>
              <Link href="/collections/kids" className="hover:text-white transition-colors">
                Kids & Mini Prep
              </Link>
            </li>
            <li>
              <Link href="/collections/bags" className="hover:text-white transition-colors">
                Leather Bags & Belts
              </Link>
            </li>
            <li>
              <Link href="/collections/shoes" className="hover:text-white transition-colors">
                Footwear & Loafers
              </Link>
            </li>
            <li>
              <Link href="/collections/sale" className="text-[#F59E0B] font-bold hover:underline">
                Special Sale Markdowns
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Corporate & Club */}
        <div>
          <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white mb-5 border-b border-white/10 pb-2">
            THE NIDA CLUB
          </h4>
          <ul className="space-y-3 text-xs text-gray-300 font-medium">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Brand Story & Philosophy
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Sustainability & Organic Sourcing
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-white transition-colors">
                Member Rewards Program
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Store Locations & Events
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Careers at Nida
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Payment Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <p>© 2026 NIDA BRANDS GLOBAL. ALL RIGHTS RESERVED. DESIGNED FOR INTENTIONAL LIVING.</p>
        <div className="flex items-center space-x-6 text-[11px]">
          <span className="hover:text-white cursor-pointer">Privacy Notice</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Terms of Sale</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Accessibility</span>
        </div>
      </div>
    </footer>
  );
}

// Sliding Cart Drawer
export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, cartTotal, removeFromCart } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2B1810]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white text-[#2B1810] h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l-4 border-[#2B1810]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-[#2B1810] text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} />
            <h2 className="font-black text-sm tracking-widest uppercase">YOUR SHOPPING BAG ({items.length})</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="hover:text-[#F59E0B] p-1 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-[#FAF7F2] p-4 border-b border-[#EAE3D9] text-xs">
          {cartTotal >= 100 ? (
            <div className="text-emerald-700 font-bold flex items-center">
              <Check size={16} className="mr-1.5" /> Congratulations! You qualify for FREE Standard Delivery.
            </div>
          ) : (
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>
                  Add ${(100 - cartTotal).toFixed(2)} more for <strong>FREE SHIPPING</strong>
                </span>
                <span>{Math.min(100, Math.round((cartTotal / 100) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#F59E0B] h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cartTotal / 100) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-gray-300" />
              <p className="text-base font-bold text-[#2B1810]">YOUR BAG IS CURRENTLY EMPTY</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our new arrivals and iconic preppy essentials to fill your bag.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/collections/all');
                }}
                className="bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest px-6 py-3 hover:bg-[#D97706] transition-colors"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4 pb-6 border-b border-gray-100">
                <div className="w-20 h-26 bg-gray-100 flex-shrink-0 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#2B1810]">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                      {item.selectedColor} • SIZE: {item.selectedSize}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">QTY: {item.quantity}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-black text-sm text-[#2B1810]">${item.price * item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs uppercase font-bold text-gray-400 hover:text-[#D97706] transition-colors underline"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-[#FAF7F2]">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold text-gray-600 uppercase">
              <span>ESTIMATED SUBTOTAL</span>
              <span className="text-base font-black text-[#2B1810]">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-4">
              Taxes and shipping calculated at checkout. Free 30-day returns.
            </p>
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-4 bg-[#2B1810] hover:bg-[#D97706] text-white font-black transition-colors uppercase tracking-[0.2em] text-xs text-center block shadow-md"
              >
                PROCEED TO CHECKOUT
              </Link>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/collections/all');
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-gray-600 hover:text-[#2B1810] transition-colors uppercase tracking-wider"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
