// Check if authentication should be enabled
export const isAuthEnabled = () => {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_ID &&
    process.env.GITHUB_SECRET
  )
}

// Create NextAuth configuration
export async function createAuthConfig() {
  if (!isAuthEnabled()) {
    return null
  }

  try {
    console.log('Creating NextAuth config...')
    console.log('Environment check:', {
      GITHUB_ID: !!process.env.GITHUB_ID,
      GITHUB_SECRET: !!process.env.GITHUB_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL
    })

    const { default: NextAuth } = await import('next-auth')
    console.log('NextAuth imported successfully')

    // Try creating NextAuth with minimal config first (no providers)
    console.log('Testing minimal NextAuth config...')
    const minimalOptions = {
      providers: [],
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
      debug: false,
    }

    console.log('Creating minimal NextAuth instance...')
    const minimalInstance = NextAuth(minimalOptions)
    console.log('Minimal NextAuth instance created successfully')

    // If that works, try with GitHub provider
    const { default: GitHub } = await import('next-auth/providers/github')
    console.log('GitHub provider imported successfully')

    // Validate environment variables before using them
    if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
      throw new Error('Missing GITHUB_ID or GITHUB_SECRET environment variables')
    }

    console.log('Creating GitHub provider...')
    const githubProvider = GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
    console.log('GitHub provider created successfully')

    // Full configuration with GitHub provider
    const authOptions = {
      providers: [githubProvider],
      callbacks: {
        async signIn({ user, account, profile }: any) {
          try {
            const allowedUsers = process.env.ALLOWED_USERS?.split(',') || []
            if (allowedUsers.length > 0 && !allowedUsers.includes(user.email || '')) {
              return false
            }
            return true
          } catch (error) {
            console.error('SignIn callback error:', error)
            return false
          }
        },
        async session({ session, user }: any) {
          try {
            if (user?.id) {
              session.user.id = user.id
            }
            return session
          } catch (error) {
            console.error('Session callback error:', error)
            return session
          }
        },
      },
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
      debug: false,
    }

    console.log('Creating full NextAuth instance...')
    const authInstance = NextAuth(authOptions)
    console.log('Full NextAuth instance created successfully')
    console.log('Auth instance type:', typeof authInstance)
    console.log('Auth instance keys:', Object.keys(authInstance || {}))

    // In NextAuth v4, the instance IS the handlers object
    if (typeof authInstance === 'function') {
      console.log('NextAuth returned a function, trying to extract handlers...')
      return {
        handlers: {
          GET: authInstance,
          POST: authInstance
        },
        auth: authInstance.auth || (() => Promise.resolve(null)),
        signIn: authInstance.signIn || (() => Promise.resolve()),
        signOut: authInstance.signOut || (() => Promise.resolve())
      }
    }

    return authInstance
  } catch (error) {
    console.error('Failed to create NextAuth config:', error)
    console.error('Error details:', error instanceof Error ? error.stack : error)
    return null
  }
}

// Lazy-loaded auth instance with proper async handling
let authPromise: Promise<any> | null = null

export async function getAuthInstance() {
  if (!isAuthEnabled()) {
    return {
      handlers: { GET: null, POST: null },
      auth: () => Promise.resolve(null),
      signIn: () => Promise.resolve(),
      signOut: () => Promise.resolve()
    }
  }

  if (!authPromise) {
    authPromise = createAuthConfig()
  }

  try {
    const authInstance = await authPromise
    console.log('Auth instance in getAuthInstance:', typeof authInstance, Object.keys(authInstance || {}))

    if (authInstance) {
      // Handle different NextAuth v4 return formats
      if (authInstance.handlers) {
        // Standard format with separate handlers
        return {
          handlers: authInstance.handlers,
          auth: authInstance.auth || (() => Promise.resolve(null)),
          signIn: authInstance.signIn || (() => Promise.resolve()),
          signOut: authInstance.signOut || (() => Promise.resolve())
        }
      } else if (typeof authInstance === 'function') {
        // Function format - the function IS the handler
        return {
          handlers: { GET: authInstance, POST: authInstance },
          auth: authInstance.auth || (() => Promise.resolve(null)),
          signIn: authInstance.signIn || (() => Promise.resolve()),
          signOut: authInstance.signOut || (() => Promise.resolve())
        }
      } else {
        // Direct object format
        return {
          handlers: {
            GET: authInstance.GET || null,
            POST: authInstance.POST || null
          },
          auth: authInstance.auth || (() => Promise.resolve(null)),
          signIn: authInstance.signIn || (() => Promise.resolve()),
          signOut: authInstance.signOut || (() => Promise.resolve())
        }
      }
    }
  } catch (error) {
    console.error('Failed to get auth instance:', error)
  }

  // Fallback
  return {
    handlers: { GET: null, POST: null },
    auth: () => Promise.resolve(null),
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve()
  }
}

// Export functions that create instances on demand
export const authOptions = async () => {
  const instance = await getAuthInstance()
  return instance
}

export const auth = async () => {
  const instance = await getAuthInstance()
  return instance.auth()
}

export const signIn = async () => {
  const instance = await getAuthInstance()
  return instance.signIn()
}

export const signOut = async () => {
  const instance = await getAuthInstance()
  return instance.signOut()
}