'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { addToCart, isInCart } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  data: string;
  metadata?: any;
  created: string;
  updated: string;
  type: 'semantic' | 'fts';
  similarity?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'both' | 'semantic' | 'fulltext'>('both');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const searchTypes: any = {};
      
      if (searchMode === 'both' || searchMode === 'semantic') {
        searchTypes.semantic = { options: { limit: 10, threshold: 0.5 } };
      }
      
      if (searchMode === 'both' || searchMode === 'fulltext') {
        searchTypes.fulltext = { options: { limit: 10 } };
      }
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          types: searchTypes,
        }),
      });
      
      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (result: SearchResult) => {
    addToCart({
      id: result.id,
      data: result.data,
      metadata: result.metadata,
    });
    
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter your search query..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (hasSearched && e.target.value.trim() !== query.trim()) {
                    setHasSearched(false);
                  }
                }}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading || !query.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={searchMode === 'both' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('both')}
              >
                Both
              </Button>
              <Button
                variant={searchMode === 'semantic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('semantic')}
              >
                Semantic
              </Button>
              <Button
                variant={searchMode === 'fulltext' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('fulltext')}
              >
                Full-text
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </div>
          
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.type === 'semantic' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.type === 'semantic' ? 'Semantic' : 'Full-text'}
                      </span>
                      
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {result.metadata?.type || 'text'}
                      </span>
                      
                      {result.similarity && (
                        <span className="text-xs text-gray-500">
                          {(result.similarity * 100).toFixed(1)}% match
                        </span>
                      )}
                    </div>
                    
                    {result.metadata?.type === 'image' && result.metadata?.source && (
                      <div className="mb-3">
                        <Image
                          src={result.metadata.source}
                          alt="Search result image"
                          width={200}
                          height={150}
                          className="rounded object-cover"
                        />
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-sm max-w-none mb-2"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.data.substring(0, 300), query) + 
                                (result.data.length > 300 ? '...' : '')
                      }}
                    />
                    
                    {result.metadata?.source && result.metadata?.title && (
                      <a
                        href={result.metadata.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {result.metadata.title}
                      </a>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(result.created).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(result)}
                      disabled={isInCart(result.id)}
                    >
                      {isInCart(result.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                    
                    <Button size="sm" asChild>
                      <Link href={`/entry/${result.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {results.length === 0 && query && !loading && hasSearched && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              No results found for "{query}". Try a different search term or search mode.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}