declare const process: { readonly env: { readonly NODE_ENV?: string } };

type SecurityHeader = Readonly<{ key: string; value: string }>;
type HeaderRule = Readonly<{ source: string; headers: readonly SecurityHeader[] }>;
type MinimalNextConfig = Readonly<{
  reactStrictMode: boolean;
  poweredByHeader: boolean;
  output: 'standalone';
  experimental: Readonly<{
    serverActions: Readonly<{ allowedOrigins: readonly string[] }>;
    typedRoutes: boolean;
  }>;
  compiler: Readonly<{ reactRemoveProperties: boolean }>;
  headers: () => Promise<readonly HeaderRule[]>;
}>;

const nextConfig: MinimalNextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: []
    },
    typedRoutes: true
  },
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production'
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }
      ]
    }
  ]
};

export default nextConfig;
