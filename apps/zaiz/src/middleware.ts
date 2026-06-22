import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { isRateLimited } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  const ip = request.ip || '127.0.0.1';

  // 1. Rate Limiting (Global for API)
  if (isRateLimited(ip)) {
    return NextResponse.json({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        request_id: crypto.randomUUID(),
      }
    }, { status: 429 });
  }

  // 2. Check for Cloudflare Zero Trust headers (Primary Auth)
  const user = request.headers.get('CF-ZVEO-User');
  
  if (!user && process.env.ENVIRONMENT === 'production') {
    return NextResponse.json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing identity headers',
        request_id: crypto.randomUUID(),
      }
    }, { status: 401 });
  }

  // 3. JWT Verification Hook
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.substring(7);
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(jwt, secret);
    } catch (e) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid JWT',
          request_id: crypto.randomUUID(),
        }
      }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'], // Apply to all API routes
};
