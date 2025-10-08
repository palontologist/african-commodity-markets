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
  }
}

export default nextConfig
