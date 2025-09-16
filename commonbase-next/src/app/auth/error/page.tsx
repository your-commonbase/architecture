'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

const errorMessages: Record<string, string> = {
  AccessDenied: 'You do not have permission to sign in. Please contact your team administrator.',
  Configuration: 'There was a problem with the server configuration. Please try again later.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during sign in. Please try again.'
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  const message = errorMessages[error] || errorMessages.Default

  return (
    <>
      <p className="text-gray-700">{message}</p>
      <div className="space-y-2">
        <Button asChild className="w-full">
          <Link href="/auth/signin">Try Again</Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </>
  )
}

export default function AuthErrorPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-900">Sign In Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Suspense fallback={
            <div>
              <p className="text-gray-700">Loading...</p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/signin">Try Again</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Go to Homepage</Link>
                </Button>
              </div>
            </div>
          }>
            <ErrorContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}