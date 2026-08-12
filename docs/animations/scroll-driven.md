# Scroll-driven animations

An animation whose progress is driven by scroll position instead of by time. Set
`animation-duration` to `auto`, point `animation-timeline` at a timeline, and the
element's position in the viewport becomes the playhead — scroll back and it plays
backwards. That reversibility is the point: a scrub feels attached to the page, a
one-shot trigger feels fired *at* the page.

## The four parts

```css
.thing {
  animation: my-keyframes auto linear both;  /* auto duration, linear = don't double-ease */
  animation-timeline: view();                /* progress = this element's visibility */
  animation-range: entry 0% cover 30%;       /* which slice of that visibility */
}
```

- **`auto` duration** — required. A time duration would ignore the timeline.
- **`linear`** — the easing belongs in the keyframe distribution, not on a scrubbed
  animation. Anything else makes scrolling feel rubbery.
- **`view()`** — a timeline covering the element's own trip through the scrollport, on
  the block axis by default (`view(inline)` for horizontal).
- **`animation-range`** — where in that trip the keyframes run. `entry` spans
  first-pixel-visible to fully-visible; `cover` spans the entire time any part is
  visible; `exit` is the mirror of `entry`.

`entry 0% cover 30%` therefore means "start the instant the element appears, finish
30% of the way through its total visibility" — early and quick, which is what a reveal
wants. Long ranges are for things that should build as you read them.

## Named timelines: the important part

`view()` gives each element *its own* timeline, so several elements that should feel
coordinated end up on independent clocks. A 1px connector line gets a 1px timeline and
finishes almost immediately.

The fix is to name a timeline on a shared ancestor and have the children subscribe:

```css
.how-steps-scope {              /* the ancestor that spans all four steps */
  view-timeline-name: --how-steps;
  view-timeline-axis: block;
}

.chart-line-progress {          /* the connector line */
  animation: chart-line-progress-scroll auto linear both;
  animation-timeline: --how-steps;
  animation-range: cover 0% cover 100%;
}

.how-step-badge-2 {             /* the second step's badge */
  animation: how-step-focus auto linear both;
  animation-timeline: --how-steps;
  animation-range: cover 20% cover 45%;
}
```

Now "how far the line has drawn" and "which step is highlighted" are slices of one
number rather than two guesses that drift apart. This codebase does it twice:

| Timeline | Declared on | Drives |
|---|---|---|
| `--how-steps` | `.how-steps-scope` | the connector fill + four step badges (0–25%, 20–45%, 45–70%, 65–90%) |
| `--cta-stage` | `.cta-stage` | the grid settling (`entry 10% cover 45%`) and the SVG rules drawing (`entry 15% cover 60%`) |

Scope the name to a class rather than a bare element so it can't leak into sibling
sections.

## What this app scrubs

| Class | Range | Effect |
|---|---|---|
| `.narrative-reveal` | `entry 0% cover 30%` | fade up + unblur |
| `.narrative-reveal-left` / `-right` | `entry 0% cover 28%` | fade in from the side |
| `.scroll-reveal` | `entry 5% cover 25%` | generic reveal |
| `.display-heading` | `entry 15% cover 40%` | light band sweeps across the text |
| `.problem-pin-line` | `entry 10% cover 60%` | connector grows from the top |
| `.chart-bar-rise` | `entry 0% cover 30%` | bars grow from the baseline |
| `.chart-line-progress` | `cover 0% cover 100%` (`--how-steps`) | line draws across the steps |
| `.how-step-badge-1..4` | slices of `--how-steps` | each badge scales to 1.12 as the line reaches it |
| `.cta-grid`, `.cta-rule path` | slices of `--cta-stage` | grid settles, rules draw |

## Choosing what to animate

- **Blur-led, short travel.** `--reveal-blur: 8px` with `--reveal-shift: 12px`. The blur
  carries the depth cue, so 12px of movement reads as smooth where 48px reads as
  "slidey".
- **No `scale` on text.** Scaling type mid-reveal causes a visible re-rasterisation
  shimmer. This is why the reveal keyframes dropped scale entirely.
- **`translate` over `transform: translateY()`** in the reveal keyframes, so a
  transform set elsewhere on the same element doesn't get clobbered.
- **`stroke-dashoffset` for drawing lines** — set `stroke-dasharray: 1` and
  `stroke-dashoffset: 1` on the path and animate the offset to `0`; with a normalised
  dasharray you don't need to know the path length.

## Gotchas

- **Filters and transforms create containing blocks.** A finished animation that pins
  `filter: blur(0)` leaves an invisible compositing layer over the element. Use
  `backwards`, not `both`, unless the end state must persist — and if it must, make
  sure nothing beneath it needs pointer events (this is exactly why `tab-enter` uses
  `backwards`: a persisted transform broke drag-and-drop on the dashboard grid).
- **A gradient clipped to text needs `color: transparent`**, which means an element
  whose reveal never fires is *invisible*, not merely unanimated. See
  [fallbacks.md](fallbacks.md).
- **`animation-range` percentages are of the range keyword, not the page.** `cover 50%`
  is halfway through the element's visibility, not halfway down the document.
- **Always pair with `@supports`** — see [fallbacks.md](fallbacks.md).
