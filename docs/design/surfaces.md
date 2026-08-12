# Surfaces

Bespoke utilities in [`app/globals.css`](../../app/globals.css) that define the app's
containers. Use these rather than assembling `border + bg + shadow + rounded` by hand
— that combination is exactly the "thin border, wide diffuse shadow" pattern the
design audit flagged when it appears ad hoc.

## The container ladder

| Class | Composition | Where it's used |
|---|---|---|
| `.dashboard-surface` | `--gradient-card` fill, `border/70`, `--radius-xl`, `--shadow-card`, `blur(16px)` | hero cards and the workspace header — `app/page.tsx` |
| `.elevated-card` | `surface-1` fill, `border/50`, `--radius-xl`, `--shadow-elevated`, + hover | charts and primary panels — `app/page.tsx`, `LandingContent.tsx` |
| `.dashboard-panel` | `surface-1` fill, `border/60`, `--radius-xl`, `--shadow-card`, `blur(16px)` | secondary content areas — `DashboardGrid.tsx` |
| `.glass-card` | `card` at 60% alpha, `blur(20px) saturate(140%)`, `foreground/8` border | content over a textured background — `LegalPage.tsx`, `DataSummary.tsx`, `SeoPageContent.tsx` |
| `.sidebar-surface` | sidebar tokens, right border, side shadow | the dashboard rail |

Choosing between them:

- **Is it a chart or the main thing in its region?** `.elevated-card`. It is the only
  one with an interactive state: hover raises `border-color` to `primary/40` and adds
  a 1px `primary/12` ring.
- **Is it supporting content beside the main thing?** `.dashboard-panel`.
- **Does something textured show through behind it?** `.glass-card`. Its 60% alpha
  means contrast depends on the backdrop — check text on it in the browser rather
  than trusting the token ratios.
- **Is it the frame around a whole view?** `.dashboard-surface`.

`.chart-container` (`rounded-xl bg-card border-border/50 p-4`) is defined but unused;
`.elevated-card` superseded it. See [class-inventory.md](class-inventory.md).

## Backgrounds and texture

| Class | Effect |
|---|---|
| `.hero-surface` | `--gradient-hero` — a radial emerald spotlight from above the fold, over the page background |
| `.grid-backdrop` | 64px ruled plane at `foreground/5.5%`, masked by a radial ellipse so it fades before the edges. **Static by design** — a moving background behind a file-drop target is a distraction at the worst moment |

Both are applied in `app/page.tsx`.

## Site header

`.site-header` + `.site-header-bar`, driven by [`SiteHeader.tsx`](../../src/components/SiteHeader.tsx).
The one header shared by the landing view, the SEO `/[slug]` pages and the legal
pages (it replaced three near-identical implementations).

| State | Height | Max width | Background |
|---|---|---|---|
| rest | `3.75rem` | `72rem` | transparent, transparent border |
| `[data-scrolled]` | `3.25rem` | `68rem` | `background/72` + `blur(16px) saturate(1.6)` + `foreground/8` hairline + `--shadow-card` |

The division of labour matters: **React only toggles the `data-scrolled` attribute**
(`window.scrollY > 8`, coalesced into one read per frame with `requestAnimationFrame`),
and every visual change is CSS. That keeps the scroll handler free of layout reads and
lets `prefers-reduced-motion` flatten the transition without touching JS. `scrolled`
is also synced directly on mount, not through the rAF path, because browsers restore
scroll position on back/forward and rAF is paused in background tabs.

`saturate(1.6)` is not decorative — it is what keeps colour behind the glass from
going flat, and the most recognisable part of the treatment.

Under reduced motion the header keeps its scrolled *appearance* and drops the travel.

## Chips and edges

| Class | Notes |
|---|---|
| `.stat-chip` | glass pill for data badges: `foreground/5` fill, `blur(8px)`, `--inset-lit`, 11px/600 |
| `.edge-fade-y` | mask fading 3rem at top and bottom |
| `.edge-fade-x` | mask fading 2rem at left and right |
| `.edge-fade-b` | bottom-only — for panes whose header row must stay crisp |

Edge fades are **only** for regions that actually scroll: content dissolving at the
boundary signals "there is more here". On a static block it just makes text hard to
read at the edges. Only `.edge-fade-b` currently has a call site (`app/page.tsx`);
`-x` and `-y` are available but unused.

## Interaction affordances

| Class | Notes |
|---|---|
| `.glow-card` | pointer-tracked light around the 1px border, `--mx`/`--my` written by [`useGlowCards`](../../src/hooks/use-glow-cards.ts). Border only — `mask-composite` carves out the middle so text on the card is never washed out |
| `.sidebar-nav-item` | nav row: `foreground/70` at rest, `sidebar-accent` on hover, `primary/12` fill + `primary` text when `.active` (`primary/18` in dark). Its icon scales 1.1 on hover, 1.05 when active |
| `.drag-rail` | 4px grab rail on a card's left edge, revealed by `.group:hover` / `:focus-within`, turning `primary` while dragging. **Currently no call site** |

`useGlowCards` opts out entirely under `prefers-reduced-motion` and on coarse
pointers, uses one listener on the container rather than one per card, and writes
custom properties on an already-composited pseudo-element — so it never touches
layout. It must be called on a container that wraps the cards; see
[`LandingContent.tsx`](../../src/components/LandingContent.tsx).

## The closing CTA stage

`.cta-stage` and friends are a landing-page-only composition, documented with the
rest of the scroll work in [motion.md](motion.md#the-cta-stage) — the whole point of
that block is that one named view timeline drives all of its decoration, so it is
described there rather than here.
