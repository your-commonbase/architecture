# CommonBase Deployment Guide

This guide covers deploying your CommonBase application to Vercel with authentication and a PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (free tier)
- OpenAI API key for embeddings
- GitHub OAuth app (for production authentication)

## Database Options (Free Tier)

### Option 1: Neon (Recommended)
- **Free tier**: 0.5 GB storage, 1 database
- **PostgreSQL** with pgvector extension support
- **Serverless** with automatic scaling to zero

### Option 2: Supabase
- **Free tier**: 500 MB database, 2 projects
- **PostgreSQL** with built-in pgvector
- **Additional features**: Auth, storage, real-time

### Option 3: Railway
- **Free tier**: $5/month credit (enough for small projects)
- **PostgreSQL** with extensions
- **Simple deployment**

## Step 1: GitHub OAuth Setup (Required for Production)

### 1.1 Create GitHub OAuth App
1. **Go to GitHub Settings**: [Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. **Register Application**:
   - **Application name**: Commonbase
   - **Homepage URL**: `https://your-deployment-url.vercel.app` (you'll update this after deployment)
   - **Authorization callback URL**: `https://your-deployment-url.vercel.app/api/auth/callback/github`
3. **Save Credentials**: Copy the **Client ID** and generate a **Client Secret**

### 1.2 Generate Auth Secret
Run this command to generate a secure authentication secret:
```bash
openssl rand -base64 32
```
Save this output - you'll need it for the `AUTH_SECRET` environment variable.

## Step 2: Prepare Your Database

### Using Neon (Recommended)

1. **Create Account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create Database**: 
   - Click "Create Project"
   - Choose region closest to your users
   - Note down the connection string
3. **Enable pgvector**:
   ```sql
   CREATE EXTENSION vector;
   ```

### Using Supabase

1. **Create Account**: Go to [supabase.com](https://supabase.com) and sign up
2. **Create Project**:
   - Click "New Project"
   - Choose organization and region
   - Set database password
3. **Get Connection Details**:
   - Go to Settings → Database
   - Copy the connection string (URI format)

## Step 3: Set Up Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Update Environment Variables**:
   Create `.env.example` for reference:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   DATABASE_NAME="your_database_name"

   # OpenAI (required for embeddings)
   OPENAI_API_KEY="your_openai_api_key"

   # Authentication (required for production)
   NEXTAUTH_SECRET="your-generated-secret-from-step-1.2"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   NEXTAUTH_URL="https://your-deployment-url.vercel.app"

   # User Access Control (optional)
   ALLOWED_USERS="user1@example.com,user2@example.com"

   # Demo Mode (optional)
   DISABLE_ADD="false"

   # API Access (optional)
   API_KEY="your-secure-api-key-for-programmatic-access"
   ```

## Step 4: Deploy to Vercel

### Initial Setup

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add all variables from your `.env.example`:
     ```
     DATABASE_URL=postgresql://your_connection_string
     DATABASE_NAME=your_database_name
     OPENAI_API_KEY=your_openai_api_key
     NEXTAUTH_SECRET=your-generated-secret
     GITHUB_CLIENT_ID=your-github-client-id
     GITHUB_CLIENT_SECRET=your-github-client-secret
     NEXTAUTH_URL=https://your-app-name.vercel.app
     ALLOWED_USERS=your-email@example.com
     DISABLE_ADD=false
     ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for initial build to complete

### Database Migration

1. **Run Migrations** (after first deploy):
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   vercel link
   
   # Run database setup remotely
   vercel env pull .env.production
   npx drizzle-kit push:pg --config=drizzle.config.ts
   ```

2. **Alternative: Manual Migration**:
   - Connect to your database using the provider's console
   - Run the SQL from `src/lib/db/schema.ts` manually

### Update GitHub OAuth App
After deployment, update your GitHub OAuth application:
1. **Get your Vercel URL**: Copy the deployment URL from Vercel dashboard
2. **Update GitHub OAuth app**:
   - Go back to [GitHub OAuth Apps settings](https://github.com/settings/developers)
   - Click on your Commonbase app
   - Update **Homepage URL** to: `https://your-actual-vercel-url.vercel.app`
   - Update **Authorization callback URL** to: `https://your-actual-vercel-url.vercel.app/api/auth/callback/github`

## Step 5: Configure Domain (Optional)

1. **Custom Domain**:
   - Go to your Vercel project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Demo Mode Setup** (for public demos):
   ```bash
   # Set demo mode via Vercel dashboard or CLI
   vercel env add DISABLE_ADD
   # Enter: true
   ```

## Step 6: Verify Authentication Setup

### 6.1 Check Authentication Debug
Visit `https://your-app.vercel.app/api/auth-debug` to verify:
- `authEnabled` should be `true`
- `NODE_ENV` should be `production`
- All required environment variables should show as `true`
- You should see recommendations if anything is missing

### 6.2 Test Authentication Flow
1. **Visit your app**: Go to `https://your-app.vercel.app`
2. **Should redirect**: You should be automatically redirected to `/auth/signin`
3. **Test GitHub OAuth**: Click "Continue with GitHub"
4. **Grant permissions**: Authorize the app if prompted
5. **Should redirect back**: You should return to the main app

If this doesn't work, check:
- GitHub OAuth callback URL matches exactly (including `https://`)
- All AUTH_* environment variables are set in Vercel
- ALLOWED_USERS includes your GitHub email (if using user restrictions)

## Step 7: Testing Your Deployment

1. **Check Health**:
   - Visit `https://your-app.vercel.app`
   - Try adding a test entry
   - Verify search functionality works

2. **Monitor**:
   - Check Vercel Functions logs for any errors
   - Monitor database usage in your provider's dashboard

## Database Schema Setup

Your database needs these tables. Run this SQL in your database console:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Main entries table
CREATE TABLE IF NOT EXISTS commonbase (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  data TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embeddings table for semantic search
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  embedding vector(1536),
  FOREIGN KEY (id) REFERENCES commonbase(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_commonbase_created ON commonbase(created DESC);
CREATE INDEX IF NOT EXISTS idx_commonbase_metadata ON commonbase USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

## Troubleshooting

### Common Issues

1. **"pgvector extension not found"**:
   - Ensure your database provider supports pgvector
   - Run `CREATE EXTENSION vector;` in your database

2. **OpenAI API errors**:
   - Verify your API key is correct
   - Check you have credits in your OpenAI account

3. **Database connection fails**:
   - Ensure connection string is correct
   - Check if SSL is required (add `?sslmode=require`)

4. **Build fails on Vercel**:
   - Check Node.js version compatibility
   - Verify all environment variables are set

### Performance Tips

1. **Database**:
   - Monitor connection pooling
   - Consider upgrading if you hit free tier limits

2. **Vercel**:
   - Use Edge Functions for simple operations
   - Monitor function execution time and memory

3. **OpenAI**:
   - Consider caching embeddings
   - Monitor API usage and costs

## Cost Estimates

### Free Tier Limits
- **Neon**: 0.5GB storage, 1 database
- **Vercel**: 100GB bandwidth, 100 serverless function executions
- **OpenAI**: Pay-per-use (embeddings ~$0.0001 per 1K tokens)

### Scaling Up
- **Database**: $10-20/month for 1-10GB
- **Vercel Pro**: $20/month for team features
- **OpenAI**: Monitor usage, typically $5-50/month

## Security Checklist

- [ ] Database uses SSL connections
- [ ] API keys are in environment variables, not code
- [ ] Demo mode enabled for public deployments
- [ ] CORS configured properly for your domain
- [ ] Database has appropriate access controls

## Maintenance

1. **Regular Backups**:
   - Most providers offer automated backups
   - Consider periodic manual exports

2. **Updates**:
   - Keep dependencies updated
   - Monitor Vercel and database provider announcements

3. **Monitoring**:
   - Set up alerts for function errors
   - Monitor database usage and performance

## Demo Mode Configuration

For public demos, enable read-only mode:

```bash
# Set environment variable
DISABLE_ADD=true
```

This will:
- Show demo callout banner
- Disable all content creation (add, edit, delete, comments)
- Allow full exploration of existing content
- Display GitHub link for users to deploy their own

---

Your CommonBase application should now be successfully deployed and accessible at your Vercel URL!