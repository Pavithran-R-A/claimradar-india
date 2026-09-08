import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@claimradar/config',
    '@claimradar/database',
    '@claimradar/design-system',
    '@claimradar/seo',
    '@claimradar/shared-types',
  ],
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
