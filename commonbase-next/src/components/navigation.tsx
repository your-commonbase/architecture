'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getCart } from '@/lib/cart';
import { useState, useEffect } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCart().length);
    };

    updateCartCount();
    
    // Listen for cart updates
    const handleStorageChange = () => updateCartCount();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdate', handleStorageChange);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary">
              YCB / Commonbase
            </Link>
            
            <div className="flex space-x-4">
              <Button
                variant={isActive('/ledger') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/ledger">Ledger</Link>
              </Button>
              
              <Button
                variant={isActive('/search') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/search">Search</Link>
              </Button>
              
              <Button
                variant={isActive('/add') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/add">Add</Link>
              </Button>
              
              <Button
                variant={isActive('/feed') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/feed">Feed</Link>
              </Button>
              
              <Button
                variant={isActive('/share') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/share">
                  Share {cartCount > 0 && `(${cartCount})`}
                </Link>
              </Button>

              <Button
                variant={isActive('/graph') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/graph">Graph</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}