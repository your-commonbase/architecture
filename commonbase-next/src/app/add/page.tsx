'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { extractUrls, fetchUrlTitle } from '@/lib/url-utils';
import { DemoModeCallout } from '@/components/demo-mode-callout';

export default function AddPage() {
  const [textData, setTextData] = useState('');
  const [metadata, setMetadata] = useState({ title: '', source: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

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

  // Auto-detect URLs and fetch titles
  useEffect(() => {
    const detectAndFetchUrl = async () => {
      if (!textData.trim()) return;
      
      const urls = extractUrls(textData);
      if (urls.length > 0 && !metadata.title && !metadata.source) {
        const firstUrl = urls[0];
        setFetchingTitle(true);
        
        try {
          const title = await fetchUrlTitle(firstUrl);
          if (title) {
            setMetadata(prev => ({
              ...prev,
              title,
              source: firstUrl
            }));
            // Replace the URL in the text data with the title
            setTextData(prev => prev.replace(firstUrl, title));
          } else {
            setMetadata(prev => ({
              ...prev,
              source: firstUrl
            }));
          }
        } catch (error) {
          console.error('Failed to fetch URL title:', error);
          setMetadata(prev => ({
            ...prev,
            source: firstUrl
          }));
        } finally {
          setFetchingTitle(false);
        }
      }
    };

    const timeoutId = setTimeout(detectAndFetchUrl, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [textData, metadata.title, metadata.source]);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textData.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: textData,
          metadata: {
            ...metadata,
            type: 'text',
          },
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        router.push(`/entry/${newEntry.id}`);
      } else {
        throw new Error('Failed to add entry');
      }
    } catch (error) {
      console.error('Error adding text entry:', error);
      alert('Failed to add entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/addImage', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newEntry = await response.json();
        router.push(`/entry/${newEntry.id}`);
      } else {
        throw new Error('Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Please select an image file');
        e.target.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {isDemoMode && <DemoModeCallout />}
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Entry</TabsTrigger>
              <TabsTrigger value="image">Image Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4 mt-6">
              <form onSubmit={handleTextSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textData">Content *</Label>
                  <Textarea
                    id="textData"
                    placeholder={isDemoMode ? "Adding disabled in demo mode" : "Enter your text content here..."}
                    value={textData}
                    onChange={(e) => setTextData(e.target.value)}
                    className="min-h-40 resize-y"
                    disabled={isDemoMode}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title (optional)
                      {fetchingTitle && <span className="text-blue-600 ml-2">🔄 Fetching...</span>}
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder={isDemoMode ? "Adding disabled" : fetchingTitle ? "Fetching title..." : "Enter a title..."}
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                      disabled={isDemoMode || fetchingTitle}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="source">Source (optional)</Label>
                    <Input
                      id="source"
                      type="url"
                      placeholder={isDemoMode ? "Adding disabled" : "https://example.com"}
                      value={metadata.source}
                      onChange={(e) => setMetadata({ ...metadata, source: e.target.value })}
                      disabled={isDemoMode}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setTextData('');
                      setMetadata({ title: '', source: '' });
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !textData.trim() || isDemoMode}
                  >
                    {isDemoMode ? 'Adding Disabled' : loading ? 'Adding...' : 'Add Text Entry'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4 mt-6">
              <form onSubmit={handleImageSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageFile">Image File *</Label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isDemoMode}
                    required
                  />
                  {selectedFile && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
                
                {selectedFile && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="max-w-full max-h-64 object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Note:</strong> The image will be processed using AI to generate a text description. 
                    This description will be used for searching and organizing your image content.
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedFile || isDemoMode}
                  >
                    {isDemoMode ? 'Adding Disabled' : loading ? 'Processing Image...' : 'Add Image Entry'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          <strong>Quick Tips:</strong>
        </div>
        <div className="text-sm text-gray-500 mt-2 space-y-1">
          <div>• Text entries are great for notes, ideas, and written content</div>
          <div>• Images are automatically analyzed and described for better searchability</div>
          <div>• Use the title and source fields to add context and attribution</div>
          <div>• All entries are automatically embedded for semantic search</div>
        </div>
      </div>
    </div>
  );
}