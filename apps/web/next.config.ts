import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.zeaz.dev",
          },
        ],
        destination: "https://zeaz.dev/:path*",
        permanent: true,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "zcfdash.zeaz.dev",
          },
        ],
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
