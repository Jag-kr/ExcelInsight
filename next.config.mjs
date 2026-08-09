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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
