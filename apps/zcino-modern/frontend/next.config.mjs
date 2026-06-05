/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/legacy/:path*',
        destination: 'http://localhost:3009/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
