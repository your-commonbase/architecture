# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.3 application called "commonbase-next" that implements a knowledge management system with semantic search capabilities. The project is designed to be a simple, no-frills commonbase for creating, reading, writing, and connecting knowledge entries.

### Core Features (per init.md)
- PostgreSQL-based storage with Drizzle ORM
- Full-text search (FTS) and vector embeddings for semantic search  
- Entry management with metadata, links, and backlinks
- Image upload and AI transcription capabilities
- Cart functionality for collecting and synthesizing entries
- Multiple pages: ledger, entry details, search, add, feed, share

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack  
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.0 with shadcn/ui components
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Drizzle ORM with migrations
- **AI**: OpenAI API for embeddings and image transcription
- **Fonts**: Geist Sans and Geist Mono from next/font/google

### Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components (shadcn/ui)
- `src/lib/` - Utility functions and database configuration
- `drizzle/` - Database migration files
- `public/assets/` - User-uploaded images and static assets

### API Endpoints (Implemented)
- `POST /api/add` - Create new entries with embedding generation
- `POST /api/addImage` - Image upload and AI transcription
- `POST /api/search` - Semantic and full-text search with highlighting
- `POST /api/random` - Fetch random entries for feed
- `GET /api/fetch/[id]` - Get entry by ID with metadata
- `POST /api/update` - Update entry data/metadata and regenerate embeddings
- `POST /api/delete` - Delete entries and associated embeddings
- `GET /api/list` - Paginated entry listing for ledger
- `POST /api/join` - Link entries together with bidirectional references

### Database Schema (Implemented)
- `commonbase` table: `id` (UUID), `data` (text), `metadata` (JSON), `created`, `updated`
- `embeddings` table: `id` (UUID FK), `embedding` (vector[1536])
- Full-text search enabled on `data` field
- Cascade deletion from commonbase to embeddings

### Pages (Implemented)
- `/` - Welcome page with feature overview
- `/ledger` - Data table with bulk operations and cart integration
- `/entry/[id]` - Entry detail with editing, linking, and neighbors
- `/search` - Semantic/full-text search with query highlighting
- `/add` - Text and image upload with AI transcription
- `/feed` - Infinite scroll random discovery
- `/share` - Cart management and AI synthesis

## Configuration Notes

- Uses Turbopack for faster development builds
- TypeScript path mapping: `@/*` → `./src/*`
- ESLint configured with Next.js recommended settings
- Tailwind CSS 4.0 with inline theme configuration
- Dark/light mode support via CSS custom properties

## Development Context

This is a fully implemented knowledge management system built according to the specifications in `init.md`. All features are complete and functional, including:

- Full database schema with PostgreSQL and pgvector
- Complete API implementation for all CRUD operations
- All user interface pages with modern React components
- AI integration for embeddings, image transcription, and content synthesis
- Cart system for collecting and synthesizing entries
- Advanced search with semantic and full-text capabilities

## Setup Requirements

1. **Database**: PostgreSQL with pgvector extension
2. **Environment**: OpenAI API key for AI features
3. **Dependencies**: All packages installed and configured

See `setup.md` for detailed setup instructions.