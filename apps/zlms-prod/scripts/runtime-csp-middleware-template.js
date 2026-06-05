// runtime-csp-middleware-template.js

import crypto from 'node:crypto';

export function cspMiddleware(req, res, next) {
  const nonce = crypto.randomBytes(16).toString('base64');

  res.locals.cspNonce = nonce;

  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', policy);

  next();
}
