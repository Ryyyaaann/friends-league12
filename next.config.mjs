/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgs.search.brave.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      }
    ],
  },
};

export default nextConfig;
