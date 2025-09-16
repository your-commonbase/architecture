// Check if authentication should be enabled
export const isAuthEnabled = () => {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_ID &&
    process.env.GITHUB_SECRET
  )
}

// Lazy-loaded auth instance
let cachedAuthInstance: any = null

export function getAuthInstance() {
  if (!isAuthEnabled()) {
    return {
      authOptions: null,
      handlers: { GET: null, POST: null },
      auth: () => Promise.resolve(null),
      signIn: () => Promise.resolve(),
      signOut: () => Promise.resolve()
    }
  }

  if (cachedAuthInstance) {
    return cachedAuthInstance
  }

  try {
    const NextAuth = require('next-auth').default
    const GitHub = require('next-auth/providers/github').default
    const { DrizzleAdapter } = require('@auth/drizzle-adapter')
    const { db } = require('@/lib/db')

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

    const authInstance = NextAuth(authOptions)

    cachedAuthInstance = {
      authOptions,
      handlers: authInstance.handlers || { GET: null, POST: null },
      auth: authInstance.auth || (() => Promise.resolve(null)),
      signIn: authInstance.signIn || (() => Promise.resolve()),
      signOut: authInstance.signOut || (() => Promise.resolve())
    }

    return cachedAuthInstance
  } catch (error) {
    console.error('Failed to initialize NextAuth:', error)
    cachedAuthInstance = {
      authOptions: null,
      handlers: { GET: null, POST: null },
      auth: () => Promise.resolve(null),
      signIn: () => Promise.resolve(),
      signOut: () => Promise.resolve()
    }
    return cachedAuthInstance
  }
}

// Export lazy-loaded values
export const authOptions = () => getAuthInstance().authOptions
export const handlers = () => getAuthInstance().handlers
export const auth = () => getAuthInstance().auth()
export const signIn = () => getAuthInstance().signIn()
export const signOut = () => getAuthInstance().signOut()