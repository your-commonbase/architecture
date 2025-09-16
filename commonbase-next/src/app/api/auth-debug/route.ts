import { NextResponse } from 'next/server'
import { isAuthEnabled } from '@/auth'

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
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    AUTH_GITHUB_ID: !!process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: !!process.env.AUTH_GITHUB_SECRET,
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
    message: 'Auth.js v5 (NextAuth v5) debug info',
    NODE_ENV: process.env.NODE_ENV,
    authEnabled: true,
    authSystem: 'Auth.js v5 with GitHub provider',
    environmentVariables: envCheck,
    nextAuthUrlValid,
    // Show first/last chars of critical values for verification
    partialValues: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ?
        `${process.env.AUTH_GITHUB_ID.slice(0, 4)}...${process.env.AUTH_GITHUB_ID.slice(-4)}` :
        'NOT_SET'
    },
    recommendations: [
      !envCheck.AUTH_SECRET && 'Set AUTH_SECRET (generate with: openssl rand -base64 32)',
      !envCheck.NEXTAUTH_URL && 'Set NEXTAUTH_URL to your deployment URL',
      !envCheck.AUTH_GITHUB_ID && 'Set AUTH_GITHUB_ID from your GitHub OAuth app',
      !envCheck.AUTH_GITHUB_SECRET && 'Set AUTH_GITHUB_SECRET from your GitHub OAuth app',
      !nextAuthUrlValid && 'NEXTAUTH_URL must be a valid URL (https://your-domain.vercel.app)',
    ].filter(Boolean)
  })
}