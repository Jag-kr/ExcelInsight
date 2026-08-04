
--- Guide for animate-element-entry-exit ---
In the past, CSS transitions could not animate elements when they were first added to the DOM or when their `display` property changed from `none`. The `@starting-style` at-rule and `transition-behavior: allow-discrete` provide a declarative way to create smooth entry and exit animations.

## Implementation

### 1. Animating `display: none` Toggles

To animate an element when toggling its visibility via an attribute (e.g., `hidden` with `display: none`):

1. **Define the visible state**: Set the final property values (e.g., `opacity: 1`) on the base class.
2. **Define the entry starting state**: Use `@starting-style` to specify the values to transition *from* when the element becomes visible.
3. **Enable discrete transitions**: Include `display` in the `transition` property and use `transition-behavior: allow-discrete`.
4. **Define the exit state**: Set the target values in the `hidden` attribute.

```css
.card {
  display: block;
  opacity: 1;
  translate: 0;
  /* MANDATORY: Use transition-behavior: allow-discrete for display transition */
  transition:
    display 0.4s,
    opacity 0.4s ease-out,
    translate 0.4s ease-out;
  transition-behavior: allow-discrete;
}

/* Entry animation: transition FROM these values when first rendered */
@starting-style {
  .card {
    opacity: 0;
    translate: 0 -20px;
  }
}

/* Exit animation: transition TO these values when hidden */
.card:where(.hidden, [hidden]) {
  display: none;
  opacity: 0;
  translate: 0 -20px;
}

/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card {
    /* Disable movement and shorten duration for a simple fade */
    translate: none;
    transition-duration: 0.1s;
  }

  @starting-style {
    .card {
      translate: none;
    }
  }

  .card:where(.hidden, [hidden]) {
    translate: none;
  }
}
```

### 2. Animating DOM Insertion and Removal

For elements added via `appendChild()` or removed via `remove()`:

- **Entry**: Use `@starting-style` as shown above. The browser will automatically detect the style change from "nothing" to the element's initial styles and trigger the transition from the `@starting-style` values.
- **Removal**: Since `element.remove()` is instantaneous and doesn't trigger a CSS transition on its own, you must trigger the exit transition first (e.g., by adding a class) and wait for it to finish before removing the node from the DOM.

```javascript
// Trigger exit transition
element.setAttribute('hidden', true);

// 2. Wait for all active transitions/animations to finish,
//    with a failsafe timeout in case an animation never ends (e.g. for looping animations)
const animations = element.getAnimations();
if (animations.length > 0) {
  await Promise.race([
    // Promise.allSettled ensures we wait even if some animations fail
    Promise.allSettled(animations.map(a => a.finished)),
    new Promise(r => setTimeout(r, 2000))
  ]);
}

// 3. Finally remove the node from the DOM
element.remove();
```

## Constraints & Accessibility

- **MANDATORY**: Use `transition-behavior: allow-discrete` when transitioning `display`. Without it, the element will instantly disappear during exit.
- **DO NOT** use `allow-discrete` in the `transition` shorthand — it will make older browsers ignore the entire `transition` declaration. Except in use cases where that is desirable, use a separate `transition-behavior: allow-discrete` declaration.
- **MANDATORY**: Use `@starting-style` for entry animations. Browsers skip transitions on an element's first style update (initial render or `display: none` change) unless this is provided.
- **DO**: Include `overlay` in the `transition` list if animating top-layer elements like `<dialog>` or `popover` to ensure they stay in the top layer during the exit animation.
- **DO**: Respect user preferences for reduced motion using the `prefers-reduced-motion` media query.
- **DO NOT**: Rely on `@starting-style` for exit animations; it only defines the *starting* point for an entry transition. Exit animations are defined by the transition to the hidden state.

## Fallback strategies

Baseline status for @starting-style: Newly available. It's been Baseline since 2024-08-06.
Supported by: Chrome 117 (Sep 2023), Edge 117 (Sep 2023), Firefox 129 (Aug 2024), and Safari 17.5 (May 2024).

For browsers that do not support these features, elements will toggle `display: none` instantly. You can detect support in JavaScript using `CSS.supports()` to conditionally apply manual animation logic.

```javascript
// Detect support for discrete transitions and starting-style
const supportsModernTransitions =
  window.CSS &&
  CSS.supports('transition-behavior', 'allow-discrete');

if (!supportsModernTransitions) {
  // Implement manual JS-based fallback for entry/exit
}
```

### Manual Entry Animation (JS Fallback)

```javascript
// To show:
el.style.display = '';
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    el.classList.remove('hidden');
  });
});

// To hide:
el.setAttribute('hidden', true);
el.addEventListener('transitionend', () => {
  if (el.classList.contains('hidden')) el.style.display = 'none';
}, { once: true });
```


--- Guide for scroll-entry-exit-effects ---
# Add entry and exit effects to elements as they enter or exit the scrollport

Entry and exit effects are animations that are triggered when an element enters or leaves the viewport. This can be used to create engaging and dynamic user experiences. For example, you can use an entry effect to fade in an element as it scrolls into view, or an exit effect to scale it down as it scrolls out of view.

## How to implement

To add entry and exit effects to an element, you need to combine a few CSS properties. Here’s a step-by-step guide:

1.  **Create separate `@keyframes` for the entry and exit animations.** The entry animation will be applied as the element enters the viewport, and the exit animation will be applied as it leaves.

    ```css
    @keyframes slide-in {
      from { transform: translateX(-100%); }
    }
    @keyframes slide-out {
      to { transform: translateX(100%); }
    }
    ```

2.  **Attach the entry and exit keyframes to the element.** You can do this by defining multiple animations in the `animation` property.

    -   Give the entry animation an `animation-fill-mode` of `backwards` so that it applies its initial state before the animation starts.
    -   Give the exit animation an `animation-fill-mode` of `forwards` so that it maintains its final state after the animation is complete.

    ```css
    .animated-element {
      animation:
        slide-in 1s linear backwards,
        slide-out 1s linear forwards;
    }
    ```

3.  **Create a View Timeline and link it to the animations.** A View Timeline is a type of timeline that is linked to the visibility of an element in the viewport. You can create one using the `view()` function and then apply it to your animations using the `animation-timeline` property.

    ```css
    .animated-element {
      animation-timeline: view();
    }
    ```

    By default, `view()` tracks the element on the `block` axis. If you need to track it on the `inline` axis, you can use `view(inline)`.

4.  **Limit the animations to the `entry` and `exit` ranges.** The `animation-range` property allows you to specify which part of the timeline an animation should run on.

    -   The `entry` range covers the time from when the element first enters the viewport until it is fully visible.
    -   The `exit` range covers the time from when the element starts to leave the viewport until it is completely hidden.

    ```css
    .animated-element {
      animation-range: entry, exit;
    }
    ```

## Example code

This code animates the direct children of the scroller on scroll using an **anonymous view-timeline**:

```css
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: view()) and (animation-range: entry)) {
    @keyframes grow {
      from {
        scale: 0.5;
      }
    }
    @keyframes shrink {
      to {
        scale: 0.5;
      }
    }

    .scroller > * {
      animation:
        grow auto linear backwards,
        shrink auto linear forwards;
      animation-timeline: view(inline);
      animation-range: entry, exit;
    }
  }
}
```

As the elements enter the scrollport the `grow` animation is played, and as they leave the scrollport the `shrink` animation is played.

The following code has the same visual outcome, but animates the direct children of the scroller on scroll using an **named view-timeline**:

```css
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: view()) and (animation-range: entry)) {
    @keyframes grow {
      from {
        scale: 0.5;
      }
    }
    @keyframes shrink {
      to {
        scale: 0.5;
      }
    }

    .scroller > * {
      view-timeline: --tl inline;
      animation:
        grow auto linear backwards,
        shrink auto linear forwards;
      animation-timeline: --tl;
      animation-range: entry, exit;
    }
  }
}
```

## Best Practices

When using scroll-driven animations, it's important to follow a few best practices to ensure a smooth and accessible experience:

- **DO** include feature detection: Not all browsers support scroll-driven animations. Use `@supports ((animation-timeline: view()) and (animation-range: entry))` to check for support and provide a fallback for browsers that don't support it.
  - The `(animation-range: entry)` check **MUST** be included here, to filter out browsers with only partial support.
  - **DO NOT** use the `scroll-timeline-polyfill` package for the fallback strategy as it is not feature complete and has a lot of known issues.
  - If the animation is only considered to be decorative, opt for Progressive Enhancement and **DO NOT** provide a fallback.
- **DO** respect user preferences: Some users prefer to have less motion on the web. Use the `prefers-reduced-motion` media query to disable or reduce your animations for these users.
- **DO** try to animate only performant CSS properties: For the smoothest animations, stick to animating properties that can be handled by the browser's compositor thread, such as `transform` and `opacity`. Animating other properties like `width` or `height` can lead to performance issues.
- **DO** use the correct declaration order: When using the `animation` shorthand property, declare `animation-timeline` *after* it to prevent the shorthand from resetting the timeline.

When using the `view()` function to create a scroll-driven animation:

- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view(block)` or `view(inline)`.
- When the animation is not applied to the tracked subject itself, use a named view timeline.

When using the `view-timeline` property to create a scroll-driven animation:

- **DO** use a CSS `<dashed-ident>` for the name.
- **OPTIONAL** be explicit about the axis to track: When not targeting the default `block` axis (such as in a horizontal scroller), be explicit about which axis to track with `view-timeline-axis`.
- **DO** make sure the scope of the lookup works: When the element that is declaring the `view-timeline` is not a flat tree ancestor of the animated element, hoist up the visibility of the `view-timeline`’s name by using `timeline-scope` on a shared ancestor.

Prefer a named `view-timeline` when multiple elements or children of the tracked subject need to animate.

## Browser support and fallback strategies

Scroll-driven animations has limited availability.
Supported by: Chrome 115 (Jul 2023), Edge 115 (Jul 2023), and Safari 26 (Sep 2025).
Unsupported in: Firefox.. Therefore, a fallback strategy is typically required.

For browsers that do not support scroll-driven animations, you can use a fallback to recreate the visual effects. The fallbacks are typically built with either a scroll listener (for ScrollTimeline effects) or the IntersectionObserver API (for ViewTimeline effects).

In browsers with built-in support for scroll-driven animations, ALWAYS use the native CSS implementation as those are more performant.

Note that not every effect can be recreated using the fallbacks approach.

For this use-case specifically, the following script applies the fallback for browsers that do not support scroll-driven animations. It uses an `IntersectionObserver` to track the visibility of the `.wrapper` element and updates the `transform` property of the layers based on the scroll position.

```html
<script>
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // This matches the effect as defined in the CSS example above.
          // Customize this further if needed.
          entry.target.style.scale = 0.5 + entry.intersectionRatio * 0.5;
        }
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    document.querySelectorAll('.scroller > *').forEach((el) => {
      observer.observe(el);
    });
  }
</script>
```

