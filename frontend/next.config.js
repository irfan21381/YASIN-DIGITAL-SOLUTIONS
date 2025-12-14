/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['localhost'],
  },

  env: {
    // Frontend ALWAYS talks to backend via /api
    NEXT_PUBLIC_API_BASE: "/api",
  },
};

module.exports = nextConfig;
