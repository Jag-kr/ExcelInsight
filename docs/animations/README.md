# Animation techniques

Three browser features carry all of this app's motion. These pages cover each one:
how it works, how *this* codebase uses it, and what breaks without a fallback.

| Page | Feature | Used by |
|---|---|---|
| [scroll-driven.md](scroll-driven.md) | `animation-timeline: view()`, named view timelines, `animation-range` | the whole landing narrative |
| [entry-exit.md](entry-exit.md) | `@starting-style`, `transition-behavior: allow-discrete` | `.discrete-transition` (the dashboard/analyzing swap) |
| [fallbacks.md](fallbacks.md) | `@supports not (…)`, `IntersectionObserver` | Firefox, plus every reduced-motion path |

For *what* the app animates and *why* — the two tiers, the easing tokens, the
reduced-motion contract — see [../design/motion.md](../design/motion.md). This folder is
about the mechanics.

## The three rules that hold across all of them

1. **CSS owns the animation; JS owns at most an attribute.** `SiteHeader` toggles
   `data-scrolled`, `useFallbackReveal` adds `.in-view`, `useGlowCards` writes
   `--mx`/`--my`. No component animates anything itself. This is what makes
   `prefers-reduced-motion` a pure CSS concern.
2. **Every progressive-enhancement path needs a `@supports not` twin**, and the twin
   lands on the *finished* state. A half-drawn rule or a half-lit heading frozen in
   place looks broken, not restrained.
3. **`backwards`, not `both`.** `both` pins the final frame's `filter` value forever,
   and even `blur(0)` establishes a stacking context and a containing block — an
   invisible layer sitting on top of your content, breaking drag-and-drop.

## Browser support, briefly

| Feature | Chrome/Edge | Safari | Firefox |
|---|---|---|---|
| `@starting-style` | 117+ | 17.5+ | 129+ |
| `transition-behavior: allow-discrete` | 117+ | 18+ | 129+ |
| Scroll-driven animations (`view()`) | 115+ | 26+ | ✗ |

Scroll-driven animations are the one genuine gap, and it is a big one — Firefox has no
support, so **the fallback path is not optional polish**. Details in
[fallbacks.md](fallbacks.md).

## Provenance

This folder replaces `docs/modern-web-animations.md`, which was a verbatim dump of two
external technique guides. The techniques are documented on
[MDN](https://developer.mozilla.org/) and in the Chrome team's
[scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
material; the code and the judgement calls here are this project's.
