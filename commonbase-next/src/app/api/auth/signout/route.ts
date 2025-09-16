import { NextRequest, NextResponse } from 'next/server'
import { isAuthEnabled } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Authentication not enabled' }, { status: 404 })
  }

  try {
    // Create response and clear session cookie
    const response = NextResponse.json({ message: 'Signed out successfully' })
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    // Create redirect response to home page and clear session cookie
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}