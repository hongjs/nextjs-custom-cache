import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  cacheHandler: path.resolve('./cache-handler-v3.js'),
  cacheMaxMemorySize: 0,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
