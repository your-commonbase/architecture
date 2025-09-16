import { handlers, isAuthEnabled } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!handlers.GET) {
    return NextResponse.json({ error: 'Authentication not properly configured' }, { status: 500 })
  }

  return handlers.GET(req)
}

export const POST = async (req: Request) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!handlers.POST) {
    return NextResponse.json({ error: 'Authentication not properly configured' }, { status: 500 })
  }

  return handlers.POST(req)
}