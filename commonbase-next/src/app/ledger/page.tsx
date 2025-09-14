'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { addToCart, isInCart } from '@/lib/cart';
import { DemoModeCallout } from '@/components/demo-mode-callout';
import Link from 'next/link';

interface Entry {
  id: string;
  data: string;
  metadata?: any;
  created: string;
  updated: string;
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [page]);

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-mode');
        const data = await response.json();
        setIsDemoMode(data.isDemoMode);
      } catch (error) {
        console.error('Failed to check demo mode:', error);
      }
    };
    checkDemoMode();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/list?page=${page}&limit=20`);
      const data = await response.json();
      
      if (page === 1) {
        setEntries(data.entries);
      } else {
        setEntries(prev => [...prev, ...data.entries]);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map(entry => entry.id));
    }
  };

  const handleSelectEntry = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      for (const id of selectedIds) {
        await fetch('/api/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      }
      
      setEntries(entries.filter(entry => !selectedIds.includes(entry.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to delete entries:', error);
    }
  };

  const handleAddToCart = (entry: Entry) => {
    addToCart({
      id: entry.id,
      data: entry.data,
      metadata: entry.metadata,
    });
    
    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading && entries.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6 px-4">
      {isDemoMode && <DemoModeCallout />}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-2xl sm:text-3xl">Ledger</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {selectedIds.length > 0 && (
                <Button 
                  onClick={handleDelete} 
                  variant="destructive" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  disabled={isDemoMode}
                >
                  {isDemoMode ? 'Delete Disabled' : `Delete Selected (${selectedIds.length})`}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile card layout */}
          <div className="block lg:hidden space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedIds.length === entries.length && entries.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
            </div>
            
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedIds.includes(entry.id)}
                          onCheckedChange={() => handleSelectEntry(entry.id)}
                        />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {entry.metadata?.type || 'text'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <Link 
                        href={`/entry/${entry.id}`}
                        className="hover:underline cursor-pointer text-sm"
                      >
                        {truncateText(entry.data, 150)}
                      </Link>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToCart(entry)}
                        disabled={isInCart(entry.id)}
                        className="w-full"
                      >
                        {isInCart(entry.id) ? 'In Cart' : 'Add to Cart'}
                      </Button>
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <Link href={`/entry/${entry.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Desktop table layout */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === entries.length && entries.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(entry.id)}
                        onCheckedChange={() => handleSelectEntry(entry.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/entry/${entry.id}`}
                        className="hover:underline cursor-pointer"
                      >
                        {truncateText(entry.data)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {entry.metadata?.type || 'text'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(entry)}
                          disabled={isInCart(entry.id)}
                        >
                          {isInCart(entry.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/entry/${entry.id}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {hasMore && (
            <div className="mt-4 text-center">
              <Button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}