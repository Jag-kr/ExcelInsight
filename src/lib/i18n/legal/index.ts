import { Language } from '../index';
import { LegalContent } from './types';
import { legalEn } from './en';
import { legalHi } from './hi';
import { legalEs } from './es';
import { legalZh } from './zh';
import { legalFr } from './fr';
import { legalDe } from './de';

export const legalContent: Record<Language, LegalContent> = {
  en: legalEn,
  hi: legalHi,
  es: legalEs,
  zh: legalZh,
  fr: legalFr,
  de: legalDe,
};

export type { LegalContent, LegalDoc, LegalSection } from './types';
