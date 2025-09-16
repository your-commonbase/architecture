import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"

// Check if authentication should be enabled
export const isAuthEnabled = () => {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXTAUTH_SECRET &&
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET
  )
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!isAuthEnabled()) return true

      const allowedUsers = process.env.ALLOWED_USERS?.split(',') || []
      if (allowedUsers.length > 0 && !allowedUsers.includes(user.email || '')) {
        return false
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)