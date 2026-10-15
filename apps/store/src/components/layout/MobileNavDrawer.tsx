'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';
import { NidaLogo } from './NidaLogo';
import type { NavDepartment, MegaMenuData } from './types';
import type { Language } from '@/context/LanguageContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  departments: NavDepartment[];
  megaMenuData: MegaMenuData;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  wishlistCount: number;
  t: (key: string, fallback?: string) => string;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  departments,
  megaMenuData,
  language,
  onSelectLanguage,
  isAuthenticated,
  wishlistCount,
  t,
}: MobileNavDrawerProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
      <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto flex flex-col p-6 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <NidaLogo size="sm" />
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-[#2B1810]"
            aria-label={t('common.close', 'Close')}
          >
            <X size={24} />
          </button>
        </div>

        {/* Language Switcher */}
        <div className="pt-4 pb-2 border-b border-gray-100 flex items-center justify-start">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xs">
            <button
              type="button"
              onClick={() => onSelectLanguage('th')}
              className={`px-3 py-1 text-xs font-black rounded-xs transition-colors ${
                language === 'th'
                  ? 'bg-[#2B1810] text-white'
                  : 'text-gray-600 hover:text-[#2B1810]'
              }`}
            >
              ภาษาไทย (TH)
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-3 py-1 text-xs font-black rounded-xs transition-colors ${
                language === 'en'
                  ? 'bg-[#2B1810] text-white'
                  : 'text-gray-600 hover:text-[#2B1810]'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Department Links with Subcategory Accordions */}
        <div className="py-4 space-y-4 flex-1">
          {departments.map((item) => {
            const hasSubcategories = Boolean(
              megaMenuData[item.id] &&
                megaMenuData[item.id].categories.length > 0,
            );

            return (
              <div key={item.id} className="border-b border-gray-100 pb-3">
                <div className="flex justify-between items-center">
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={`text-sm font-black tracking-wider uppercase ${
                      item.isSale ? 'text-[#D97706]' : 'text-[#2B1810]'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {hasSubcategories && (
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className="p-1 text-gray-500 hover:text-[#2B1810]"
                      aria-label={item.label}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          activeAccordion === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {activeAccordion === item.id && hasSubcategories && (
                  <div className="mt-3 pl-3 space-y-2 border-l-2 border-[#2B1810]">
                    {megaMenuData[item.id].categories
                      .flatMap((c) => c.links)
                      .map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.href}
                          onClick={onClose}
                          className="block text-xs font-medium text-gray-600 hover:text-[#D97706] py-1"
                        >
                          {link.label}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Navigation Links */}
        <div className="pt-6 border-t border-gray-200 space-y-3 text-xs font-semibold text-[#2B1810]">
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center justify-between py-1 hover:text-[#D97706] transition-colors"
          >
            <span>{t('nav.wishlist')}</span>
            {wishlistCount > 0 && (
              <span className="bg-[#F59E0B] text-[#2B1810] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className="block py-1 hover:text-[#D97706] transition-colors"
          >
            {t('nav.about')}
          </Link>
          <Link
            href={isAuthenticated ? '/profile' : '/login'}
            onClick={onClose}
            className="block py-1 hover:text-[#D97706] transition-colors"
          >
            {isAuthenticated ? t('nav.account') : t('nav.signIn')}
          </Link>
          <div className="pt-2 text-[11px] text-gray-400">
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </div>
  );
}
