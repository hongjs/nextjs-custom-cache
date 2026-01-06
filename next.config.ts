import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  cacheHandler: path.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0,
};

export default nextConfig;
