/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  // other options …
};

module.exports = nextConfig;
