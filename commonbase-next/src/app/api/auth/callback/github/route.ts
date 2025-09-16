import { NextRequest, NextResponse } from 'next/server'
import {
  isAuthEnabled,
  exchangeCodeForToken,
  getGitHubUser,
  createSessionToken,
  isUserAllowed
} from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Authentication not enabled' }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') || '/'
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/error?error=NoCode', request.url))
    }

    console.log('Exchanging code for token...')
    const accessToken = await exchangeCodeForToken(code)

    console.log('Fetching user from GitHub...')
    const githubUser = await getGitHubUser(accessToken)

    // Check if user is allowed
    if (!isUserAllowed(githubUser.email || '')) {
      console.log('User not allowed:', githubUser.email)
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
    }

    console.log('Creating session token...')
    const sessionToken = await createSessionToken(githubUser)

    // Create response and set session cookie
    const response = NextResponse.redirect(new URL(state, request.url))
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    console.log('User signed in successfully:', githubUser.email)
    return response

  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/error?error=Configuration', request.url))
  }
}