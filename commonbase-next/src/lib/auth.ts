// Check if authentication should be enabled
export const isAuthEnabled = () => {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_ID &&
    process.env.GITHUB_SECRET
  )
}

// Stub exports for when auth is disabled
const authStub = {
  handlers: { GET: null, POST: null },
  auth: () => Promise.resolve(null),
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
}

// Dynamic auth loader - only imports NextAuth when actually needed
async function loadAuthConfig() {
  if (!isAuthEnabled()) {
    return { authOptions: null, ...authStub }
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
          session.user.id = user.id
          return session
        },
      },
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
    }

    const authInstance = NextAuth(authOptions)
    return { authOptions, ...authInstance }
  } catch (error) {
    console.warn('NextAuth modules not available, using stubs:', error)
    return { authOptions: null, ...authStub }
  }
}

// Cache for the auth instance
let authCache: any = null

// Get auth instance (lazy loaded)
export async function getAuth() {
  if (authCache === null) {
    authCache = await loadAuthConfig()
  }
  return authCache
}

// Sync exports for compatibility (will be stubs when auth disabled)
export const authOptions = null
export const handlers = authStub.handlers
export const auth = authStub.auth
export const signIn = authStub.signIn
export const signOut = authStub.signOut