'use client';

import { KeyboardShortcuts } from './keyboard-shortcuts';
import { SessionProvider } from 'next-auth/react';

// Check if auth is enabled on client side
const isAuthEnabled = () => {
  // For now, disable SessionProvider entirely to avoid API calls
  // until NextAuth is working properly
  return false
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const authEnabled = isAuthEnabled()

  const content = (
    <>
      <KeyboardShortcuts />
      {children}
    </>
  )

  // Wrap with SessionProvider only if auth is enabled
  if (authEnabled) {
    return (
      <SessionProvider>
        {content}
      </SessionProvider>
    )
  }

  return content
}