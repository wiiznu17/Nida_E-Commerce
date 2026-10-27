'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import { useCatalog } from '@/context/CatalogContext';
import { HeaderSearchBar } from '../header/HeaderSearchBar';
import { NidaLogo } from './NidaLogo';
import { MegaMenu } from './MegaMenu';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MobileSearchOverlay } from './MobileSearchOverlay';
import { TopPromoBanner } from './TopPromoBanner';
import { HeaderNav } from './HeaderNav';
import { HeaderActions } from './HeaderActions';
import { buildDynamicMegaMenu } from './megaMenuBuilder';
import type { NavDepartment } from './types';

export function Header() {
  const { setIsCartOpen, items } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, openAuthDrawer } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { categoriesByDept, productsList } = useCatalog();
  const pathname = usePathname();
  const router = useRouter();

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const megaMenuData = useMemo(
    () => buildDynamicMegaMenu(language, categoriesByDept, t),
    [language, categoriesByDept, t],
  );

  const trendingQueries = useMemo(
    () => [
      t('search.trendingItem1', 'Polo Shirts'),
      t('search.trendingItem2', 'Cable-Knit Sweaters'),
      t('search.trendingItem3', 'Trench Coats'),
      t('search.trendingItem4', 'Leather Bags'),
      t('search.trendingItem5', 'Court Sneakers'),
      t('search.trendingItem6', 'Bath Towels'),
    ],
    [t],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return productsList
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.nameTh && p.nameTh.toLowerCase().includes(q)) ||
          p.categorySlug.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          (p.categoryNameTh && p.categoryNameTh.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [searchQuery, productsList]);

  const handleMouseEnter = (dept: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMegaMenu(dept);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickKeyword = (term: string) => {
    setSearchQuery(term);
    setIsSearchFocused(false);
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // Close menus on route change
  useEffect(() => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsSearchFocused(false);
  }, [pathname]);

  const navDepartments: NavDepartment[] = [
    { id: 'women', label: t('nav.women'), path: '/collections/women' },
    { id: 'men', label: t('nav.men'), path: '/collections/men' },
    { id: 'kids', label: t('nav.kids'), path: '/collections/kids' },
    { id: 'bags', label: t('nav.bags'), path: '/collections/bags' },
    { id: 'shoes', label: t('nav.shoes'), path: '/collections/shoes' },
    { id: 'home', label: t('nav.home'), path: '/collections/home' },
    {
      id: 'sale',
      label: t('nav.sale'),
      path: '/collections/sale',
      isSale: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs font-sans">
      {/* 1. Top Utility Promo Banner */}
      <TopPromoBanner
        language={language}
        onSelectLanguage={setLanguage}
        isAuthenticated={isAuthenticated}
        onOpenAuth={openAuthDrawer}
        t={t}
      />

      {/* 2. Main Header Bar */}
      <div className="border-b border-brand-border bg-white relative">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-20 flex items-center justify-between">
          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-brand-brown p-2 hover:bg-gray-100 rounded-xs transition-colors"
              aria-label={t('nav.toggleMenu')}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <NidaLogo size="md" />
            </Link>
          </div>

          {/* Primary Navigation */}
          <HeaderNav
            departments={navDepartments}
            activeMegaMenu={activeMegaMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5 flex-shrink-0">
            <HeaderSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              searchContainerRef={searchContainerRef}
              searchResults={searchResults}
              trendingQueries={trendingQueries}
              handleSearchSubmit={handleSearchSubmit}
              handleQuickKeyword={handleQuickKeyword}
            />

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-brand-brown hover:text-brand-amber p-1.5 transition-colors relative flex md:hidden items-center"
              aria-label={t('nav.search')}
            >
              <Search size={20} strokeWidth={2} />
            </button>

            {/* Action Buttons: Wishlist, Profile, Bag */}
            <HeaderActions
              isAuthenticated={isAuthenticated}
              wishlistCount={wishlistCount}
              cartItemCount={items.length}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenAuth={openAuthDrawer}
              hideCartButton={pathname?.startsWith('/checkout')}
              t={t}
            />
          </div>
        </div>

        {/* 3. Desktop Mega Menu */}
        {activeMegaMenu && megaMenuData[activeMegaMenu] && (
          <MegaMenu
            departmentKey={activeMegaMenu}
            departmentData={megaMenuData[activeMegaMenu]}
            onMouseEnter={() => handleMouseEnter(activeMegaMenu)}
            onMouseLeave={handleMouseLeave}
            shopThisEditLabel={t('mega.shopThisEdit', 'SHOP THIS EDIT')}
          />
        )}
      </div>

      {/* 4. Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
        placeholderText={t('search.placeholder')}
      />

      {/* 5. Mobile Drawer Navigation */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        departments={navDepartments}
        megaMenuData={megaMenuData}
        language={language}
        onSelectLanguage={setLanguage}
        isAuthenticated={isAuthenticated}
        wishlistCount={wishlistCount}
        onOpenAuth={openAuthDrawer}
        t={t}
      />
    </header>
  );
}
