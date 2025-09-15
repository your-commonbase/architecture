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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [batchResults, setBatchResults] = useState<any>(null);
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

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        // Read file content for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCsvContent(content);
        };
        reader.readAsText(file);
      } else {
        alert('Please select a CSV file');
        e.target.value = '';
      }
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile && !csvContent.trim()) return;

    setLoading(true);
    setBatchResults(null);

    try {
      let csvData = csvContent;
      if (csvFile && !csvContent) {
        // If file is selected but content not read, read it
        csvData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(csvFile);
        });
      }

      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: csvData,
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setBatchResults(results);
        if (results.successCount > 0) {
          // Redirect to ledger page to see all entries
          setTimeout(() => {
            router.push('/ledger');
          }, 3000);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process batch upload');
      }
    } catch (error: any) {
      console.error('Error processing batch upload:', error);
      setBatchResults({
        success: false,
        error: error.message || 'Failed to process batch upload',
        details: { successCount: 0, errorCount: 0, errors: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl px-4">
      {isDemoMode && <DemoModeCallout />}
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">Text Entry</TabsTrigger>
              <TabsTrigger value="image">Image Upload</TabsTrigger>
              <TabsTrigger value="batch">Batch Upload</TabsTrigger>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setTextData('');
                      setMetadata({ title: '', source: '' });
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !textData.trim() || isDemoMode}
                    className="w-full sm:w-auto"
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
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedFile || isDemoMode}
                    className="w-full sm:w-auto"
                  >
                    {isDemoMode ? 'Adding Disabled' : loading ? 'Processing Image...' : 'Add Image Entry'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4 mt-6">
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">CSV File (optional)</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvFileChange}
                    disabled={isDemoMode}
                  />
                  {csvFile && (
                    <div className="text-sm text-gray-600">
                      Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvContent">CSV Content</Label>
                  <Textarea
                    id="csvContent"
                    placeholder={isDemoMode ? "Adding disabled in demo mode" : `data,metadata,id
"My first entry","{""type"": ""note""}",
"My second entry",,
"Entry with custom ID","{""category"": ""example""}","550e8400-e29b-41d4-a716-446655440000"`}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    className="min-h-40 resize-y font-mono text-sm"
                    disabled={isDemoMode}
                  />
                  <div className="text-xs text-gray-500">
                    You can either upload a CSV file above or paste/type CSV content directly here.
                  </div>
                </div>

                {batchResults && (
                  <div className={`p-4 rounded-lg ${
                    batchResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`font-semibold ${
                      batchResults.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {batchResults.success ? '✅ Batch Upload Results' : '❌ Batch Upload Error'}
                    </div>
                    <div className={`text-sm mt-2 ${
                      batchResults.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {batchResults.message || batchResults.error}
                    </div>
                    {batchResults.details && (
                      <div className="text-xs mt-2 space-y-1">
                        <div>✅ Success: {batchResults.details.successCount} entries</div>
                        <div>❌ Errors: {batchResults.details.errorCount} entries</div>
                        {batchResults.details.errors?.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium">Error Details:</div>
                            <div className="max-h-32 overflow-y-auto">
                              {batchResults.details.errors.map((error: string, i: number) => (
                                <div key={i} className="text-xs">• {error}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {batchResults.success && batchResults.details?.successCount > 0 && (
                      <div className="text-xs mt-2 text-green-600">
                        🔄 Redirecting to ledger in 3 seconds...
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800 space-y-2">
                    <div><strong>Supported CSV Format:</strong></div>
                    <div>• <strong>data</strong> (required) - The text content</div>
                    <div>• <strong>metadata</strong> (optional) - JSON object for metadata</div>
                    <div>• <strong>id</strong> (optional) - Custom UUID for the entry</div>
                    <div>• <strong>embedding</strong> (optional) - Pre-computed embedding array</div>
                    <div>• <strong>link</strong> (optional) - Parent entry ID for linking</div>
                    <div className="mt-2 text-xs">
                      Headers must be exactly as shown. If no embedding is provided, it will be generated automatically.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCsvFile(null);
                      setCsvContent('');
                      setBatchResults(null);
                      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || (!csvFile && !csvContent.trim()) || isDemoMode}
                    className="w-full sm:w-auto"
                  >
                    {isDemoMode ? 'Adding Disabled' : loading ? 'Processing...' : 'Upload Batch'}
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
          <div>• Batch uploads let you import multiple entries at once from CSV files</div>
          <div>• Use the title and source fields to add context and attribution</div>
          <div>• All entries are automatically embedded for semantic search</div>
        </div>
      </div>
    </div>
  );
}