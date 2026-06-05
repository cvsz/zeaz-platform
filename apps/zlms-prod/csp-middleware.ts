export type CspRequest = Readonly<{
  headers: Readonly<{ get(name: string): string | null }>;
}>;

export type CspResponse = {
  headers: { set(name: string, value: string): void };
};

export type CspNonceContext = Readonly<{
  nonce: string;
  csp: string;
}>;

const DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'strict-dynamic' 'nonce-{NONCE}'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
  "require-trusted-types-for 'script'",
  "trusted-types zlms#trusted-html react default"
] as const;

function randomNonce(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export function createCspNonceContext(): CspNonceContext {
  const nonce = randomNonce();
  const csp = DIRECTIVES.join('; ').replaceAll('{NONCE}', nonce);
  return { nonce, csp };
}

export function applyCspHeaders(response: CspResponse, context: CspNonceContext): CspResponse {
  response.headers.set('Content-Security-Policy', context.csp);
  response.headers.set('X-CSP-Nonce', context.nonce);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  return response;
}

export function cspMiddleware(_request: CspRequest, response: CspResponse): CspResponse {
  return applyCspHeaders(response, createCspNonceContext());
}
