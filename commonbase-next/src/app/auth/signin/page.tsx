'use client'

import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function SignInContent() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSignIn = async () => {
    setLoading(true)
    try {
      // Direct redirect to NextAuth GitHub provider instead of using React hooks
      const authUrl = `/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`
      window.location.href = authUrl
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2"
    >
      <Github className="w-5 h-5" />
      {loading ? 'Signing in...' : 'Continue with GitHub'}
    </Button>
  )
}

export default function SignInPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In to Commonbase</CardTitle>
          <p className="text-gray-600 mt-2">
            Access your team&apos;s knowledge base
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={
            <Button
              disabled
              className="w-full flex items-center justify-center gap-2"
            >
              <Github className="w-5 h-5" />
              Loading...
            </Button>
          }>
            <SignInContent />
          </Suspense>

          <div className="text-center text-sm text-gray-500">
            Only authorized team members can access this instance
          </div>
        </CardContent>
      </Card>
    </div>
  )
}