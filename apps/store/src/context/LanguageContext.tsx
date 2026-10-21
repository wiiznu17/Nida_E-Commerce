'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { ApiProduct, ApiProductDetail } from '@repo/types';
import th from '../locales/th.json';
import en from '../locales/en.json';

export type Language = 'th' | 'en';

export interface LocalizedProductLike {
  name: string;
  nameTh?: string;
  categoryName?: string;
  categoryNameTh?: string;
  categorySlug?: string;
  category?: string | { name?: string; nameTh?: string; slug?: string };
  subCategory?: string;
  subCategoryTh?: string;
  tag?: string;
  tagTh?: string;
  description?: string;
  descriptionTh?: string;
}

export const locales: Record<Language, Record<string, unknown>> = { th, en };

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // Direct property check first (for flat keys)
  if (path in obj && typeof obj[path] === 'string') {
    return obj[path] as string;
  }

  // Dot-notation traversal (e.g. 'nav.women')
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

interface LanguageContextType {
  language: Language;
  isTh: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nida_lang');
      if (saved === 'th' || saved === 'en') {
        setLanguageState(saved);
        return;
      }
      // Check cookie fallback
      const match = document.cookie.match(/(?:^|;\s*)nida_lang=(th|en)/);
      if (match && match[1]) {
        setLanguageState(match[1] as Language);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('nida_lang', lang);
      document.cookie = `nida_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'th' ? 'en' : 'th';
    setLanguage(nextLang);
  };

  const isTh = language === 'th';

  const t = (key: string, fallback?: string): string => {
    const val = getNestedValue(locales[language], key);
    if (val !== undefined) return val;

    const enVal = getNestedValue(locales.en, key);
    if (enVal !== undefined) return enVal;

    return fallback ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isTh,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Localized Product Accessor Helpers
export function getProductTitle(
  product: LocalizedProductLike,
  lang: Language,
): string {
  if (lang === 'th' && product.nameTh) {
    return product.nameTh;
  }
  return product.name;
}

export function getProductSubCategory(
  product: LocalizedProductLike,
  lang: Language,
): string {
  const catObj =
    typeof product.category === 'object' && product.category !== null
      ? product.category
      : undefined;

  if (lang === 'th') {
    if (product.categoryNameTh) return product.categoryNameTh;
    if (catObj?.nameTh) return catObj.nameTh;
    if (product.subCategoryTh) return product.subCategoryTh;
  }

  return (
    product.categoryName ??
    catObj?.name ??
    product.subCategory ??
    (typeof product.category === 'string'
      ? product.category
      : (product.categorySlug ?? ''))
  );
}

export function getProductTag(
  product: LocalizedProductLike,
  lang: Language,
): string | undefined {
  if (lang === 'th' && product.tagTh) {
    return product.tagTh;
  }
  return product.tag;
}

export function getProductDescription(
  product: LocalizedProductLike,
  lang: Language,
): string | undefined {
  if (lang === 'th' && product.descriptionTh) {
    return product.descriptionTh;
  }
  return product.description;
}
