# Entry and exit transitions

CSS transitions historically could not animate an element appearing — a newly inserted
node has no "before" state to transition from, and `display: none` is a discrete
property that snaps. Two features close that gap:

- **`@starting-style`** supplies the values to transition *from* on first render.
- **`transition-behavior: allow-discrete`** lets discrete properties (`display`,
  `content-visibility`, `overlay`) participate, flipping at the far end of the
  transition instead of instantly.

Together they mean you can animate a show/hide with a class toggle and no JS timers.

## The four-part recipe

```css
.panel {
  display: block;
  opacity: 1;
  translate: 0;
  transition:
    display var(--dur-base),                    /* the discrete one */
    opacity var(--dur-base) var(--ease-out),
    translate var(--dur-base) var(--ease-out);
  transition-behavior: allow-discrete;          /* mandatory for the display line */
}

@starting-style {                               /* entry: transition FROM here */
  .panel { opacity: 0; translate: 0 -20px; }
}

.panel.hidden {                                 /* exit: transition TO here */
  display: none;
  opacity: 0;
  translate: 0 -20px;
}
```

1. **Visible state on the base class** — the resting values.
2. **`@starting-style`** — where an entry starts. It only applies on the element's
   first style resolution; it is not a general "initial state" selector.
3. **`allow-discrete` + `display` in the transition list** — without both, the element
   vanishes instantly and the opacity transition never runs.
4. **Exit state on the hidden class/attribute** — usually the same values as the
   starting style, so entry and exit are mirror images.

Selecting the hidden state as `:where(.hidden, [hidden])` keeps the specificity at zero
so it doesn't outrank later rules.

## How this app uses it

One utility, `.discrete-transition` in
[`app/globals.css`](../../app/globals.css), applied in `app/page.tsx` to swap the
analyzing overlay for the dashboard shell:

```css
.discrete-transition {
  transition:
    display var(--dur-base),
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out),
    filter var(--dur-base) var(--ease-out);
  transition-behavior: allow-discrete;
}

@starting-style {
  .discrete-transition { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(4px); }
}

.discrete-transition.hidden {
  display: none;
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  filter: blur(4px);
}
```

React just toggles the class: `` className={`… discrete-transition ${analyzing ? 'hidden' : ''}`} ``.
No `setTimeout`, no unmount delay, no `AnimatePresence`.

Under `prefers-reduced-motion` the transition is dropped and `transform` / `filter` are
forced off — a stuck `blur()` on a panel makes its body text unreadable, which is worse
than any missing animation.

## Where the platform version doesn't fit

Radix primitives (dialog, sheet, dropdown, collapsible) manage their own mount/unmount
and expose `data-state="open|closed"`. Animate those with the attribute selectors
`tailwindcss-animate` provides (`data-[state=open]:animate-in`) or the overrides already
in `globals.css` — don't try to bolt `@starting-style` onto them.

Radix's collapsible is a special case: it transitions `height` with `--ease-in-out`
rather than `--ease-out`, because opening and closing are mirror images and a symmetric
move wants a symmetric curve.

## Fallback

Where `@starting-style` is unsupported the element simply appears without animating —
graceful, and no fallback code needed. That is the key difference from the scroll-driven
work in [scroll-driven.md](scroll-driven.md), where a missing fallback leaves content
permanently invisible.

If an animated entry is genuinely required on an old engine, the classic double-rAF
trick still works: insert with the hidden class, let one frame settle, then remove it.
Nothing in this codebase needs it.
