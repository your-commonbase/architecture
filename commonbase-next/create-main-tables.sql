-- Create main application tables (commonbase and embeddings)
-- Run this in your Neon SQL Editor AFTER creating auth tables

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create commonbase table
CREATE TABLE IF NOT EXISTS "commonbase" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "data" TEXT NOT NULL,
  "metadata" JSONB DEFAULT '{}',
  "created" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 3: Create embeddings table (only after commonbase exists)
CREATE TABLE IF NOT EXISTS "embeddings" (
  "id" UUID PRIMARY KEY REFERENCES "commonbase"("id") ON DELETE CASCADE,
  "embedding" vector(1536) NOT NULL
);

-- Step 4: Create performance indexes
CREATE INDEX IF NOT EXISTS "commonbase_created_idx" ON "commonbase"("created" DESC);
CREATE INDEX IF NOT EXISTS "commonbase_data_fts_idx" ON "commonbase" USING gin(to_tsvector('english', "data"));
CREATE INDEX IF NOT EXISTS "embeddings_vector_idx" ON "embeddings" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);

-- Step 5: Verify tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('commonbase', 'embeddings')
ORDER BY table_name;

-- Step 6: Check if vector extension is working
SELECT extname FROM pg_extension WHERE extname = 'vector';