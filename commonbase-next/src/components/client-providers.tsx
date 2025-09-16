'use client';

import { KeyboardShortcuts } from './keyboard-shortcuts';
import { SessionProvider } from 'next-auth/react';

// Check if auth is enabled on client side
const isAuthEnabled = () => {
  return typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
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