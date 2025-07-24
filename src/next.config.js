// next.config.js (repo root)
 /** @type {import('next').NextConfig} */
 const nextConfig = {
   reactStrictMode: true,
   images: {
     domains: ['your-supabase-project.supabase.co'],
     formats: ['image/avif','image/webp'],
   },
 };
 module.exports = nextConfig;
