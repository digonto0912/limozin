/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3002/api/:path*'
        }
      ];
    }
    return [];
  },
  // Add headers to completely disable COOP policy for Firebase Auth
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    // Add handling for CommonJS modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "express": false,
      "cors": false
    };
    return config;
  },
  // Disable experimental features that might cause file lock issues
  experimental: {
    optimizePackageImports: undefined,
    turbo: undefined
  },
  // Disable trace file generation that's causing the EPERM error
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Additional build optimizations (swcMinify is deprecated in Next.js 15)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  }
};

export default nextConfig;
