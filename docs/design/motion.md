# Motion

All of it lives in [`app/globals.css`](../../app/globals.css). JS toggles attributes
and classes; CSS owns every transition, keyframe and timeline. That split is what
lets `prefers-reduced-motion` flatten the whole system without touching a single
component.

For the browser features behind this — view timelines, `@starting-style`,
`transition-behavior` — see [../animations/](../animations/README.md).

## One easing family, three speeds

| Token | Value | When |
|---|---|---|
| `--ease-out` / `ease-smooth` | `cubic-bezier(0.22, 1, 0.36, 1)` | the default for everything |
| `--ease-in-out` / `ease-smooth-inout` | `cubic-bezier(0.4, 0, 0.2, 1)` | **symmetric** moves only — collapsibles, the logo float |
| `--dur-fast` / `duration-fast` | `160ms` | hover, focus, pressed, colour changes |
| `--dur-base` / `duration-base` | `260ms` | panels, tabs, sheets, the header |
| `--dur-slow` / `duration-slow` | `520ms` | scroll reveals — landing pages only |

**No overshoot anywhere.** No spring, no bounce, no `cubic-bezier` with a value
outside `[0,1]` on the Y axis. If you think you need a fourth curve, add it to the
token block with a comment saying why; do not write one inline.

Tailwind cannot disambiguate arbitrary `[var(--…)]` values for duration and easing,
which is the only reason `duration-base` and `ease-smooth` are registered in
`tailwind.config.ts`. Use the named utilities.

## Two tiers

### Tool tier — the dashboard

State feedback and nothing else. `--dur-fast` and `--dur-base`, no blur, no scroll
coupling, no loops.

| What | How |
|---|---|
| Tab panels | `[role="tabpanel"][data-state="active"]` runs `tab-enter` — 4px lift + fade, `--dur-base`, `backwards` |
| Collapsibles | `[data-radix-collapsible-content]` transitions `height` with `--ease-in-out` (open and close are mirror images) |
| Sheets | `[data-state="open"][role="dialog"]` slides in from the right |
| Cards | `[data-pdf-card]` transitions transform/opacity/shadow at `--dur-fast` |
| Buttons | `duration-fast ease-smooth`, `active:scale-[0.98]` |
| Loading | `.skeleton-sheen` (1.6s) and `.progress-indeterminate` (1.1s) — one travelling-sheen idiom for "working, duration unknown" |

`tab-enter` uses `backwards`, not `both`, deliberately: a persisted transform would
leave a containing block around the dashboard grid and interfere with drag-and-drop.

### Landing tier — marketing surfaces

Scroll-coupled narrative. `--dur-slow` in the fallback path; in supporting browsers
these are **scrubs**, not one-shots — scrolling back un-reveals them, which is what
makes them feel attached to the page rather than triggered by it.

## Zone 1 — the hero entrance

Runs on load, staggered by delay. Two rules govern it:

1. **Never `transform`.** A transform on the fold would fight drag-and-drop onto the
   upload zone. Blur carries the depth cue instead — it doesn't affect hit-testing —
   at half the Zone 2 radius so the fold doesn't smear.
2. **`backwards`, never `both`.** `both` pins `filter: blur(0)` permanently, and a
   zero-radius filter still establishes a stacking context and containing block —
   an invisible side effect sitting on top of the primary fold.

| Class | Delay | Keyframe |
|---|---|---|
| `.hero-appear` (container) | 0 | `hero-appear-plain` (opacity only, so no second filter layer over the whole hero) |
| `.hero-appear-badge` | 0.05s | `hero-appear` |
| `.hero-appear-title` | 0.10s | `hero-appear` |
| `.hero-appear-sub` | 0.15s | `hero-appear` |
| `.hero-appear-pills` | 0.20s | `hero-appear` |
| `.hero-appear-upload` | **0s, `--dur-fast`** | `hero-appear-plain` |
| `.hero-appear-feats` | 0.25s | `hero-appear` |

`.hero-appear-upload` is the exception on purpose: the drop target is the one element
that must be fully live and legible at frame 1, so it gets no delay, no blur and no
compositing layer of its own.

## Zone 2 — scroll-driven narrative

Blur-led, short travel: `--reveal-blur: 8px` and `--reveal-shift: 12px`. The blur
carries the depth, so the element only needs to move 12px instead of 48px — long
travel reads as "slidey" rather than smooth. **Scale is deliberately absent**;
scaling text mid-reveal causes a visible re-rasterisation shimmer.

| Class | Range | Effect |
|---|---|---|
| `.narrative-reveal` | `entry 0% cover 30%` | up + unblur |
| `.narrative-reveal-left` / `-right` | `entry 0% cover 28%` | in from the side |
| `.narrative-stagger-1..4` | shifts the range 5% later each step | progressive card stagger *(no call sites yet)* |
| `.scroll-reveal` | `entry 5% cover 25%` | generic up + unblur |
| `.problem-pin-line` | `entry 10% cover 60%` | connector line grows from the top |
| `.chart-bar-rise` | `entry 0% cover 30%` | proof bars build from the baseline |

### Shared timelines

Two blocks name their own `view-timeline` so several elements track **one** scroll
position instead of running on independent clocks:

- **`.how-steps-scope`** → `--how-steps`. The connector line's fill
  (`.chart-line-progress`, `cover 0%`→`cover 100%`) and each step badge's highlight
  (`.how-step-badge-1..4`, at 0–25%, 20–45%, 45–70%, 65–90%) are slices of the same
  timeline. "How far the line has drawn" and "which step is active" are therefore the
  same number, not two guesses. Scoped to the class so it doesn't leak to other
  sections.
- **`.cta-stage`** → `--cta-stage`. See below.

### The display heading sweep

`.display-heading` clips a horizontal gradient to the text — bright band on the left,
dim to the right — and slides it across over `entry 15% cover 40%`. A two-line heading
is often caught mid-reveal, line one lit and line two still dim. It is a scrub, so
scrolling back un-lights it.

Landing and marketing only. Nothing in the dashboard uses it.

Under reduced motion it becomes flat, fully-lit `foreground` with the gradient removed
entirely — a sweep tied to scroll is exactly what the preference asks us to drop, and
a half-lit heading frozen in place would be a legibility problem.

### The CTA stage

`.cta-stage` is a tall stage rather than a card. Everything decorative in it hangs off
`--cta-stage`:

| Element | Range | Effect |
|---|---|---|
| `.cta-grid` (+ `.cta-grid-lines`) | `entry 10% cover 45%` | 120px ruled plane settles from `scale(0.85)` and fades in, held inside a radial vignette so it never runs to a hard edge |
| `.cta-rule path` | `entry 15% cover 60%` | chamfered SVG rules draw via `stroke-dashoffset` |
| `.cta-heading` | — | static vertical metallic ramp (dim at cap line, bright through the middle, dim at baseline) |
| `.cta-lit-btn` | — | the one lit control on the site: top highlight, inner floor, outer bloom, `-2px` hover lift |

`.cta-rule` is hidden below `lg` — at narrow widths the rules crowd the text instead of
framing it. Where the scroll-driven path is unavailable, the grid and rules render at
their **finished** state statically: a half-drawn rule frozen in place looks broken
rather than restrained.

## The reduced-motion contract

Four blocks in `globals.css` cover the whole app. When you add motion, add it to the
right one.

| Block | Covers | Behaviour |
|---|---|---|
| Zone 1 | `.hero-appear*`, `.logo-float`, `.demo-anim-wrapper *` | `animation: none`, `opacity: 1`, `filter: none` |
| Zone 2 | `.narrative-reveal*`, `.problem-pin-line`, `.chart-bar-rise`, `.chart-line-progress`, `.how-step-badge` | land on the finished state |
| Named treatments | `.display-heading`, `.site-header-bar`, `.glow-card`, `.cta-*`, `.skeleton-sheen`, `.progress-indeterminate` | keep the finished appearance, drop the movement |
| Tool tier | `.discrete-transition`, `.sidebar-nav-item > svg`, then a `*, *::before, *::after` backstop | see below |

The tool-tier backstop is deliberately a `*` selector with `!important`: the analyzing
overlay's dots set `animation` via an inline style attribute, and nothing weaker can
override that.

**Durations collapse to `1ms`, not `0`.** `transitionend` and `animationend` still have
to fire — the chart crossfade and the collapsible drive state off those events, and
removing the animation outright would hang them.

Blur must never survive into the reduced-motion state. A stuck `filter: blur()` makes
body text unreadable, which is a worse outcome than any animation.

## Checklist for new motion

- [ ] Uses `--ease-out` (or `--ease-in-out` if the move is symmetric) and one of the
      three durations.
- [ ] Lives in `globals.css`, not in a component's inline styles.
- [ ] Has an explicit `prefers-reduced-motion` rule in the matching block above.
- [ ] If it is scroll-driven: has a `@supports not (...)` fallback, and any class whose
      resting state is hidden is registered in `REVEAL_SELECTOR` in
      [`use-reveal.ts`](../../src/hooks/use-reveal.ts). **Forgetting this makes the
      content permanently invisible in Firefox.**
- [ ] Does not animate `transform` on the hero fold or anywhere that would break
      drag-and-drop.
- [ ] Uses `backwards` rather than `both` unless the final state genuinely must persist.
