/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, 
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    // Exclude test files from the build
    config.externals = [
      ...(config.externals || []),
      {
        'tap': 'tap',
        'tape': 'tape',
        'fastbench': 'fastbench',
        'desm': 'desm',
        'why-is-node-running': 'why-is-node-running',
        'pino-elasticsearch': 'pino-elasticsearch',
      }
    ];

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