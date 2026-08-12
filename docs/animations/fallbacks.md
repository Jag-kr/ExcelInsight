# Fallbacks

Firefox does not support scroll-driven animations. This is not a polish gap — several
classes in this app park their element at `opacity: 0` until a reveal fires, so
**without the fallback the content never becomes visible at all**.

## The feature test

Use the same test in CSS and in JS so the two paths can never disagree:

```css
@supports ((animation-timeline: view()) and (animation-range: 0% 100%)) { /* native */ }
@supports not ((animation-timeline: view()) and (animation-range: 0% 100%)) { /* fallback */ }
```

```ts
CSS.supports('(animation-timeline: view()) and (animation-range: 0% 100%)')
```

Both properties are tested because they shipped separately.

## Two shapes of fallback

### 1. Land on the finished state (preferred)

If the animation is decorative, skip it and render the end result statically:

```css
@supports not ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  .cta-grid { opacity: 1; transform: none; }
  .cta-rule path { stroke-dashoffset: 0; }
}
```

The CTA grid and rules do this. A half-drawn rule frozen in place reads as broken; the
finished version reads as a deliberate static design.

### 2. Trigger once with an IntersectionObserver

If the reveal carries meaning — content appearing as you reach it — swap the scrub for a
single eased transition, triggered by a class:

```css
@supports not ((animation-timeline: view()) and (animation-range: 0% 100%)) {
  .narrative-reveal {
    opacity: 0;
    transform: translateY(var(--reveal-shift));
    filter: blur(var(--reveal-blur));
    transition: opacity var(--dur-slow) var(--ease-out),
                transform var(--dur-slow) var(--ease-out),
                filter var(--dur-slow) var(--ease-out);
  }
  .narrative-reveal.in-view { opacity: 1; transform: translateY(0); filter: blur(0); }
}
```

The `.in-view` class comes from [`useFallbackReveal`](../../src/hooks/use-reveal.ts):

```ts
export function useFallbackReveal(containerRef: React.RefObject<HTMLElement | null>) {
  // bails out immediately if the browser supports scroll-driven animations
  // observes every element matching REVEAL_SELECTOR inside containerRef
  // adds .in-view at threshold 0.1, then unobserves — fires once per element
}
```

Consumers: [`LandingContent.tsx`](../../src/components/LandingContent.tsx) and
[`LegalPage.tsx`](../../src/components/LegalPage.tsx).

## The rule you must not forget

`REVEAL_SELECTOR` in `use-reveal.ts` is the registry of every class whose resting state
is hidden:

```
.narrative-reveal, .narrative-reveal-left, .narrative-reveal-right,
.chart-bar-rise, .chart-line-progress, .how-step-badge, .display-heading
```

**Add a new hidden-until-revealed class to that array, and call the hook on a container
that wraps it.** Miss either and the content is permanently invisible in Firefox —
worst of all for `.display-heading`, which clips a gradient to text and therefore sets
`color: transparent`.

If you are debugging "text is missing in Firefox", check these three things in order:
the class is in `REVEAL_SELECTOR`; some ancestor component calls `useFallbackReveal`;
the ref passed to the hook actually contains the element.

## The scrub you cannot recreate

The IntersectionObserver path is a one-shot trigger, not a scrub — it does not reverse
on scroll-back and it does not track scroll position. For `.display-heading` the
fallback transitions `background-position` over `--dur-slow` instead of sweeping with
the scroll. That is a deliberate downgrade: the effect is recognisable, the coordination
is not.

Where an effect genuinely needs per-pixel scroll tracking, an observer with a
101-entry threshold array (`Array.from({length: 101}, (_, i) => i / 100)`) can drive a
style property from `intersectionRatio`. Nothing here does, because it costs a style
write per ratio step and the native path already covers most traffic.

## Reduced motion is the third path

Neither branch above is the reduced-motion answer. `prefers-reduced-motion` gets its own
rules, in the appropriate one of the four blocks in `globals.css` — see
[../design/motion.md](../design/motion.md#the-reduced-motion-contract). Two things there
are load-bearing:

- **Blur must never survive.** A stuck `filter: blur()` makes text unreadable.
- **Durations collapse to `1ms`, never `0`.** `transitionend` and `animationend` still
  have to fire, because the chart crossfade and the collapsible drive state off them.

`useGlowCards` shows the JS-side equivalent: it checks
`matchMedia('(prefers-reduced-motion: reduce)')` and `matchMedia('(pointer: fine)')` and
attaches no listener at all when either says no.

## Testing matrix

| Check | How |
|---|---|
| Native scroll-driven path | Chrome or Safari 26+, scroll slowly and back up — reveals should reverse |
| Fallback path | Firefox, **or** Chrome DevTools → Rendering → emulate unsupported CSS is not available, so use Firefox |
| Reduced motion | OS setting, or DevTools → Rendering → "Emulate CSS prefers-reduced-motion" |
| Nothing left invisible | In Firefox, scroll the whole landing page and both legal pages |
