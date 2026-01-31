/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "imgs.search.brave.com",
      "vcrdxonmajcnqzgsmrk.supabase.co",
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
