'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getCart } from '@/lib/cart';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-primary">
              <Image
                src="/logo.png"
                alt="YCB / Commonbase Logo"
                width={24}
                height={24}
                className="object-contain sm:w-8 sm:h-8"
              />
              <span className="hidden sm:block">YCB / Commonbase</span>
              <span className="sm:hidden">YCB</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-2">
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

          {/* Mobile Navigation */}
          <div className="lg:hidden flex space-x-1">
            <Button
              variant={isActive('/search') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href="/search" className="p-2">🔍</Link>
            </Button>
            
            <Button
              variant={isActive('/add') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href="/add" className="p-2">➕</Link>
            </Button>
            
            <Button
              variant={isActive('/share') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href="/share" className="p-2 relative">
                🔗
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant={isActive('/ledger') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href="/ledger" className="p-2">📚</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}