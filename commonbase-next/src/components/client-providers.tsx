'use client';

import { KeyboardShortcuts } from './keyboard-shortcuts';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KeyboardShortcuts />
      {children}
    </>
  );
}