# Commonbase

A modern knowledge management system built with Next.js that combines semantic search, AI-powered content synthesis, and intelligent linking to help you build and explore your personal knowledge base.

## ✨ Features

### 🧠 AI-Powered Intelligence
- **Semantic Search**: Find entries by meaning, not just keywords, using OpenAI embeddings and vector similarity
- **Full-Text Search**: Traditional keyword-based search with PostgreSQL FTS
- **Hybrid Search**: Combines both semantic and full-text search with smart deduplication
- **AI Image Transcription**: Automatically transcribes uploaded images using GPT-4V
- **Content Synthesis**: AI-powered synthesis of multiple entries into cohesive narratives

### 📝 Content Management
- **Rich Entry Types**: Support for text, images, links, and comments
- **Smart Linking**: Bi-directional links with automatic backlink management
- **Visual Comments**: Add text or image comments to any entry
- **Entry Joining**: Link related entries together with semantic search assistance
- **Cart System**: Collect entries for synthesis or bulk operations

### 🔍 Discovery & Navigation
- **Semantic Neighbors**: Automatically discover related entries based on content similarity
- **Related Entries**: View links, backlinks, and similar entries for any entry
- **Random Feed**: Discover content with intelligent pagination (2 items at a time)
- **Visual Entry Cards**: Image thumbnails for visual content recognition

### 🎨 User Experience
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Immediate UI updates after actions
- **External Link Detection**: Automatic external link icons and formatting
- **Image Galleries**: Proper image display throughout the application

## 🚀 Quick Start

> **📋 See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions**

### Prerequisites
- Node.js 18+
- PostgreSQL with pgvector extension
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables in `.env.local`
4. Follow the complete setup guide in [GETTING_STARTED.md](./GETTING_STARTED.md)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4.0
- **Backend**: Next.js API routes, Drizzle ORM
- **Database**: PostgreSQL with pgvector for vector embeddings
- **AI**: OpenAI GPT-4V for image transcription and content synthesis
- **Search**: Hybrid semantic + full-text search
- **UI**: shadcn/ui components with Lucide icons

### Key Components
- **Vector Search**: Custom PostgreSQL vector operations with cosine similarity
- **Smart Deduplication**: Server-side result deduplication across search types  
- **Referential Integrity**: Automatic cleanup of links when entries are deleted
- **Comment System**: Threaded comments with image support and parent metadata inheritance

## 📖 Usage

### Adding Content
- **Text Entries**: Use the Add page or quick-add from any page
- **Image Entries**: Upload images with automatic AI transcription
- **Linked Content**: Add entries with external source URLs

### Finding Content
- **Search**: Use the search page with hybrid semantic + full-text search
- **Browse**: Use the ledger to see all entries chronologically  
- **Discover**: Use the feed for serendipitous content discovery
- **Navigate**: Follow links and explore related entries

### Organizing Knowledge
- **Link Entries**: Use the Join functionality to connect related concepts
- **Add Comments**: Annotate entries with additional context or images
- **Create Syntheses**: Use the cart system to combine multiple entries into new insights

## Images

<img width="3308" height="5090" alt="screencapture-localhost-3000-entry-00102190-e0e1-4e29-bf98-a9464775402c-2025-09-14-11_35_16" src="https://github.com/user-attachments/assets/ac5cb195-d703-4074-b301-2d429976e37b" />
<img width="3308" height="2706" alt="screencapture-localhost-3000-entry-6efcb247-fcf0-43ba-b81b-05a0782cc443-2025-09-14-11_35_03" src="https://github.com/user-attachments/assets/98d3c645-adeb-4399-a8d2-ea2d1ccdf9d8" />
<img width="3308" height="2706" alt="screencapture-localhost-3000-entry-6efcb247-fcf0-43ba-b81b-05a0782cc443-2025-09-14-11_34_49" src="https://github.com/user-attachments/assets/4ad86ee9-34d0-4840-8ea3-681fa5142b32" />
<img width="3308" height="4590" alt="screencapture-localhost-3000-share-2025-09-14-11_30_49" src="https://github.com/user-attachments/assets/1103dfb2-45d5-429d-99ca-9eb3be014620" />
<img width="3308" height="2442" alt="screencapture-localhost-3000-graph-2025-09-14-11_28_48" src="https://github.com/user-attachments/assets/8a86ec2f-3286-499d-9332-49a14e045d74" />
<img width="3308" height="2442" alt="screencapture-localhost-3000-search-2025-09-14-11_27_25" src="https://github.com/user-attachments/assets/a402c395-2951-4964-b65e-05aca58976a3" />
<img width="3308" height="3026" alt="screencapture-localhost-3000-ledger-2025-09-14-11_26_24" src="https://github.com/user-attachments/assets/602fb6d6-0fee-4387-ad23-ef58d0855b37" />
<img width="3308" height="3528" alt="screencapture-localhost-3000-2025-09-14-11_25_58" src="https://github.com/user-attachments/assets/613e02c6-0c04-4648-9f05-2c8d8006d50b" />


## 🔧 Configuration

Key configuration files:
- `.env.local` - Environment variables (OpenAI API key, database URL)
- `drizzle.config.ts` - Database configuration
- `tailwind.config.js` - Styling configuration
- `components.json` - shadcn/ui configuration

## 📚 Documentation

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Complete setup guide
- [CLAUDE.md](./CLAUDE.md) - Development context for AI assistants

## 🤝 Contributing

This project is designed to work seamlessly with AI development assistants. See [CLAUDE.md](./CLAUDE.md) for development context and patterns.

## 📄 License

MIT License - see LICENSE file for details.
