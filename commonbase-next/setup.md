# Commonbase Setup Guide

## Prerequisites

1. **PostgreSQL Database** with pgvector extension
2. **OpenAI API Key** for embeddings and image transcription
3. **Node.js 18+**

## Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE commonbase;
   ```

2. Enable the pgvector extension:
   ```sql
   CREATE EXTENSION vector;
   CREATE EXTENSION pg_trgm; -- For full-text search
   ```

3. Update the `DATABASE_URL` in `.env.local`

## Environment Variables

Copy `.env.local` and update:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/commonbase
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_DIMENSIONS=1536
```

## Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate and run database migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Features Implemented

✅ **Database Schema**
- commonbase table (id, data, metadata, created, updated)
- embeddings table (id, embedding vector[1536])
- Automatic cascade deletion

✅ **API Endpoints**
- POST /api/add - Create text entries with embedding
- POST /api/addImage - Upload images with AI transcription
- POST /api/search - Semantic and full-text search
- POST /api/random - Random entry discovery
- GET /api/fetch/[id] - Get entry by ID
- POST /api/update - Update entries (regenerates embeddings)
- POST /api/delete - Delete entries
- GET /api/list - Paginated entry listing
- POST /api/join - Link entries together

✅ **User Interface**
- Ledger page with data table and bulk operations
- Entry detail page with editing and linking
- Search page with highlighting and filters
- Add page with text/image upload tabs
- Feed page with infinite scroll
- Share page with AI synthesis
- Cart functionality throughout

✅ **AI Features**
- OpenAI embeddings for semantic search
- GPT-4V image transcription
- GPT-4 content synthesis
- Vector similarity search

## Next Steps

1. Set up your database and environment variables
2. Run migrations to create tables
3. Add your first entry through the /add page
4. Explore the features through the navigation

The application is now fully functional according to the init.md specifications!