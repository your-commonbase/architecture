'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      // If user is typing, don't handle shortcuts
      if (isTyping) return;

      // Handle 'R' key for random entry
      if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        openRandomEntry();
      }
    };

    const openRandomEntry = async () => {
      try {
        const response = await fetch('/api/random', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: 1 }),
        });

        if (response.ok) {
          const entries = await response.json();
          if (entries.length > 0) {
            router.push(`/entry/${entries[0].id}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch random entry:', error);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  return null; // This component doesn't render anything
}