/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['openai'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
