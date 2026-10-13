import { createContext, useContext, useState, type ReactNode } from 'react';
import th from '../locales/th.json';
import en from '../locales/en.json';

export type Language = 'th' | 'en';

export const locales: Record<Language, Record<string, unknown>> = { th, en };

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // Direct property check first (for flat keys)
  if (path in obj && typeof obj[path] === 'string') {
    return obj[path] as string;
  }

  // Dot-notation traversal (e.g. 'product.nameEn')
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
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
    const val = getNestedValue(locales[language], key);
    if (val !== undefined) return val;

    const enVal = getNestedValue(locales.en, key);
    if (enVal !== undefined) return enVal;

    return fallback ?? key;
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
