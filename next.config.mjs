/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },

      // Retired programmatic landing pages (removed 2026-09-08). Each earned zero
      // clicks over 12 months — 10 never registered a single impression, 6 sat at
      // position 46–71. Redirected into the surviving page for the same intent so
      // any accumulated signal consolidates instead of 404ing.
      // Rationale and the full decision record: docs/seo/p0-baseline.md (gate log).
      { source: "/bar-chart-maker", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/make-bar-graph-from-excel", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/plot-excel-data", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/excel-chart-maker", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/radar-chart-maker", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/excel-chart-generator", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/scatter-plot-generator", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/pie-chart-maker", destination: "/excel-data-visualizer/", permanent: true },
      { source: "/csv-to-line-graph", destination: "/line-chart-maker/", permanent: true },
      { source: "/line-graph-maker-excel", destination: "/line-chart-maker/", permanent: true },
      { source: "/hr-analytics-excel", destination: "/hr-dashboard-template/", permanent: true },
      { source: "/sales-dashboard-template", destination: "/ecommerce-analytics-dashboard/", permanent: true },
      { source: "/manufacturing-report-dashboard", destination: "/inventory-dashboard-template/", permanent: true },
      { source: "/startup-kpi-dashboard", destination: "/excel-dashboard-maker/", permanent: true },
      { source: "/free-dashboard-software-excel", destination: "/excel-dashboard-maker/", permanent: true },
      { source: "/learn-excel-data-analysis", destination: "/analyse-excel-data/", permanent: true },

      // NOTE: No trailing-slash redirect rule here.
      // Next.js App Router + generateStaticParams serves /slug/ as the canonical
      // SSG page. The canonical <link> tag in each page tells Google which URL to
      // index. A redirect rule here caused ERR_TOO_MANY_REDIRECTS loops because
      // Next.js path matching re-matched the already-slashed URL.
    ];
  },
  async headers() {
    return [
      {
        /**
         * Static assets in public/ are served with `max-age=0, must-revalidate` by
         * default, so every repeat visit re-validated the logo and icons over the
         * network for nothing.
         *
         * A day of freshness with a week of stale-while-revalidate, rather than
         * `immutable`: these filenames carry no content hash (unlike /_next/static/*,
         * which Vercel already serves immutable for a year and which must not be
         * touched here), so a cache entry that never revalidates would pin a stale
         * logo until the filename changed.
         */
        source: "/:file(logo-64.png|logo.png|logo.svg|apple-touch-icon.png|favicon.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
