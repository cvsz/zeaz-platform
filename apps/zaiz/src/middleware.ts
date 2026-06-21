import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // 2. JWT Verification Hook (Placeholder for future implementation)
  const jwt = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (jwt) {
    // TODO: Integrate JWT verification logic here (e.g., using jose library)
    // Validate JWT and proceed or return 401
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
