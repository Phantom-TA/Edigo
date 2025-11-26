/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: "export", // enables static export
  images: {
    domains: [
      "imgs.search.brave.com",
      "vcrdxomnajcnqnzgsrmk.supabase.co", // Updated to match current Supabase project
    ],
  },
};

module.exports = nextConfig;
