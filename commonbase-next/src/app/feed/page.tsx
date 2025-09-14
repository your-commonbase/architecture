'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addToCart, isInCart } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';

interface Entry {
  id: string;
  data: string;
  metadata?: any;
  created: string;
  updated: string;
}

export default function FeedPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRandomEntries = useCallback(async (count = 10) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count,
          exclude: excludedIds,
        }),
      });
      
      if (response.ok) {
        const newEntries = await response.json();
        
        if (newEntries.length === 0) {
          setHasMore(false);
          return;
        }
        
        // Use functional state update to prevent duplicates
        setEntries(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const uniqueNewEntries = newEntries.filter((entry: Entry) => !existingIds.has(entry.id));
          return [...prev, ...uniqueNewEntries];
        });
        
        const newIds = newEntries.map((entry: Entry) => entry.id);
        setExcludedIds(prev => [...prev, ...newIds]);
      }
    } catch (error) {
      console.error('Failed to fetch random entries:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, excludedIds]);

  useEffect(() => {
    fetchRandomEntries();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
        && !loading && hasMore
      ) {
        fetchRandomEntries();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, fetchRandomEntries]);

  const handleAddToCart = (entry: Entry) => {
    addToCart({
      id: entry.id,
      data: entry.data,
      metadata: entry.metadata,
    });
    
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const handleRefresh = () => {
    setEntries([]);
    setExcludedIds([]);
    setHasMore(true);
    fetchRandomEntries();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-black">📖 Feed</h1>
          <p className="text-sm sm:text-base text-black font-semibold">Discover random entries from your commonbase</p>
        </div>
        <Button onClick={handleRefresh} variant="accent" className="w-full sm:w-auto">
          🔄 Refresh Feed
        </Button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {entries.map((entry) => (
          <Card key={entry.id} className="neo-lime hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000000] transition-all">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 border-2 border-black text-xs font-bold bg-white text-black">
                      {entry.metadata?.type || 'text'}
                    </span>
                    <span className="text-xs text-black font-semibold">
                      {formatDate(entry.created)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="pink"
                      onClick={() => handleAddToCart(entry)}
                      disabled={isInCart(entry.id)}
                      className="w-full sm:w-auto"
                    >
                      {isInCart(entry.id) ? '✓ In Cart' : '📦 Add to Cart'}
                    </Button>
                    <Button size="sm" variant="secondary" asChild className="w-full sm:w-auto">
                      <Link href={`/entry/${entry.id}`}>👁️ View</Link>
                    </Button>
                  </div>
                </div>

                {entry.metadata?.type === 'image' && entry.metadata?.source && (
                  <div className="mb-4">
                    <Image
                      src={entry.metadata.source}
                      alt="Entry image"
                      width={600}
                      height={400}
                      className="rounded-lg object-cover w-full max-h-96"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {truncateText(entry.data)}
                  </p>
                </div>

                {entry.metadata?.source && entry.metadata?.title && (
                  <div className="pt-2 border-t">
                    <a
                      href={entry.metadata.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm inline-flex items-center"
                    >
                      {entry.metadata.title}
                      <svg 
                        className="w-3 h-3 ml-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                        />
                      </svg>
                    </a>
                  </div>
                )}

                {(entry.metadata?.links?.length > 0 || entry.metadata?.backlinks?.length > 0) && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t">
                    {entry.metadata?.links?.length > 0 && (
                      <span>🔗 {entry.metadata.links.length} link{entry.metadata.links.length !== 1 ? 's' : ''}</span>
                    )}
                    {entry.metadata?.backlinks?.length > 0 && (
                      <span>↩ {entry.metadata.backlinks.length} backlink{entry.metadata.backlinks.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-black font-semibold">Loading more entries...</span>
          </div>
        </div>
      )}

      {!hasMore && entries.length > 0 && (
        <div className="text-center py-8">
          <div className="neo-card neo-cyan p-6">
            <div className="text-black font-bold text-lg mb-2">
              🎉 You've reached the end!
            </div>
            <div className="text-black font-semibold">
              You've seen all available entries.
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="orange" 
              className="mt-4"
            >
              🔄 Start Over
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 && !loading && (
        <Card className="neo-red">
          <CardContent className="text-center py-12">
            <div className="text-black">
              <div className="text-2xl font-black mb-4">🚨 No entries found</div>
              <div className="text-base font-semibold mb-6">
                Add some entries to your commonbase to see them in the feed.
              </div>
              <Button asChild variant="accent">
                <Link href="/add">✨ Add Your First Entry</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}