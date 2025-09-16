import { NextRequest, NextResponse } from 'next/server'
import { auth, isAuthEnabled } from '@/lib/auth'
import { deleteUserApiKey } from '@/lib/api-keys'

// DELETE - Delete a user's API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Authentication not enabled' }, { status: 404 })
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const keyId = resolvedParams.id
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
    }

    const deleted = await deleteUserApiKey(session.user.id, keyId)

    if (!deleted) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'API key deleted successfully' })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}