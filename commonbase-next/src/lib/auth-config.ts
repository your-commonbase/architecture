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

    const { default: GitHub } = await import('next-auth/providers/github')
    console.log('GitHub provider imported successfully')

    // Validate environment variables before using them
    if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
      throw new Error('Missing GITHUB_ID or GITHUB_SECRET environment variables')
    }

    // Simple configuration without Drizzle adapter to avoid slice error
    const authOptions = {
      providers: [
        GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
        }),
      ],
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

    console.log('Creating NextAuth instance...')
    const authInstance = NextAuth(authOptions)
    console.log('NextAuth instance created successfully')

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
    if (authInstance && authInstance.handlers) {
      return {
        handlers: authInstance.handlers,
        auth: authInstance.auth,
        signIn: authInstance.signIn,
        signOut: authInstance.signOut
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