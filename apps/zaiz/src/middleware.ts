import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for required Cloudflare Zero Trust headers
  const user = request.headers.get('CF-ZVEO-User');
  const groups = request.headers.get('CF-ZVEO-Groups');

  // In production, ZT will inject these headers.
  // For development, we might need a bypass or mock mechanism.
  if (!user && process.env.ENVIRONMENT === 'production') {
    return new NextResponse(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
