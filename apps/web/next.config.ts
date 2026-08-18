import type { NextConfig } from "next";

const API_UPSTREAM = process.env.API_UPSTREAM_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all JSON API calls through the web domain so the browser
        // never makes a cross-site request. This avoids Chrome's third-party
        // cookie partitioning (CHIPS) which was silently dropping the session
        // cookie for some users.
        source: '/api/v1/:path*',
        destination: `${API_UPSTREAM}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
