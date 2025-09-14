'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  
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
            <p>Replace <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code> with your actual domain:</p>
            <div className="flex space-x-2">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-black rounded"
                placeholder="http://localhost:3000"
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

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#A8A6FF]">
              <CardTitle>📝 Obsidian Plugin</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Sync your Obsidian notes to Commonbase with this plugin example:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// main.ts - Obsidian Plugin
import { Plugin, Notice, TFile } from 'obsidian';

interface CommonbaseSettings {
  apiUrl: string;
  syncOnSave: boolean;
}

export default class CommonbasePlugin extends Plugin {
  settings: CommonbaseSettings;

  async onload() {
    await this.loadSettings();
    
    // Add ribbon icon
    this.addRibbonIcon('upload', 'Sync to Commonbase', () => {
      this.syncCurrentNote();
    });

    // Add command
    this.addCommand({
      id: 'sync-to-commonbase',
      name: 'Sync current note to Commonbase',
      callback: () => this.syncCurrentNote()
    });

    // Auto-sync on save if enabled
    if (this.settings.syncOnSave) {
      this.registerEvent(
        this.app.vault.on('modify', (file) => {
          if (file instanceof TFile && file.extension === 'md') {
            this.syncNote(file);
          }
        })
      );
    }
  }

  async syncCurrentNote() {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      await this.syncNote(activeFile);
    }
  }

  async syncNote(file: TFile) {
    try {
      const content = await this.app.vault.read(file);
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
      
      const entry = {
        data: content,
        metadata: {
          title: file.basename,
          source: \`obsidian://open?vault=\${this.app.vault.getName()}&file=\${file.path}\`,
          type: 'obsidian_note',
          tags: frontmatter?.tags || [],
          created: new Date(file.stat.ctime).toISOString(),
          modified: new Date(file.stat.mtime).toISOString(),
          vault: this.app.vault.getName(),
          path: file.path
        }
      };

      const response = await fetch(\`\${this.settings.apiUrl}/api/add\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (response.ok) {
        new Notice(\`Synced "\${file.basename}" to Commonbase\`);
      } else {
        throw new Error(\`HTTP \${response.status}\`);
      }
    } catch (error) {
      new Notice(\`Failed to sync note: \${error.message}\`);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({
      apiUrl: '${baseUrl}',
      syncOnSave: false
    }, await this.loadData());
  }
}`}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#FFAFF5]">
              <CardTitle>🗃️ Notion Integration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Export and sync your Notion pages to Commonbase:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// notion-sync.js - Notion to Commonbase
const { Client } = require('@notionhq/client');
const axios = require('axios');

class NotionToCommonbase {
  constructor(notionToken, commonbaseUrl) {
    this.notion = new Client({ auth: notionToken });
    this.commonbaseUrl = commonbaseUrl;
  }

  async syncDatabase(databaseId) {
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
      });

      for (const page of response.results) {
        await this.syncPage(page.id);
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Database sync failed:', error);
    }
  }

  async syncPage(pageId) {
    try {
      const [page, blocks] = await Promise.all([
        this.notion.pages.retrieve({ page_id: pageId }),
        this.notion.blocks.children.list({ block_id: pageId })
      ]);

      const content = await this.blocksToText(blocks.results);
      const properties = page.properties;

      const entry = {
        data: content,
        metadata: {
          title: this.extractTitle(properties),
          source: \`https://notion.so/\${pageId.replace(/-/g, '')}\`,
          type: 'notion_page',
          notionId: pageId,
          database: page.parent.database_id,
          created: page.created_time,
          updated: page.last_edited_time,
          properties: this.extractProperties(properties)
        }
      };

      const response = await axios.post(\`\${this.commonbaseUrl}/api/add\`, entry);
      console.log(\`✅ Synced Notion page: \${entry.metadata.title}\`);
      return response.data;
    } catch (error) {
      console.error(\`Failed to sync page \${pageId}:\`, error.message);
    }
  }

  async blocksToText(blocks) {
    let text = '';
    for (const block of blocks) {
      const type = block.type;
      if (block[type]?.rich_text) {
        const blockText = block[type].rich_text
          .map(rt => rt.plain_text)
          .join('');
        text += blockText + '\\n';
      }
    }
    return text.trim();
  }

  extractTitle(properties) {
    for (const [key, prop] of Object.entries(properties)) {
      if (prop.type === 'title' && prop.title.length > 0) {
        return prop.title[0].plain_text;
      }
    }
    return 'Untitled';
  }

  extractProperties(properties) {
    const extracted = {};
    for (const [key, prop] of Object.entries(properties)) {
      if (prop.type === 'multi_select') {
        extracted[key] = prop.multi_select.map(s => s.name);
      } else if (prop.type === 'select') {
        extracted[key] = prop.select?.name || null;
      } else if (prop.type === 'rich_text') {
        extracted[key] = prop.rich_text[0]?.plain_text || '';
      }
    }
    return extracted;
  }
}

// Usage
const sync = new NotionToCommonbase(
  'YOUR_NOTION_TOKEN',
  '${baseUrl}'
);

// Sync a specific database
sync.syncDatabase('your-database-id');

// Or sync individual pages
sync.syncPage('your-page-id');`}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-[#C7F9FF]">
              <CardTitle>🎵 Social Media Batch Download</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-700">Download and archive content from Spotify, YouTube, Twitter, etc.:</p>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// social-media-archiver.js
const axios = require('axios');
const puppeteer = require('puppeteer');

class SocialMediaArchiver {
  constructor(commonbaseUrl) {
    this.commonbaseUrl = commonbaseUrl;
  }

  // Spotify Playlist Archiver
  async archiveSpotifyPlaylist(playlistUrl, spotifyToken) {
    try {
      const playlistId = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/)[1];
      
      const response = await axios.get(
        \`https://api.spotify.com/v1/playlists/\${playlistId}/tracks\`,
        { headers: { 'Authorization': \`Bearer \${spotifyToken}\` } }
      );

      for (const item of response.data.items) {
        const track = item.track;
        const entry = {
          data: \`\${track.name} by \${track.artists.map(a => a.name).join(', ')} - Album: \${track.album.name}\`,
          metadata: {
            title: \`♪ \${track.name}\`,
            source: track.external_urls.spotify,
            type: 'spotify_track',
            artist: track.artists.map(a => a.name),
            album: track.album.name,
            duration: track.duration_ms,
            popularity: track.popularity,
            preview_url: track.preview_url
          }
        };
        
        await this.saveToCommonbase(entry);
      }
    } catch (error) {
      console.error('Spotify archive failed:', error);
    }
  }

  // YouTube Playlist Archiver
  async archiveYouTubePlaylist(playlistUrl, youtubeApiKey) {
    try {
      const playlistId = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/)[1];
      
      const response = await axios.get(
        \`https://www.googleapis.com/youtube/v3/playlistItems\`,
        {
          params: {
            part: 'snippet',
            maxResults: 50,
            playlistId: playlistId,
            key: youtubeApiKey
          }
        }
      );

      for (const item of response.data.items) {
        const snippet = item.snippet;
        const entry = {
          data: \`\${snippet.title} - \${snippet.description.substring(0, 500)}\`,
          metadata: {
            title: \`📺 \${snippet.title}\`,
            source: \`https://youtube.com/watch?v=\${snippet.resourceId.videoId}\`,
            type: 'youtube_video',
            channel: snippet.videoOwnerChannelTitle,
            publishedAt: snippet.publishedAt,
            thumbnail: snippet.thumbnails.medium.url,
            videoId: snippet.resourceId.videoId
          }
        };
        
        await this.saveToCommonbase(entry);
      }
    } catch (error) {
      console.error('YouTube archive failed:', error);
    }
  }

  // Twitter/X Thread Archiver
  async archiveTwitterThread(threadUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(threadUrl, { waitUntil: 'networkidle2' });
      
      // Extract tweets from thread
      const tweets = await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        return Array.from(tweetElements).map(tweet => {
          const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent || '';
          const author = tweet.querySelector('[data-testid="User-Name"]')?.textContent || '';
          const time = tweet.querySelector('time')?.getAttribute('datetime') || '';
          return { text, author, time };
        });
      });

      for (const [index, tweet] of tweets.entries()) {
        const entry = {
          data: tweet.text,
          metadata: {
            title: \`🐦 \${tweet.author} - Tweet \${index + 1}\`,
            source: threadUrl,
            type: 'twitter_thread',
            author: tweet.author,
            publishedAt: tweet.time,
            threadPosition: index + 1,
            totalTweets: tweets.length
          }
        };
        
        await this.saveToCommonbase(entry);
      }
    } catch (error) {
      console.error('Twitter archive failed:', error);
    } finally {
      await browser.close();
    }
  }

  // LinkedIn Article Archiver
  async archiveLinkedInProfile(profileUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(profileUrl + '/detail/recent-activity/posts/', {
        waitUntil: 'networkidle2'
      });
      
      const posts = await page.evaluate(() => {
        const postElements = document.querySelectorAll('.feed-shared-update-v2');
        return Array.from(postElements).map(post => {
          const text = post.querySelector('.feed-shared-text')?.textContent || '';
          const author = post.querySelector('.feed-shared-actor__name')?.textContent || '';
          const time = post.querySelector('.feed-shared-actor__sub-description')?.textContent || '';
          return { text: text.trim(), author: author.trim(), time };
        });
      });

      for (const post of posts) {
        if (post.text) {
          const entry = {
            data: post.text,
            metadata: {
              title: \`💼 \${post.author} - LinkedIn Post\`,
              source: profileUrl,
              type: 'linkedin_post',
              author: post.author,
              publishedAt: post.time
            }
          };
          
          await this.saveToCommonbase(entry);
        }
      }
    } catch (error) {
      console.error('LinkedIn archive failed:', error);
    } finally {
      await browser.close();
    }
  }

  async saveToCommonbase(entry) {
    try {
      const response = await axios.post(\`\${this.commonbaseUrl}/api/add\`, entry);
      console.log(\`✅ Archived: \${entry.metadata.title}\`);
      
      // Rate limiting to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(\`❌ Failed to archive: \${entry.metadata.title}\`, error.message);
    }
  }
}

// Usage Examples
const archiver = new SocialMediaArchiver('${baseUrl}');

// Archive a Spotify playlist
archiver.archiveSpotifyPlaylist(
  'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  'your-spotify-token'
);

// Archive a YouTube playlist  
archiver.archiveYouTubePlaylist(
  'https://youtube.com/playlist?list=PLrAXtmRdnEQy6nuLvGWM2cROotopmza6Y',
  'your-youtube-api-key'
);

// Archive a Twitter thread
archiver.archiveTwitterThread(
  'https://twitter.com/username/status/1234567890'
);

// Archive LinkedIn posts
archiver.archiveLinkedInProfile(
  'https://linkedin.com/in/username'
);`}
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