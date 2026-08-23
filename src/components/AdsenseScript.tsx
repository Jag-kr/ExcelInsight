/**
 * AdSense's Auto Ads loader — only ever rendered on screens with real
 * publisher content (landing view, legal pages, SEO pages). Google flagged
 * the site for serving ads on content-less screens (loading overlay, the
 * post-upload tool view, the default 404) when this loaded sitewide from
 * the root layout; scope it per-page instead of removing it entirely.
 */
export function AdsenseScript() {
  return (
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2734357253126302"
      crossOrigin="anonymous"
    />
  );
}
