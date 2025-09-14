'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addToCart, isInCart } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { extractUrls, fetchUrlTitle } from '@/lib/url-utils';

interface Entry {
  id: string;
  data: string;
  metadata?: any;
  created: string;
  updated: string;
}

export default function EntryPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [entry, setEntry] = useState<Entry | null>(null);
  const [links, setLinks] = useState<Entry[]>([]);
  const [backlinks, setBacklinks] = useState<Entry[]>([]);
  const [neighbors, setNeighbors] = useState<Entry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entry[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Entry[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [commentMetadata, setCommentMetadata] = useState<{title?: string; source?: string}>({});
  const [fetchingCommentTitle, setFetchingCommentTitle] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  // Auto-detect URLs in comment text and fetch titles
  useEffect(() => {
    const detectAndFetchUrl = async () => {
      if (!commentText.trim()) {
        setCommentMetadata({});
        return;
      }
      
      const urls = extractUrls(commentText);
      if (urls.length > 0 && !commentMetadata.title && !commentMetadata.source) {
        const firstUrl = urls[0];
        setFetchingCommentTitle(true);
        
        try {
          const title = await fetchUrlTitle(firstUrl);
          if (title) {
            setCommentMetadata({
              title,
              source: firstUrl
            });
            // Replace the URL in the comment text with the title
            setCommentText(prev => prev.replace(firstUrl, title));
          } else {
            setCommentMetadata({
              source: firstUrl
            });
          }
        } catch (error) {
          console.error('Failed to fetch URL title for comment:', error);
          setCommentMetadata({
            source: firstUrl
          });
        } finally {
          setFetchingCommentTitle(false);
        }
      }
    };

    const timeoutId = setTimeout(detectAndFetchUrl, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [commentText, commentMetadata.title, commentMetadata.source]);

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/fetch/${id}`);
      if (response.ok) {
        const entryData = await response.json();
        setEntry(entryData);
        setEditData(entryData.data);
        
        // Fetch linked entries
        if (entryData.metadata?.links?.length > 0) {
          fetchLinkedEntries(entryData.metadata.links);
        }
        
        // Fetch backlinked entries
        if (entryData.metadata?.backlinks?.length > 0) {
          fetchBacklinkedEntries(entryData.metadata.backlinks);
        }
        
        // Fetch semantic neighbors
        fetchNeighbors(entryData.data);
        
        // Fetch comments
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedEntries = async (linkIds: string[]) => {
    try {
      const linkPromises = linkIds.map(linkId => 
        fetch(`/api/fetch/${linkId}`).then(res => res.json())
      );
      const linkedEntries = await Promise.all(linkPromises);
      setLinks(linkedEntries.filter(entry => entry.id)); // Filter out failed requests
    } catch (error) {
      console.error('Failed to fetch linked entries:', error);
    }
  };

  const fetchBacklinkedEntries = async (backlinkIds: string[]) => {
    try {
      const backlinkPromises = backlinkIds.map(backlinkId => 
        fetch(`/api/fetch/${backlinkId}`).then(res => res.json())
      );
      const backlinkedEntries = await Promise.all(backlinkPromises);
      setBacklinks(backlinkedEntries.filter(entry => entry.id)); // Filter out failed requests
    } catch (error) {
      console.error('Failed to fetch backlinked entries:', error);
    }
  };

  const fetchNeighbors = async (entryData: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: entryData,
          types: {
            semantic: { options: { limit: 5, threshold: 0.3 } }
          }
        }),
      });
      
      const results = await response.json();
      setNeighbors(results.filter((r: any) => r.id !== id)); // Exclude current entry
    } catch (error) {
      console.error('Failed to fetch neighbors:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            metadata: {
              link: id
            }
          }
        }),
      });
      
      if (response.ok) {
        const allLinked = await response.json();
        // Filter for comments (either type=comment or isComment=true)
        const commentData = allLinked.filter((entry: any) => 
          entry.metadata?.type === 'comment' || entry.metadata?.isComment === true
        );
        setComments(commentData);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSave = async () => {
    if (!entry) return;
    
    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, data: editData }),
      });
      
      if (response.ok) {
        const updatedEntry = await response.json();
        setEntry(updatedEntry);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  const handleDelete = async () => {
    if (!entry || !confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id }),
      });
      
      if (response.ok) {
        window.location.href = '/ledger';
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleAddToCart = () => {
    if (!entry) return;
    
    addToCart({
      id: entry.id,
      data: entry.data,
      metadata: entry.metadata,
    });
    
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          types: {
            semantic: { options: { limit: 5, threshold: 0.3 } },
            fullText: { options: { limit: 5 } }
          }
        }),
      });
      
      const results = await response.json();
      // Remove current entry (deduplication now handled server-side)
      setSearchResults(results.filter((r: any) => r.id !== entry?.id));
    } catch (error) {
      console.error('Failed to search:', error);
    }
  };

  const handleJoin = async (targetIds: string[]) => {
    if (!entry || targetIds.length === 0) return;
    
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, link_ids: targetIds }),
      });
      
      if (response.ok) {
        setShowJoinModal(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchEntry(); // Refresh to show new links
      }
    } catch (error) {
      console.error('Failed to join entries:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() && !commentFile) return;
    
    setAddingComment(true);
    try {
      if (commentFile) {
        // Handle image comment
        const formData = new FormData();
        formData.append('image', commentFile);
        formData.append('link', id);
        
        // Add parent metadata as form data
        if (entry?.metadata?.title) {
          formData.append('parentTitle', entry.metadata.title);
        }
        if (entry?.metadata?.source) {
          formData.append('parentSource', entry.metadata.source);
        }
        
        const response = await fetch('/api/addImage', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          setCommentFile(null);
          fetchComments();
          fetchEntry(); // Refresh to show updated backlinks
        }
      } else {
        // Handle text comment
        const response = await fetch('/api/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: commentText,
            metadata: {
              type: 'comment',
              link: id,
              title: commentMetadata.title || entry?.metadata?.title,
              source: commentMetadata.source || entry?.metadata?.source,
              backlinks: [id]
            },
            link: id
          }),
        });
        
        if (response.ok) {
          setCommentText('');
          setCommentMetadata({});
          fetchComments();
          fetchEntry(); // Refresh to show updated backlinks
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Entry not found</div>
      </div>
    );
  }

  const isImage = entry.metadata?.type === 'image';

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Entry Details</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={handleAddToCart}
                disabled={isInCart(entry.id)}
                variant="outline"
                size="sm"
              >
                {isInCart(entry.id) ? 'In Cart' : 'Add to Cart'}
              </Button>
              
              <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Join</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Join with Other Entries</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Search for entries to join..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button onClick={handleSearch}>Search</Button>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((result: any) => (
                          <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <div className="text-sm">{truncateText(result.data, 100)}</div>
                              <div className="text-xs text-gray-500">
                                Similarity: {(result.similarity * 100).toFixed(1)}%
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleJoin([result.id])}
                            >
                              Join
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm">Save</Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}
              
              <Button onClick={handleDelete} variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isImage && entry.metadata?.source && (
              <div className="mb-4">
                <Image
                  src={entry.metadata.source}
                  alt="Entry image"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover"
                />
                {entry.metadata?.title && (
                  <a
                    href={entry.metadata.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    {entry.metadata.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {!isImage && entry.metadata?.source && (
              <div className="mb-4">
                <a
                  href={entry.metadata.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  {entry.metadata?.title || entry.metadata.source}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            
            {isEditing ? (
              <Textarea
                value={editData}
                onChange={(e) => setEditData(e.target.value)}
                className="min-h-32"
              />
            ) : (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{entry.data}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-500 space-y-1">
              <div>Created: {new Date(entry.created).toLocaleString()}</div>
              <div>Updated: {new Date(entry.updated).toLocaleString()}</div>
              {entry.metadata?.type && (
                <div>Type: {entry.metadata.type}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(links.length > 0 || backlinks.length > 0 || neighbors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Related Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {links.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Links</h3>
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div key={link.id} className="p-2 border rounded">
                        {link.metadata?.type === 'image' && link.metadata?.source && (
                          <div className="mb-2">
                            <Image
                              src={link.metadata.source}
                              alt="Linked image"
                              width={120}
                              height={80}
                              className="rounded object-cover w-full max-h-20"
                            />
                          </div>
                        )}
                        <Link href={`/entry/${link.id}`} className="text-blue-600 hover:underline">
                          {truncateText(link.data, 100)}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {backlinks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Backlinks</h3>
                  <div className="space-y-2">
                    {backlinks.map((backlink) => (
                      <div key={backlink.id} className="p-2 border rounded">
                        {backlink.metadata?.type === 'image' && backlink.metadata?.source && (
                          <div className="mb-2">
                            <Image
                              src={backlink.metadata.source}
                              alt="Backlinked image"
                              width={120}
                              height={80}
                              className="rounded object-cover w-full max-h-20"
                            />
                          </div>
                        )}
                        <Link href={`/entry/${backlink.id}`} className="text-blue-600 hover:underline">
                          {truncateText(backlink.data, 100)}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {neighbors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Similar Entries</h3>
                  <div className="space-y-2">
                    {neighbors.map((neighbor: any) => (
                      <div key={neighbor.id} className="p-2 border rounded">
                        {neighbor.metadata?.type === 'image' && neighbor.metadata?.source && (
                          <div className="mb-2">
                            <Image
                              src={neighbor.metadata.source}
                              alt="Similar image"
                              width={120}
                              height={80}
                              className="rounded object-cover w-full max-h-20"
                            />
                          </div>
                        )}
                        <Link href={`/entry/${neighbor.id}`} className="text-blue-600 hover:underline">
                          {truncateText(neighbor.data, 100)}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          Similarity: {(neighbor.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Textarea
                  placeholder={fetchingCommentTitle ? "Add a comment... (fetching URL title)" : "Add a comment..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-20"
                />
                {fetchingCommentTitle && (
                  <div className="text-sm text-blue-600">
                    🔄 Fetching URL title...
                  </div>
                )}
                {commentMetadata.title && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    📄 Found: {commentMetadata.title}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCommentFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="comment-image"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  onClick={() => document.getElementById('comment-image')?.click()}
                >
                  📷 Add Image
                </Button>
                {commentFile && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{commentFile.name}</span>
                    <button
                      onClick={() => setCommentFile(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <Button 
                  onClick={handleAddComment}
                  disabled={addingComment || (!commentText.trim() && !commentFile)}
                  size="sm"
                >
                  {addingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>

            {comments.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    {comment.metadata?.type === 'image' && comment.metadata?.source && (
                      <div className="mb-2">
                        <Image
                          src={comment.metadata.source}
                          alt="Comment image"
                          width={200}
                          height={150}
                          className="rounded object-cover"
                        />
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{comment.data}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}