import { describe, expect, it } from 'vitest';
import { seoPages } from './seo-pages';

// The "Related tools" block in SeoPageContent.tsx renders `seoPageMap[slug]` and bails
// with `if (!rel) return null` when the slug is unknown. That guard keeps the page from
// crashing, but it also means a stale slug disappears silently — the card is simply not
// drawn, and the internal link graph thins with nothing failing. Retiring a page is
// exactly when that happens, so assert it instead of trusting the guard.
describe('related-tool links', () => {
  it('every related slug resolves to a published page', () => {
    const published = new Set(seoPages.map((p) => p.slug));
    const dangling = seoPages.flatMap((p) =>
      p.related.filter((s) => !published.has(s)).map((s) => `${p.slug} → ${s}`),
    );
    expect(dangling).toEqual([]);
  });

  it('no page lists itself as related', () => {
    const selfRefs = seoPages.filter((p) => p.related.includes(p.slug)).map((p) => p.slug);
    expect(selfRefs).toEqual([]);
  });
});
