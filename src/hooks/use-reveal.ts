import { useEffect } from 'react';

/** Every class whose resting state is hidden until a reveal fires. */
const REVEAL_SELECTOR = [
  '.narrative-reveal',
  '.narrative-reveal-left',
  '.narrative-reveal-right',
  '.chart-bar-rise',
  '.chart-line-progress',
  '.how-step-badge',
  '.display-heading',
].join(', ');

/**
 * Back-fills the CSS scroll-driven reveals for browsers without
 * `animation-timeline: view()` — primarily Firefox.
 *
 * This is not optional polish. In non-supporting browsers the `@supports not`
 * block in globals.css parks these elements at `opacity: 0`, so without an
 * observer adding `.in-view` the content never becomes visible at all. Any
 * component that uses a reveal class must call this hook.
 *
 * Fires once per element, then stops observing it.
 */
export function useFallbackReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const supportsScrollDriven =
      typeof CSS !== 'undefined' &&
      CSS.supports('(animation-timeline: view()) and (animation-range: 0% 100%)');
    if (supportsScrollDriven) return; // native CSS handles it

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('in-view');
            observer.unobserve(entry.target); // fire once
          }
        }
      },
      { threshold: 0.12 }
    );

    const targets = containerRef.current?.querySelectorAll(REVEAL_SELECTOR);
    targets?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef]);
}
