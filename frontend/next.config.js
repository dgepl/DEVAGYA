/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'amlvyskjrencrolnppgs.supabase.co',
      'images.unsplash.com',
      'lh3.googleusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  async rewrites() {
    // In unified single-service hosting (Render node start.js / devgya.in), the Python FastAPI backend
    // runs on internal port 8000. Do NOT rewrite to devgya.in or NEXT_PUBLIC_API_URL if it points to self.
    const rawBackend = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${rawBackend}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/why-choose-us',
        permanent: true,
      },
      {
        source: '/ai-platform',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/dashboard/knowledge',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard/workflows',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
