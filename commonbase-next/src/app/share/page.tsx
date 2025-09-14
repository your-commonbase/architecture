'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getCart, removeFromCart, clearCart, CartItem } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';
import { DemoModeCallout } from '@/components/demo-mode-callout';

export default function SharePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [synthesis, setSynthesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [prompt, setPrompt] = useState(
    'Please help join these ideas into a cohesive 500-word mini essay. Look for common themes, connections, and insights across the content.'
  );

  useEffect(() => {
    updateCartItems();
  }, []);

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

  const updateCartItems = () => {
    setCartItems(getCart());
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    updateCartItems();
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart();
      updateCartItems();
      setSynthesis('');
      window.dispatchEvent(new Event('cartUpdate'));
    }
  };

  const handleSynthesize = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      // Prepare the content for the LLM
      const content = cartItems.map((item, index) => 
        `Entry ${index + 1}:\n${item.data}\n`
      ).join('\n---\n\n');

      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize content');
      }

      const data = await response.json();
      setSynthesis(data.synthesis);
    } catch (error) {
      console.error('Synthesis failed:', error);
      alert('Failed to synthesize content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsSynthesis = async () => {
    if (!synthesis.trim()) return;

    try {
      const response = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: synthesis,
          metadata: {
            type: 'synthesis',
            title: 'AI Synthesis',
            source_entries: cartItems.map(item => item.id),
            generated_at: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        alert('Synthesis saved successfully!');
        window.location.href = `/entry/${newEntry.id}`;
      }
    } catch (error) {
      console.error('Failed to save synthesis:', error);
      alert('Failed to save synthesis. Please try again.');
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {isDemoMode && <DemoModeCallout />}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Share & Synthesize</CardTitle>
              <p className="text-gray-600 mt-1">
                Combine ideas from your cart into a cohesive narrative
              </p>
            </div>
            <div className="flex space-x-2">
              {cartItems.length > 0 && (
                <Button onClick={handleClearCart} variant="outline" size="sm">
                  Clear Cart ({cartItems.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 space-y-4">
                <div className="text-lg">Your cart is empty</div>
                <div className="text-sm">
                  Add some entries to your cart from the ledger, search results, or feed to synthesize them here.
                </div>
                <div className="flex justify-center space-x-4">
                  <Button asChild variant="outline">
                    <Link href="/ledger">Browse Ledger</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/search">Search Entries</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/feed">Discover Feed</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Cart Items ({cartItems.length})</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded">
                      {item.metadata?.type === 'image' && item.metadata?.source && (
                        <Image
                          src={item.metadata.source}
                          alt="Cart item image"
                          width={80}
                          height={60}
                          className="rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          {truncateText(item.data)}
                        </div>
                        {item.metadata?.type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                            {item.metadata.type}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/entry/${item.id}`}>View</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Synthesis Prompt</h3>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-20"
                  placeholder={isDemoMode ? "Synthesis disabled in demo mode" : "Enter your prompt for how to synthesize these entries..."}
                  disabled={isDemoMode}
                />
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleSynthesize} 
                  disabled={isDemoMode || loading || cartItems.length === 0}
                  size="lg"
                >
                  {isDemoMode ? 'Synthesize Disabled' : loading ? 'Synthesizing...' : `Synthesize ${cartItems.length} Items`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {synthesis && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>AI Synthesis</CardTitle>
              <Button onClick={handleSaveAsSynthesis}>
                Save as New Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {synthesis}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Generated from {cartItems.length} entries:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {cartItems.map((item) => (
                    <li key={item.id}>
                      <Link href={`/entry/${item.id}`} className="hover:underline">
                        {truncateText(item.data, 80)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}