/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow 127.0.0.1 for development (required for Spotify OAuth)
  allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: '*.spotifycdn.com',
      },
    ],
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  // Ensure API routes are not cached
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        { key: 'Pragma', value: 'no-cache' },
      ],
    },
    {
      // Cache proxy images aggressively
      source: '/api/proxy-image',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
      ],
    },
  ],
};

export default nextConfig;
