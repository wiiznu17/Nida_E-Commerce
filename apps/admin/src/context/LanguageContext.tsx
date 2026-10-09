import { createContext, useContext, useState, type ReactNode } from 'react';
import th from '../locales/th.json';
import en from '../locales/en.json';

export type Language = 'th' | 'en';

export const locales: Record<Language, any> = { th, en };

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // Direct property check first (for flat keys)
  if (path in obj && typeof obj[path] === 'string') {
    return obj[path];
  }

  // Dot-notation traversal (e.g. 'product.nameEn')
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nida_lang');
      return saved === 'th' || saved === 'en' ? saved : 'th';
    }
    return 'th';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nida_lang', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'th' ? 'en' : 'th';
    setLanguage(nextLang);
  };

  const isTh = language === 'th';

  const t = (key: string, fallback?: string): string => {
    // 1. Check in active language JSON
    const val = getNestedValue(locales[language], key);
    if (val !== undefined) return val;

    // 2. Check in English JSON fallback
    const enVal = getNestedValue(locales.en, key);
    if (enVal !== undefined) return enVal;

    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isTh, setLanguage, toggleLanguage, t }}>
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
