'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [baseUrl, setBaseUrl] = useState('https://yourcommonbase.com');
  
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-black">API Documentation</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Learn how to integrate with Commonbase programmatically. Add text entries, upload images, 
          and build powerful applications on top of your knowledge base.
        </p>
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>

      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-[#FFE135]">
          <CardTitle>Base URL Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <p>Replace <code className="bg-gray-100 px-2 py-1 rounded">https://yourcommonbase.com</code> with your actual domain:</p>
            <div className="flex space-x-2">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-black rounded"
                placeholder="https://yourcommonbase.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="text" className="text-lg font-semibold">Text Entries API</TabsTrigger>
          <TabsTrigger value="image" className="text-lg font-semibold">Image Upload API</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-8">
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#A6FAFF]">
              <CardTitle>POST /api/add - Add Text Entry</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Request Body</h3>
                <pre className="bg-gray-100 p-4 rounded border-2 border-black overflow-x-auto">
{`{
  "data": "Your text content here",
  "metadata": {
    "title": "Optional title",
    "source": "https://example.com",
    "type": "text",
    "tags": ["tag1", "tag2"],
    "author": "Your name"
  },
  "link": "optional-parent-entry-id"
}`}
                </pre>
              </div>

              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                </TabsList>

                <TabsContent value="curl">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`curl -X POST ${baseUrl}/api/add \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": "This is my knowledge base entry",
    "metadata": {
      "title": "Important Note",
      "source": "https://example.com",
      "tags": ["research", "important"]
    }
  }'`}
                  </pre>
                </TabsContent>

                <TabsContent value="javascript">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Browser JavaScript
const response = await fetch('${baseUrl}/api/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: 'This is my knowledge base entry',
    metadata: {
      title: 'Important Note',
      source: 'https://example.com',
      tags: ['research', 'important']
    }
  })
});

const newEntry = await response.json();
console.log('Created entry:', newEntry);`}
                  </pre>
                </TabsContent>

                <TabsContent value="python">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`import requests
import json

url = '${baseUrl}/api/add'
data = {
    'data': 'This is my knowledge base entry',
    'metadata': {
        'title': 'Important Note',
        'source': 'https://example.com',
        'tags': ['research', 'important']
    }
}

response = requests.post(url, json=data)
new_entry = response.json()
print('Created entry:', new_entry)`}
                  </pre>
                </TabsContent>

                <TabsContent value="node">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`const axios = require('axios');

const addEntry = async () => {
  try {
    const response = await axios.post('${baseUrl}/api/add', {
      data: 'This is my knowledge base entry',
      metadata: {
        title: 'Important Note',
        source: 'https://example.com',
        tags: ['research', 'important']
      }
    });
    
    console.log('Created entry:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};

addEntry();`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-8">
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#FFAFF5]">
              <CardTitle>POST /api/addImage - Upload Image</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Form Data</h3>
                <pre className="bg-gray-100 p-4 rounded border-2 border-black overflow-x-auto">
{`FormData fields:
- image: File (required)
- link: string (optional - parent entry ID)
- parentTitle: string (optional)
- parentSource: string (optional)`}
                </pre>
              </div>

              <Tabs defaultValue="curl-img" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl-img">cURL</TabsTrigger>
                  <TabsTrigger value="javascript-img">JavaScript</TabsTrigger>
                  <TabsTrigger value="python-img">Python</TabsTrigger>
                  <TabsTrigger value="node-img">Node.js</TabsTrigger>
                </TabsList>

                <TabsContent value="curl-img">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`curl -X POST ${baseUrl}/api/addImage \\
  -F "image=@/path/to/your/image.jpg"`}
                  </pre>
                </TabsContent>

                <TabsContent value="javascript-img">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Browser JavaScript with file input
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('image', file);

const response = await fetch('${baseUrl}/api/addImage', {
  method: 'POST',
  body: formData
});

const newEntry = await response.json();
console.log('Created image entry:', newEntry);`}
                  </pre>
                </TabsContent>

                <TabsContent value="python-img">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`import requests

url = '${baseUrl}/api/addImage'
files = {
    'image': open('/path/to/your/image.jpg', 'rb')
}

response = requests.post(url, files=files)
new_entry = response.json()
print('Created image entry:', new_entry)`}
                  </pre>
                </TabsContent>

                <TabsContent value="node-img">
                  <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const uploadImage = async () => {
  const form = new FormData();
  form.append('image', fs.createReadStream('/path/to/your/image.jpg'));
  
  try {
    const response = await axios.post('${baseUrl}/api/addImage', form, {
      headers: form.getHeaders()
    });
    
    console.log('Created image entry:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};

uploadImage();`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-[#C7F9FF]">
            <CardTitle>Response Format</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="bg-gray-100 p-4 rounded border-2 border-black overflow-x-auto text-sm">
{`{
  "id": "entry-uuid",
  "data": "Your content",
  "metadata": {
    "title": "Entry title",
    "source": "https://example.com",
    "type": "text" | "image",
    ...
  },
  "created": "2025-01-15T10:30:00Z",
  "updated": "2025-01-15T10:30:00Z"
}`}
            </pre>
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-[#FFE135]">
            <CardTitle>Error Responses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="bg-gray-100 p-4 rounded border-2 border-black overflow-x-auto text-sm">
{`// 400 Bad Request
{
  "error": "Data is required"
}

// 500 Internal Server Error  
{
  "error": "Internal server error"
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Integration Examples</h2>
        
        <div className="grid gap-8">
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#A8A6FF]">
              <CardTitle>🧩 Browser Extension</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Save any webpage content to your Commonbase with a browser extension:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// content.js - Browser Extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveToCommonbase") {
    const selectedText = window.getSelection().toString() || 
                        document.body.innerText.substring(0, 1000);
    
    fetch('${baseUrl}/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: selectedText,
        metadata: {
          title: document.title,
          source: window.location.href,
          type: 'webpage',
          savedAt: new Date().toISOString()
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Saved to Commonbase:', data);
      sendResponse({ success: true, entry: data });
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({ success: false, error });
    });
    
    return true; // Keep message channel open
  }
});`}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#FFAFF5]">
              <CardTitle>📁 Drag & Drop File App</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Create a desktop app that uploads files when dropped:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Electron main process
const { app, BrowserWindow, ipcMain } = require('electron');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

ipcMain.handle('upload-file', async (event, filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const isImage = /\\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
    
    if (isImage) {
      // Upload image
      const form = new FormData();
      form.append('image', fs.createReadStream(filePath));
      
      const response = await axios.post('${baseUrl}/api/addImage', form, {
        headers: form.getHeaders()
      });
      return { success: true, entry: response.data };
    } else {
      // Upload text file content
      const content = fs.readFileSync(filePath, 'utf8');
      const response = await axios.post('${baseUrl}/api/add', {
        data: content,
        metadata: {
          title: path.basename(filePath),
          type: 'file',
          size: stats.size,
          originalPath: filePath
        }
      });
      return { success: true, entry: response.data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});`}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#C7F9FF]">
              <CardTitle>📊 CSV to Commonbase Parser</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Convert CSV data to the correct format and bulk upload:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`# CSV Input Example
title,content,source,tags,author
"Research Notes","AI models are improving rapidly","https://example.com","ai,research","John Doe"
"Meeting Summary","Discussed Q1 goals and metrics","","meetings,planning","Jane Smith"

# Python CSV Parser
import csv
import requests
import json

def upload_csv_to_commonbase(csv_file_path, base_url):
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            # Convert CSV row to Commonbase format
            entry_data = {
                'data': row['content'],
                'metadata': {
                    'title': row['title'],
                    'source': row.get('source', ''),
                    'tags': row.get('tags', '').split(',') if row.get('tags') else [],
                    'author': row.get('author', ''),
                    'type': 'csv_import',
                    'imported_at': datetime.now().isoformat()
                }
            }
            
            try:
                response = requests.post(f'{base_url}/api/add', json=entry_data)
                if response.ok:
                    entry = response.json()
                    print(f"✅ Created entry: {entry['id']}")
                else:
                    print(f"❌ Failed to create entry: {response.text}")
            except Exception as e:
                print(f"❌ Error: {e}")

# Usage
upload_csv_to_commonbase('data.csv', '${baseUrl}')`}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#FFE135]">
              <CardTitle>🤖 Automated Content Ingestion</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Automatically save content from RSS feeds, APIs, or other sources:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Node.js RSS to Commonbase
const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

async function ingestRssFeed(feedUrl, commonbaseUrl) {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    for (const item of feed.items) {
      const entry = {
        data: item.content || item.contentSnippet || item.summary,
        metadata: {
          title: item.title,
          source: item.link,
          author: item.creator || feed.title,
          publishedDate: item.pubDate,
          type: 'rss_article',
          categories: item.categories || []
        }
      };
      
      try {
        const response = await axios.post(\`\${commonbaseUrl}/api/add\`, entry);
        console.log(\`✅ Added: \${item.title}\`);
      } catch (error) {
        console.error(\`❌ Failed to add \${item.title}:\`, error.message);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('RSS ingestion failed:', error);
  }
}

// Run every hour
setInterval(() => {
  ingestRssFeed('https://example.com/rss.xml', '${baseUrl}');
}, 60 * 60 * 1000);`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-[#A6FAFF]">
          <CardTitle>💡 Tips & Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-lg mb-2">Metadata Structure</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>type:</strong> Categorize your content (text, image, webpage, file, etc.)</li>
                <li>• <strong>title:</strong> Human-readable title for better organization</li>
                <li>• <strong>source:</strong> Original URL or reference</li>
                <li>• <strong>tags:</strong> Array of strings for categorization</li>
                <li>• <strong>author:</strong> Content creator or contributor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Performance Tips</h4>
              <ul className="space-y-2 text-sm">
                <li>• Batch uploads when possible to reduce API calls</li>
                <li>• Add rate limiting (1-2 seconds between requests)</li>
                <li>• Include error handling and retry logic</li>
                <li>• Use meaningful titles and metadata for better searchability</li>
                <li>• Keep individual entries under 10MB for optimal performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-8">
        <Button asChild size="lg">
          <Link href="/search">Try Searching Your Data →</Link>
        </Button>
      </div>
    </div>
  );
}