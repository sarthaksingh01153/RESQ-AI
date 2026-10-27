import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/',
  '/report',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/incidents',
  '/api/weather',
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/track/')) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/favicon')) return true;
  if (pathname.startsWith('/public/')) return true;
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = request.cookies.get('resq_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'resq-ai-super-secret-jwt-key-change-in-production-2024'
    );
    const { payload } = await jwtVerify(token, secret);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('x-user-email', payload.email as string);

    // Role guard for dashboard sub-routes
    if (pathname.startsWith('/dashboard/inventory') || pathname.startsWith('/api/inventory')) {
      const role = payload.role as string;
      if (!['INVENTORY_MANAGER', 'ADMIN', 'OFFICER'].includes(role)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('resq_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

