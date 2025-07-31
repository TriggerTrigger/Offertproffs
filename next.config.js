/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com"
    ]
  },
  distDir: '.next',
  trailingSlash: false,
  swcMinify: true,
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
