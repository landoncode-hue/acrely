/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@acrely/ui", "@acrely/services", "@acrely/utils"],
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  experimental: {
    optimizePackageImports: ["@acrely/ui", "lucide-react", "recharts"],
  },
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
};

export default nextConfig;
