/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@taskflow/ui', '@taskflow/shared'],
  swcMinify: true,
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@taskflow/ui', 'date-fns'],
  },
  modularizeImports: {
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
