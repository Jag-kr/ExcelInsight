import { useEffect, useRef } from 'react';

// REPLACE with your real AdSense publisher ID after approval (e.g. "ca-pub-1234567890123456").
export const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';

interface AdSlotProps {
  /** Ad slot ID from your AdSense dashboard. Leave empty to render nothing (useful pre-approval). */
  slot?: string;
  /** AdSense format: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical' */
  format?: string;
  /** Set true for responsive ads */
  responsive?: boolean;
  className?: string;
  /** Optional label shown above the ad to comply with disclosure best practices */
  label?: string;
}

/**
 * Reusable AdSense display ad slot. Renders nothing until both ADSENSE_CLIENT
 * and `slot` are set to real values, so it's safe to leave in the tree pre-approval.
 *
 * Note: Auto Ads (configured in index.html) will already place ads automatically —
 * use this component only for explicit, manually-placed slots.
 */
export function AdSlot({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
}: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const isPlaceholder = ADSENSE_CLIENT.includes('XXXX') || !slot;

  useEffect(() => {
    if (isPlaceholder) return;
    try {
      // @ts-expect-error - adsbygoogle is injected by the AdSense loader script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not loaded yet */
    }
  }, [isPlaceholder]);

  if (isPlaceholder) return null;

  return (
    <div className={`my-6 text-center ${className}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
