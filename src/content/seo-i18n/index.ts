/**
 * SEO page i18n aggregator.
 * Exports `getSeoPageTranslated(slug, lang)` which merges the base (English)
 * SeoPage with language-specific overrides for the translatable fields.
 */

import { seoPageMap, type SeoPage, type SeoSection, type SeoFaq } from '@/content/seo-pages';
import { type Language } from '@/lib/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SeoPageTranslatable {
  h1: string;
  intro: string;
  primaryCta?: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
}

export type SeoI18nMap = Partial<Record<string, SeoPageTranslatable>>;

// ─── UI strings per language ──────────────────────────────────────────────────
// These are the fixed chrome strings on the SEO page template (category labels,
// CTA buttons, section titles) that must also change on language switch.

export interface SeoPageUiStrings {
  categoryFeature: string;
  categoryComparison: string;
  categoryChart: string;
  categoryTemplate: string;
  categoryUsecase: string;
  seeItInAction: string;
  tryWithYourOwnFile: string;
  tryItDesc: string;
  frequentlyAskedQuestions: string;
  relatedTools: string;
  uploadSpreadsheetFree: string;
  feature: string;
  comparisons: string;
}

// English UI strings (fallback / default)
export const enSeoUi: SeoPageUiStrings = {
  categoryFeature: 'Features',
  categoryComparison: 'Comparisons',
  categoryChart: 'Chart makers',
  categoryTemplate: 'Dashboard templates',
  categoryUsecase: 'Use cases',
  seeItInAction: 'See it in action',
  tryWithYourOwnFile: 'Try it with your own file',
  tryItDesc:
    'No signup, no upload to a server. Open ExcelInsight, drop your Excel or CSV file, and get a dashboard in seconds.',
  frequentlyAskedQuestions: 'Frequently asked questions',
  relatedTools: 'Related tools',
  uploadSpreadsheetFree: 'Upload your spreadsheet \u2014 free',
  feature: 'Feature',
  comparisons: 'Comparisons',
};

// ─── Lazy-loaded translation maps ────────────────────────────────────────────
// Each language file is imported inline so unused languages are tree-shaken in
// production. We use dynamic imports to avoid loading all translations upfront.

let hiMap: SeoI18nMap | null = null;
let hiUi: SeoPageUiStrings | null = null;
let esMap: SeoI18nMap | null = null;
let esUi: SeoPageUiStrings | null = null;
let zhMap: SeoI18nMap | null = null;
let zhUi: SeoPageUiStrings | null = null;
let frMap: SeoI18nMap | null = null;
let frUi: SeoPageUiStrings | null = null;
let deMap: SeoI18nMap | null = null;
let deUi: SeoPageUiStrings | null = null;

function loadLang(lang: Language): { map: SeoI18nMap; ui: SeoPageUiStrings } {
  switch (lang) {
    case 'hi': {
      if (!hiMap) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const m = require('@/content/seo-i18n/hi');
        hiMap = m.hi as SeoI18nMap;
        hiUi = m.hiSeoUi as SeoPageUiStrings;
      }
      return { map: hiMap!, ui: hiUi! };
    }
    case 'es': {
      if (!esMap) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const m = require('@/content/seo-i18n/es');
        esMap = m.es as SeoI18nMap;
        esUi = m.esSeoUi as SeoPageUiStrings;
      }
      return { map: esMap!, ui: esUi! };
    }
    case 'zh': {
      if (!zhMap) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const m = require('@/content/seo-i18n/zh');
        zhMap = m.zh as SeoI18nMap;
        zhUi = m.zhSeoUi as SeoPageUiStrings;
      }
      return { map: zhMap!, ui: zhUi! };
    }
    case 'fr': {
      if (!frMap) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const m = require('@/content/seo-i18n/fr');
        frMap = m.fr as SeoI18nMap;
        frUi = m.frSeoUi as SeoPageUiStrings;
      }
      return { map: frMap!, ui: frUi! };
    }
    case 'de': {
      if (!deMap) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const m = require('@/content/seo-i18n/de');
        deMap = m.de as SeoI18nMap;
        deUi = m.deSeoUi as SeoPageUiStrings;
      }
      return { map: deMap!, ui: deUi! };
    }
    default:
      return { map: {}, ui: enSeoUi };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a fully resolved SeoPage for the given slug and language.
 * Falls back to English for any missing fields.
 */
export function getSeoPageTranslated(slug: string, lang: Language): SeoPage {
  const base = seoPageMap[slug];
  if (!base) throw new Error(`Unknown SEO slug: ${slug}`);
  if (lang === 'en') return base;

  const { map } = loadLang(lang);
  const override = map[slug];
  if (!override) return base;

  return {
    ...base,
    h1: override.h1 ?? base.h1,
    intro: override.intro ?? base.intro,
    primaryCta: override.primaryCta ?? base.primaryCta,
    sections: override.sections?.length ? override.sections : base.sections,
    faqs: override.faqs?.length ? override.faqs : base.faqs,
  };
}

/**
 * Returns the SEO page UI strings (chrome labels) for the given language.
 */
export function getSeoUiStrings(lang: Language): SeoPageUiStrings {
  if (lang === 'en') return enSeoUi;
  const { ui } = loadLang(lang);
  return ui ?? enSeoUi;
}
