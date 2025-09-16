-- Create NextAuth.js tables for production database
-- Run this SQL in your production database (Neon/Supabase console)

-- Users table
CREATE TABLE IF NOT EXISTS "user" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP,
  "image" TEXT
);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS "account" (
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  PRIMARY KEY ("provider", "providerAccountId")
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "session" (
  "sessionToken" TEXT PRIMARY KEY NOT NULL,
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP NOT NULL
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS "verificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- User API keys table for custom API key functionality
CREATE TABLE IF NOT EXISTS "userApiKey" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL UNIQUE,
  "created" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastUsed" TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "userApiKey_keyHash_unique" ON "userApiKey"("keyHash");

-- Verify tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'account', 'session', 'verificationToken', 'userApiKey')
ORDER BY table_name;