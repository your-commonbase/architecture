import { NextResponse } from 'next/server'
import { isAuthEnabled, getAuthInstance } from '@/lib/auth-config'

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

  // Test if auth instance can be created
  let authInstanceStatus = 'not_tested'
  let authHandlersAvailable = false
  try {
    const authInstance = await getAuthInstance()
    authInstanceStatus = 'success'
    authHandlersAvailable = !!(authInstance.handlers && authInstance.handlers.GET)
  } catch (error) {
    authInstanceStatus = `failed: ${error}`
  }

  return NextResponse.json({
    message: 'Authentication debug info',
    NODE_ENV: process.env.NODE_ENV,
    authEnabled: true,
    environmentVariables: envCheck,
    nextAuthUrlValid,
    authInstance: {
      status: authInstanceStatus,
      handlersAvailable: authHandlersAvailable
    },
    // Show first/last chars of critical values for verification
    partialValues: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      GITHUB_ID: process.env.GITHUB_ID ?
        `${process.env.GITHUB_ID.slice(0, 4)}...${process.env.GITHUB_ID.slice(-4)}` :
        'NOT_SET'
    },
    recommendations: [
      !envCheck.NEXTAUTH_SECRET && 'Set NEXTAUTH_SECRET (generate with: openssl rand -base64 32)',
      !envCheck.NEXTAUTH_URL && 'Set NEXTAUTH_URL to your deployment URL',
      !envCheck.GITHUB_ID && 'Set GITHUB_ID from your GitHub OAuth app',
      !envCheck.GITHUB_SECRET && 'Set GITHUB_SECRET from your GitHub OAuth app',
      !nextAuthUrlValid && 'NEXTAUTH_URL must be a valid URL (https://your-domain.vercel.app)',
      authInstanceStatus !== 'success' && 'NextAuth instance creation failed',
      !authHandlersAvailable && 'NextAuth handlers not available',
    ].filter(Boolean)
  })
}