import { NextResponse } from 'next/server'

// NextAuth is disabled - we now use custom auth
export const GET = async (req: Request) => {
  return NextResponse.json({ error: 'NextAuth disabled - use custom auth endpoints' }, { status: 404 })
}

export const POST = async (req: Request) => {
  return NextResponse.json({ error: 'NextAuth disabled - use custom auth endpoints' }, { status: 404 })
}