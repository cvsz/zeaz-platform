export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "x-xss-protection": "0",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload"
};

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
