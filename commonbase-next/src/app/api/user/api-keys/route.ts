import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthEnabled } from '@/lib/auth'
import { createUserApiKey, getUserApiKeys } from '@/lib/api-keys'

// GET - List user's API keys
export async function GET() {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Authentication not enabled' }, { status: 404 })
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await getUserApiKeys(session.user.id)
    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Authentication not enabled' }, { status: 404 })
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const result = await createUserApiKey(session.user.id, name.trim())

    return NextResponse.json({
      id: result.id,
      name: name.trim(),
      key: result.key,
      message: 'API key created successfully. Save this key securely - it will not be shown again.'
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}