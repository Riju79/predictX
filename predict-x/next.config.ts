import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 default) — used in dev
  turbopack: {},
  // Webpack config — used by Vercel production builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: require.resolve('buffer/'),
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3001',
        permanent: false,
      },
      {
        source: '/docs/:path*',
        destination: `${process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3001'}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
