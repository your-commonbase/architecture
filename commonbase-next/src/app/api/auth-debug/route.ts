import { NextResponse } from 'next/server'
import { isAuthEnabled } from '@/lib/simple-auth'

export async function GET() {
  // Only provide debug info if auth is supposed to be enabled
  if (!isAuthEnabled()) {
    return NextResponse.json({
      message: 'Authentication is disabled (local development mode)',
      NODE_ENV: process.env.NODE_ENV,
      authEnabled: false
    })
  }

  // Check which environment variables are set (without exposing their values)
  const envCheck = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    GITHUB_ID: !!process.env.GITHUB_ID,
    GITHUB_SECRET: !!process.env.GITHUB_SECRET,
    API_KEY: !!process.env.API_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
  }

  // Validate NEXTAUTH_URL format if set
  let nextAuthUrlValid = false
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL)
      nextAuthUrlValid = true
    } catch {
      nextAuthUrlValid = false
    }
  }

  return NextResponse.json({
    message: 'Custom authentication debug info',
    NODE_ENV: process.env.NODE_ENV,
    authEnabled: true,
    authSystem: 'Custom GitHub OAuth (NextAuth disabled)',
    environmentVariables: envCheck,
    nextAuthUrlValid,
    customAuthEndpoints: {
      signin: '/api/auth/signin/github',
      callback: '/api/auth/callback/github',
      session: '/api/auth/session',
      signout: '/api/auth/signout'
    },
    // Show first/last chars of critical values for verification
    partialValues: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      GITHUB_ID: process.env.GITHUB_ID ?
        `${process.env.GITHUB_ID.slice(0, 4)}...${process.env.GITHUB_ID.slice(-4)}` :
        'NOT_SET'
    },
    recommendations: [
      !envCheck.NEXTAUTH_SECRET && 'Set NEXTAUTH_SECRET (used for JWT signing)',
      !envCheck.NEXTAUTH_URL && 'Set NEXTAUTH_URL to your deployment URL',
      !envCheck.GITHUB_ID && 'Set GITHUB_ID from your GitHub OAuth app',
      !envCheck.GITHUB_SECRET && 'Set GITHUB_SECRET from your GitHub OAuth app',
      !nextAuthUrlValid && 'NEXTAUTH_URL must be a valid URL (https://your-domain.vercel.app)',
    ].filter(Boolean)
  })
}