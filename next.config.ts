// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        pathname: '**', // Allow all paths under spoonacular.com
      },
      {
        protocol: 'https',
        hostname: 'serpapi.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com', // Covers encrypted-tbn0.gstatic.com, encrypted-tbn1.gstatic.com, etc.
      },
      {
        protocol: 'https',
        hostname: '**.amazon.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopee.co.id',
      },
      {
        protocol: 'https',
        hostname: '**.tokopedia.com',
      },
      {
        protocol: 'https',
        hostname: '**.blibli.com',
      },
    ],
  },
};

export default nextConfig;