import { NextRequest } from 'next/server'
import { getAuthInstance, isAuthEnabled } from '@/lib/auth'
import { validateUserApiKey } from '@/lib/api-keys'

// Check if API request is authenticated
export async function validateApiRequest(request: NextRequest): Promise<{
  isValid: boolean,
  error?: string,
  user?: { id: string; name?: string; email?: string }
}> {
  // If auth is not enabled (local development), allow all requests
  if (!isAuthEnabled()) {
    return { isValid: true }
  }

  // Check for API key in headers
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) {
    // First check if it's the master API key
    if (apiKey === process.env.API_KEY) {
      return { isValid: true }
    }

    // Then check if it's a user-specific API key
    try {
      const userInfo = await validateUserApiKey(apiKey)
      if (userInfo) {
        return {
          isValid: true,
          user: {
            id: userInfo.userId,
            name: userInfo.userName,
            email: userInfo.userEmail
          }
        }
      }
    } catch (error) {
      console.error('User API key validation error:', error)
    }
  }

  // Check for valid session (for web app requests)
  try {
    const authInstance = await getAuthInstance()
    const session = await authInstance.auth()
    if (session?.user) {
      return { isValid: true, user: session.user }
    }
  } catch (error) {
    console.error('Session validation error:', error)
  }

  return {
    isValid: false,
    error: 'Authentication required. Provide x-api-key header or valid session.'
  }
}

// Helper function to check if request should be protected
export function shouldProtectRoute(pathname: string): boolean {
  if (!isAuthEnabled()) return false

  // Protect all API routes except auth routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    return true
  }

  return false
}