import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://188.137.254.45:1337/api/:path*',
      },
    ];
  },
};

export default nextConfig;
