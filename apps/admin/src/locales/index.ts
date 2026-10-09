import th from './th.json';
import en from './en.json';

export const locales = { th, en } as const;

export type TranslationDictionary = typeof th;
export type Locale = keyof typeof locales;

export { th, en };
