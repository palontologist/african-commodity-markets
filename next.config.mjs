/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@libsql/client"],
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
