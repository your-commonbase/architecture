import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAuthEnabled } from '@/auth'

export default async function middleware(request: NextRequest) {
  // Skip all middleware if auth is not enabled (local development)
  if (!isAuthEnabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Don't protect auth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    // Check for API key
    const apiKey = request.headers.get('x-api-key')
    if (apiKey && apiKey === process.env.API_KEY) {
      return NextResponse.next()
    }

    // Check for valid session
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (token?.sub) {
        return NextResponse.next()
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
    }

    // No valid auth found
    return NextResponse.json(
      { error: 'Authentication required. Provide x-api-key header or sign in.' },
      { status: 401 }
    )
  }

  // Protect web pages (redirect to sign-in)
  if (pathname !== '/auth/signin' && pathname !== '/auth/error') {
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (!token?.sub) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }
    } catch (error) {
      console.error('Middleware session error:', error)
      const signInUrl = new URL('/auth/signin', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}