import { getAuth, isAuthEnabled } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { handlers } = await getAuth()
  return handlers.GET!(req)
}

export const POST = async (req: Request) => {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { handlers } = await getAuth()
  return handlers.POST!(req)
}