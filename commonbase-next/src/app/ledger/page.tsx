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

  useEffect(() => {
    fetchEntries();
  }, [page]);

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
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ledger</CardTitle>
            <div className="flex space-x-2">
              {selectedIds.length > 0 && (
                <Button onClick={handleDelete} variant="destructive" size="sm">
                  Delete Selected ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
          
          {hasMore && (
            <div className="mt-4 text-center">
              <Button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
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