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

  const fetchRandomEntries = async (count = 2) => {
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
        
        const newIds = newEntries.map((entry: Entry) => entry.id);
        setEntries(prev => [...prev, ...newEntries]);
        setExcludedIds(prev => [...prev, ...newIds]);
      }
    } catch (error) {
      console.error('Failed to fetch random entries:', error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [loading, hasMore]);

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
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-gray-600">Discover random entries from your commonbase</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh Feed
        </Button>
      </div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {entry.metadata?.type || 'text'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(entry.created)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(entry)}
                      disabled={isInCart(entry.id)}
                    >
                      {isInCart(entry.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/entry/${entry.id}`}>View</Link>
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
            <span className="text-gray-600">Loading more entries...</span>
          </div>
        </div>
      )}

      {!hasMore && entries.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            You've reached the end! You've seen all available entries.
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="mt-4"
          >
            Start Over
          </Button>
        </div>
      )}

      {entries.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-lg mb-2">No entries found</div>
              <div className="text-sm">
                Add some entries to your commonbase to see them in the feed.
              </div>
              <Button asChild className="mt-4">
                <Link href="/add">Add Your First Entry</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}