import { getAuthInstance, isAuthEnabled } from '@/lib/auth-config'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const authInstance = await getAuthInstance()
    const handlers = authInstance.handlers

    console.log('NextAuth GET handler:', !!handlers.GET, typeof handlers.GET)

    if (!handlers.GET) {
      console.error('NextAuth GET handler not available:', handlers)
      return NextResponse.json({ error: 'Authentication not properly configured' }, { status: 500 })
    }

    return await handlers.GET(req)
  } catch (error) {
    console.error('NextAuth GET error:', error)
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
  }
}

export const POST = async (req: Request) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const authInstance = await getAuthInstance()
    const handlers = authInstance.handlers

    console.log('NextAuth POST handler:', !!handlers.POST, typeof handlers.POST)

    if (!handlers.POST) {
      console.error('NextAuth POST handler not available:', handlers)
      return NextResponse.json({ error: 'Authentication not properly configured' }, { status: 500 })
    }

    return await handlers.POST(req)
  } catch (error) {
    console.error('NextAuth POST error:', error)
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
  }
}