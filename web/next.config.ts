import type { NextConfig } from 'next';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { Configuration } from 'webpack';
import nextPWA from 'next-pwa';

if (process.env.NODE_ENV !== 'production') {
  dotenvConfig({ path: path.resolve(process.cwd(), '../.env') });
}

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true,
  webpack(config: Configuration) {
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
    }
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
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
});

module.exports = nextConfig;
