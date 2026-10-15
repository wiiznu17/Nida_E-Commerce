'use client';

import React from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import type { StorefrontProduct } from '@repo/types';

export interface HeaderSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  searchResults: StorefrontProduct[];
  trendingQueries: string[];
  handleSearchSubmit: (e?: React.FormEvent) => void;
  handleQuickKeyword: (term: string) => void;
}

export function HeaderSearchBar({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  searchContainerRef,
  searchResults,
  trendingQueries,
  handleSearchSubmit,
  handleQuickKeyword,
}: HeaderSearchBarProps) {
  const { language, t } = useLanguage();

  return (
    <div ref={searchContainerRef} className="relative hidden md:block">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div
          className={`relative flex items-center transition-all duration-300 rounded-full border ${
            isSearchFocused
              ? 'w-60 lg:w-72 bg-white border-[#2B1810] shadow-md ring-1 ring-[#2B1810]/20'
              : 'w-40 lg:w-52 bg-[#FAF7F2] hover:bg-[#F3EFEA] border-transparent'
          }`}
        >
          <button
            type="submit"
            className="pl-3 pr-2 py-2 text-[#2B1810] hover:text-[#D97706] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Search"
          >
            <Search size={16} strokeWidth={2.2} />
          </button>
          <input
            type="text"
            placeholder={t('search.placeholderShort')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-transparent py-2 pr-7 text-xs font-medium text-[#2B1810] placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-gray-400 hover:text-[#2B1810] p-0.5 rounded-full cursor-pointer"
              aria-label="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Flyout Dropdown */}
      {isSearchFocused && (
        <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white border border-[#EAE3D9] shadow-2xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {searchQuery.trim() === '' ? (
            <div>
              <div className="text-[10px] font-black tracking-wider uppercase text-gray-400 mb-2.5">
                {t('search.trending')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trendingQueries.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickKeyword(term)}
                    className="text-xs bg-[#FAF7F2] hover:bg-[#2B1810] hover:text-white px-3 py-1.5 rounded-full text-[#2B1810] transition-colors font-medium border border-[#EAE3D9]/60 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
                <span className="text-[10px] font-black tracking-wider uppercase text-gray-400">
                  {t('search.matchingProducts')} ({searchResults.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="text-[11px] font-bold text-[#D97706] hover:underline cursor-pointer"
                >
                  {t('search.viewAll')}
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  {t('search.noResults')}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center space-x-3 p-1.5 hover:bg-[#FAF7F2] rounded-lg transition-colors group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-gray-100"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-semibold text-[#2B1810] truncate group-hover:text-[#D97706]">
                          {getProductTitle(product, language)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          ${product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full mt-3 py-2 text-center text-xs font-bold text-[#2B1810] bg-[#FAF7F2] hover:bg-[#2B1810] hover:text-white rounded-lg transition-colors border border-[#EAE3D9] cursor-pointer"
              >
                {t('search.resultsFor')} &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
