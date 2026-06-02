/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize webpack to reduce memory usage during build
    config.optimization = {
      ...config.optimization,
      nodeEnv: false,
      minimize: true,
      usedExports: true,
    };
    
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            filename: 'vendor.js',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            enforce: true,
          },
          common: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            filename: 'common.js',
            enforce: true,
          }
        }
      };
    }
    
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
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react', '@radix-ui/*'],
  },
};

export default nextConfig;
