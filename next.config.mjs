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
      // IMPORTANT: exclude paths with a dot (sitemap.xml, robots.txt, ads.txt,
      // favicon.ico, etc.) and Next.js internals — those must NOT be redirected.
      {
        source: "/:path((?!api|_next|favicon|sitemap|robots|ads)[^/.]+)",
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
