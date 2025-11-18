/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, // Add empty turbopack config to silence warning
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  // Configure remote image patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'brickbyte-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'brickbyte-ml.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'sfcexboguumqecgcjfmj.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
}

module.exports = nextConfig 