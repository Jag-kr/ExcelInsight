## Current state

I checked Lovable's SEO panel via `list_findings` and it currently returns **zero failing findings**. That suggests one of two things:

1. The panel hasn't rescanned recently and your visible score is stale.
2. The score is being held back by passing-but-not-perfect checks (image alt coverage, per-route metadata, performance signals) that don't show up as failing rows.

Either way, the fastest path to a >95 score is: (a) trigger a fresh scan, and (b) tighten the few areas that commonly cap the score even when nothing is "broken".

## Plan

### 1. Trigger a rescan first (no code change)
Open **SEO & AI search** tab → click **Rescan**. If the score jumps above 95, we're done — the previous score was stale from the logo/sitemap fixes earlier.

### 2. If the score is still <95, apply these targeted improvements

**a. Per-route metadata via `react-helmet-async`**
You already have `SEO.tsx` using Helmet, but `index.html` still ships a static `<link rel="canonical">`. That causes **two canonicals** on every page (one static, one from Helmet) — a known SEO red flag.
- Remove `<link rel="canonical" href="https://excelinsight.xyz/" />` from `index.html`. Helmet handles it per route.

**b. Canonical/OG domain consistency**
`index.html` and JSON-LD use `excelinsight.xyz`, but the deployed Lovable URL is `excelinsight.lovable.app`. If `excelinsight.xyz` isn't actually pointing to this app yet, scanners flag the canonical as unreachable.
- Confirm which domain is live. If `.xyz` isn't connected, switch all canonical/og:url/JSON-LD URLs to `excelinsight.lovable.app`.

**c. Image alt coverage**
Audit `<img>` tags across `LandingContent`, `FileUpload`, `DashboardGrid`, etc. Any image without descriptive `alt` lowers the accessibility/SEO sub-score.

**d. H1 uniqueness**
Verify each route renders exactly one `<h1>`. The landing page uses `<h2 id="features-heading">` etc. — confirm the page-level `<h1>` exists in `Index.tsx` (not just visual headings).

**e. Sitemap freshness**
`public/sitemap.xml` is hand-edited with a `lastmod` of `2026-04-21`. Bump it to today's date so crawlers re-fetch.

**f. Preload the LCP asset**
Add `<link rel="preload" as="image" href="/logo.png">` (or the hero image) to `index.html` to improve Largest Contentful Paint, which feeds into the SEO panel's performance signal.

**g. Remove the AdSense script from initial HTML if score is performance-bound**
The `pagead2.googlesyndication.com` script is render-blocking-ish even with `async`. Loading it after first interaction (lazy) typically lifts the performance contribution by 5–10 points. *(Optional — only if revenue impact is acceptable.)*

### 3. Rescan and verify
After applying the changes, rescan the SEO panel. Iterate on whatever rows newly appear.

## Files that would change

- `index.html` — remove duplicate canonical, fix domain if needed, add LCP preload, optionally defer AdSense
- `public/sitemap.xml` — refresh `lastmod`
- `src/pages/Index.tsx` and a couple of components — alt-text + H1 audit (small touches only)

## What I need from you

1. Click **Rescan** in the SEO & AI search tab and tell me the new score + any failing rows that appear.
2. Confirm: is `excelinsight.xyz` actually pointing to this deployment, or should canonicals switch to `excelinsight.lovable.app`?
3. OK to defer the AdSense script for performance? (yes / no / only if needed)

Once you answer, I'll implement only the items that actually move the score.