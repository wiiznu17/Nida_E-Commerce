import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
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
