/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      // Consolidate onto the trailing-slash canonical URL.
      // Next.js App Router serves both /slug and /slug/ as 200 by default, which
      // splits link equity and confuses crawlers. Force a 301 to the slash form
      // so sitemap, canonical tags, and internal links all agree on one URL.
      // Skip root "/" (already canonical) and Next.js internal paths.
      {
        source: "/:path((?!api|_next|favicon).+)",
        missing: [{ type: "query", key: "nextInternalRoute" }],
        destination: "/:path/",
        permanent: true,
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
