import { useEffect } from 'react';

/**
 * Tracks the pointer across `.glow-card` elements inside `containerRef` and
 * writes its position to `--mx` / `--my` on whichever card is under the cursor.
 * The visual itself is CSS (`.glow-card::before` in globals.css).
 *
 * One listener on the container rather than one per card, and the write is a
 * CSS custom property on an already-composited pseudo-element, so this never
 * touches layout. Positions are read from the event and the card's cached rect
 * — no getBoundingClientRect inside the move handler.
 */
export function useGlowCards(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // A pointer-tracked highlight is decoration; skip the work entirely when
    // the user has asked for less motion, and on touch, where there is no
    // hover state to track.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (reduced || !fine) return;

    let raf = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      pending = null;
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>('.glow-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      pending = { card, x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!raf) raf = requestAnimationFrame(flush);
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      container.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef]);
}
