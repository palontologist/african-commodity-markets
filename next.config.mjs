/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client"],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev'
      ]
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
      // Avoid webpack devtool values that inject `eval()` (which can be blocked by CSP).
      // Use a non-eval source map in development to prevent "unsafe-eval" CSP violations
      // when testing in environments with strict CSP headers.
      if (process.env.NODE_ENV !== 'production') {
        // 'cheap-module-source-map' provides good rebuild performance without using eval.
        config.devtool = 'cheap-module-source-map'
      }
    }
    
    // Suppress warnings for optional dependencies
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /@react-native-async-storage\/async-storage/,
      /pino-pretty/,
    ]
    
    return config
  },
}

export default nextConfig

// In development we may allow 'unsafe-eval' for Webpack dev tooling only.
// Do NOT enable this in production.
if (process.env.NODE_ENV !== 'production') {
  // Development-only headers to relax CSP for tooling and allow known external dev origins
  nextConfig.headers = async () => {
    return [
      // Ensure static CSS served by Next has the correct MIME type when proxied
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
        ],
      },
      // Relaxed CSP for local development only. Do NOT enable these in production.
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow trusted external script origins used during development (e.g. Clerk),
            // and relax eval restrictions only in dev so webpack HMR works through strict proxies.
            value: [
              "default-src 'self' data: blob: https:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.dev https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src * data:",
              "connect-src *",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ]
  }
}
