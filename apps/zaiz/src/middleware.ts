import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // 1. Check for Cloudflare Zero Trust headers (Primary Auth)
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

  // 2. JWT Verification Hook
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
