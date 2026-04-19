import { createContext, useContext } from 'react';
import { en, TranslationKey } from './en';
import { hi } from './hi';
import { es } from './es';
import { zh } from './zh';
import { fr } from './fr';
import { de } from './de';

export type Language = 'en' | 'hi' | 'es' | 'zh' | 'fr' | 'de';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en, hi, es, zh, fr, de,
};

export const languageMeta: Record<Language, { label: string; native: string; short: string; flag: string }> = {
  en: { label: 'English', native: 'English', short: 'EN', flag: '🇬🇧' },
  hi: { label: 'Hindi', native: 'हिन्दी', short: 'हिं', flag: '🇮🇳' },
  es: { label: 'Spanish', native: 'Español', short: 'ES', flag: '🇪🇸' },
  zh: { label: 'Mandarin Chinese', native: '中文', short: '中', flag: '🇨🇳' },
  fr: { label: 'French', native: 'Français', short: 'FR', flag: '🇫🇷' },
  de: { label: 'German', native: 'Deutsch', short: 'DE', flag: '🇩🇪' },
};

export type { TranslationKey };

export interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key],
});

export function useI18n() {
  return useContext(I18nContext);
}
