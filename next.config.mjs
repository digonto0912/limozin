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
  webpack: (config, { isServer }) => {
    // Add handling for CommonJS modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "express": false,
      "cors": false
    };
    return config;
  }
};

export default nextConfig;
