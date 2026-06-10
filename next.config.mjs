/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize webpack to reduce memory usage during build
    config.optimization = {
      ...config.optimization,
      nodeEnv: false,
      minimize: true,
    };
    
    return config;
  },
  compress: true,
  productionBrowserSourceMaps: false,
  // Disable source maps for faster builds
  env: {
    NEXT_PUBLIC_DEBUG: 'false',
  },
  experimental: {
    // Optimize for production builds
    optimizePackageImports: ['lucide-react', '@radix-ui/*'],
  },
};

export default nextConfig;
