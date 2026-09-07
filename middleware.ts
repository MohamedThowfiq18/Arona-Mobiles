import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOwnerSessionFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Protect Owner API routes (/api/owner/*) ────────────────
  if (pathname.startsWith('/api/owner')) {
    const session = await getOwnerSessionFromRequest(request);
    if (!session || session.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized: Owner session required.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ── 2. Protect Owner Portal UI routes (/owner-portal/*) ──────
  if (pathname.startsWith('/owner-portal')) {
    const isLoginPage = pathname === '/owner-portal/login';
    const isOtpPage = pathname === '/owner-portal/verify-otp';
    const isForgotPasswordPage = pathname === '/owner-portal/forgot-password';
    const isPublicOwnerRoute = isLoginPage || isOtpPage || isForgotPasswordPage;

    const session = await getOwnerSessionFromRequest(request);

    if (!isPublicOwnerRoute) {
      if (!session || session.role !== 'owner') {
        const loginUrl = new URL('/owner-portal/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // If already logged in and hitting the login page, redirect to dashboard
    if (isLoginPage && session && session.role === 'owner') {
      return NextResponse.redirect(new URL('/owner-portal', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all owner portal and owner API routes
    '/owner-portal/:path*',
    '/api/owner/:path*',
  ],
};
