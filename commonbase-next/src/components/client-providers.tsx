'use client';

import { KeyboardShortcuts } from './keyboard-shortcuts';
import { SessionProvider } from 'next-auth/react';
import { AuthGuard } from './auth-guard';
import { usePathname } from 'next/navigation';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't wrap auth pages with AuthGuard
  const isAuthPage = pathname?.startsWith('/auth/')

  const content = (
    <>
      <KeyboardShortcuts />
      {children}
    </>
  )

  const protectedContent = isAuthPage ? content : (
    <AuthGuard>
      {content}
    </AuthGuard>
  )

  return (
    <SessionProvider>
      {protectedContent}
    </SessionProvider>
  )
}