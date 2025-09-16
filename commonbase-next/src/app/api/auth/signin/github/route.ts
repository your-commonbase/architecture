import { NextRequest, NextResponse } from 'next/server'
import { isAuthEnabled, createGitHubAuthUrl } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Authentication not enabled' }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const authUrl = createGitHubAuthUrl(callbackUrl)
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('GitHub sign-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}