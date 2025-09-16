'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only check auth in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // If loading, wait
    if (status === 'loading') {
      return
    }

    // If not authenticated, redirect to signin
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname)
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
      return
    }
  }, [session, status, router])

  // In development, always show content
  if (process.env.NODE_ENV !== 'production') {
    return <>{children}</>
  }

  // In production, show loading state while checking auth
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // In production, show content only if authenticated
  if (status === 'authenticated') {
    return <>{children}</>
  }

  // Show fallback while redirecting
  return fallback || (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to sign in...</p>
      </div>
    </div>
  )
}