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
    const { default: NextAuth } = await import('next-auth')
    const { default: GitHub } = await import('next-auth/providers/github')
    const { DrizzleAdapter } = await import('@auth/drizzle-adapter')
    const { db } = await import('@/lib/db')

    const authOptions = {
      adapter: DrizzleAdapter(db),
      providers: [
        GitHub({
          clientId: process.env.GITHUB_ID!,
          clientSecret: process.env.GITHUB_SECRET!,
        }),
      ],
      callbacks: {
        async signIn({ user, account, profile }: any) {
          const allowedUsers = process.env.ALLOWED_USERS?.split(',') || []
          if (allowedUsers.length > 0 && !allowedUsers.includes(user.email || '')) {
            return false
          }
          return true
        },
        async session({ session, user }: any) {
          if (user?.id) {
            session.user.id = user.id
          }
          return session
        },
      },
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
      debug: false,
    }

    return NextAuth(authOptions)
  } catch (error) {
    console.error('Failed to create NextAuth config:', error)
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