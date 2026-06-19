/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set workspace root for Turbopack & output tracing
  outputFileTracingRoot: process.cwd(),   // Current package root
  experimental: {
    turbopack: {
      root: process.cwd(),   // Force correct workspace root
    },
  },

  // Other recommended monorepo settings
  transpilePackages: ['@zeaz/*'], // Add shared packages if any

  // Silence warnings and improve build
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
