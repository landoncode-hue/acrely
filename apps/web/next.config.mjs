/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@acrely/ui", "@acrely/services", "@acrely/utils"],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@acrely/ui", "lucide-react"],
  },
};

export default nextConfig;
