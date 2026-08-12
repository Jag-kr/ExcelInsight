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
