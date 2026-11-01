import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react'],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/?auth=signin',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/?auth=signup',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
