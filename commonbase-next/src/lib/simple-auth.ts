import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

// Check if authentication should be enabled
export const isAuthEnabled = () => {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_ID &&
    process.env.GITHUB_SECRET
  )
}

// JWT secret key
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

// Create a session token
export async function createSessionToken(user: any): Promise<string> {
  return await new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url
    }
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

// Verify a session token
export async function verifySessionToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.user
  } catch {
    return null
  }
}

// Get user from GitHub API
export async function getGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user from GitHub')
  }

  return response.json()
}

// Exchange code for access token
export async function exchangeCodeForToken(code: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_ID!,
      client_secret: process.env.GITHUB_SECRET!,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data.access_token
}

// Get session from request
export async function getSession(request: NextRequest) {
  if (!isAuthEnabled()) {
    return null
  }

  const token = request.cookies.get('session')?.value
  if (!token) {
    return null
  }

  return await verifySessionToken(token)
}

// Check if user is allowed
export function isUserAllowed(email: string): boolean {
  const allowedUsers = process.env.ALLOWED_USERS?.split(',') || []
  return allowedUsers.length === 0 || allowedUsers.includes(email)
}

// Create GitHub OAuth URL
export function createGitHubAuthUrl(callbackUrl: string = '/'): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
    scope: 'user:email',
    state: callbackUrl,
  })

  return `https://github.com/login/oauth/authorize?${params}`
}