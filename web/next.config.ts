import type { NextConfig } from 'next';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenvConfig({ path: path.resolve(process.cwd(), '../.env') });
}

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NODE_ENV === 'development' ? 'development' : Date.now().toString(),
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
