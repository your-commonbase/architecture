import { NextRequest, NextResponse } from 'next/server'

export default function middleware(request: NextRequest) {
  // In local development, always allow access
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  // Check if auth is configured
  const isAuthConfigured = !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET
  )

  // If auth is not configured in production, allow access (fallback)
  if (!isAuthConfigured) {
    return NextResponse.next()
  }

  // Always allow auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Always allow debug route
  if (request.nextUrl.pathname === '/api/auth-debug') {
    return NextResponse.next()
  }

  // For all other routes, let NextAuth and individual route handlers
  // handle authentication. This minimal middleware just ensures
  // we don't interfere with the auth flow.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}