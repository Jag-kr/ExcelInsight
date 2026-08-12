"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';

interface SiteHeaderProps {
  /** Rendered on the far right, after the theme/language switcher. */
  children?: React.ReactNode;
}

/**
 * The one header used by the landing view, the SEO `/[slug]` pages and the
 * legal pages — previously three near-identical implementations.
 *
 * It reacts to scroll: past a few pixels the bar tightens, deepens its blur and
 * picks up a hairline border, so the page reads as sliding underneath a pane of
 * glass rather than under a static strip. All of the actual animation lives in
 * CSS (`.site-header` in globals.css); this component only flips a
 * `data-scrolled` attribute, which keeps the scroll handler free of layout
 * reads and lets `prefers-reduced-motion` disable the transition without any
 * JS involvement.
 */
export function SiteHeader({ children }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      // Coalesce bursts of scroll events into one read per frame.
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Sync on mount directly rather than through onScroll: the browser restores
    // scroll position on back/forward, and rAF is paused in background tabs, so
    // scheduling this would leave the header in its resting state until the tab
    // is focused.
    setScrolled(window.scrollY > 8);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled ? '' : undefined}>
      <div className="site-header-bar">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo-64.png"
            alt="ExcelInsight"
            width="24"
            height="24"
            className="h-6 w-6"
          />
          <span className="font-bold brand-mark tracking-tight">ExcelInsight</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeLangSwitcher />
          {children}
        </div>
      </div>
    </header>
  );
}
