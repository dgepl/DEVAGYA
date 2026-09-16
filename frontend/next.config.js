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
    let rawBackend = process.env.BACKEND_URL;
    if (!rawBackend && process.env.NEXT_PUBLIC_API_URL) {
      try {
        const u = new URL(process.env.NEXT_PUBLIC_API_URL);
        if (!u.hostname.includes('devgya.in') && !u.hostname.includes('devgya.com') && !u.hostname.includes('localhost') && !u.hostname.includes('127.0.0.1')) {
          rawBackend = `${u.protocol}//${u.host}`;
        }
      } catch (e) {}
    }
    if (!rawBackend) {
      rawBackend = 'http://127.0.0.1:8000';
    }
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
