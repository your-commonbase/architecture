// Check if authentication should be enabled
export const isAuthEnabled = () => {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_ID &&
    process.env.GITHUB_SECRET
  )
}

// Conditional imports and configuration
let authOptions: any = null
let handlers: any = { GET: null, POST: null }
let auth: any = () => Promise.resolve(null)
let signIn: any = () => Promise.resolve()
let signOut: any = () => Promise.resolve()

// Only import and configure NextAuth if auth is enabled
if (isAuthEnabled()) {
  try {
    // Dynamic imports that only happen in production when auth is enabled
    const NextAuth = require('next-auth').default
    const GitHub = require('next-auth/providers/github').default
    const { DrizzleAdapter } = require('@auth/drizzle-adapter')
    const { db } = require('@/lib/db')

    authOptions = {
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
      debug: false, // Disable debug in production
    }

    const authInstance = NextAuth(authOptions)

    if (authInstance && authInstance.handlers) {
      handlers = authInstance.handlers
      auth = authInstance.auth
      signIn = authInstance.signIn
      signOut = authInstance.signOut
    } else {
      console.error('NextAuth instance creation failed')
    }
  } catch (error) {
    console.error('Failed to initialize NextAuth:', error)
    // Keep the stub functions
  }
}

export { authOptions, handlers, auth, signIn, signOut }