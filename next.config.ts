import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  cacheHandler: path.resolve('./cache-handler-v4.js'),
  cacheMaxMemorySize: 0,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
