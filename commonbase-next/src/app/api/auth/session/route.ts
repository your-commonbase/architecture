import { NextRequest, NextResponse } from 'next/server'
import { getSession, isAuthEnabled } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = await getSession(request)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session endpoint error:', error)
    return NextResponse.json({ user: null })
  }
}