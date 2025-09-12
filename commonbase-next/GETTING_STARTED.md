# Getting Started with Commonbase

Follow these steps to set up and run your Commonbase application.

## Step 1: Prerequisites

Make sure you have these installed:
- **Node.js 18+** (check with `node --version`)
- **PostgreSQL** (check with `psql --version`)
- **Git** (to clone or manage the repo)

## Step 2: Database Setup

### 2.1 Create Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the database
CREATE DATABASE "commonbase";

# Connect to the new database
\c commonbase
```

### 2.2 Install Required Extensions
```sql
-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable trigram extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Exit psql
\q
```

## Step 3: Environment Configuration

Your `.env.local` file is already configured:
```
DATABASE_URL=postgresql://localhost:5432/commonbase
OPENAI_API_KEY=sk-proj-[your-key]
EMBEDDING_DIMENSIONS=1536
```

✅ **This step is complete** - your OpenAI API key is already set.

## Step 4: Install Dependencies

```bash
# Install all required packages
npm install
```

## Step 5: Database Schema Setup

```bash
# Generate migration files (already done, but safe to run)
npm run db:generate

# Push the schema to your database
npm run db:push
```

You should see output like:
```
✓ Your SQL migration file ➜ drizzle/0000_worried_microchip.sql 🚀
✓ Database schema updated successfully
```

## Step 6: Start the Development Server

```bash
# Start the Next.js development server with Turbopack
npm run dev
```

You should see:
```
▲ Next.js 15.5.3 (turbopack)
- Local:        http://localhost:3000
- Ready in [time]
```

## Step 7: Test the Application

1. **Open your browser** to `http://localhost:3000`

2. **Navigate through the app:**
   - Home page should show the welcome interface
   - Click "Add Content" to create your first entry
   - Try the different pages: Ledger, Search, Feed, Share

3. **Add your first entry:**
   - Go to `/add`
   - Enter some text in the "Text Entry" tab
   - Click "Add Text Entry"
   - You should be redirected to the entry detail page

## Step 8: Verify Core Features

### Test Text Entry
1. Go to `/add`
2. Add a text entry like "This is my first knowledge entry about machine learning"
3. Verify it appears in `/ledger`

### Test Search
1. Go to `/search`
2. Search for keywords from your entry
3. Try both semantic and full-text search modes

### Test Image Upload (Optional)
1. Go to `/add` → "Image Upload" tab
2. Upload an image file
3. Wait for AI transcription to complete

### Test Cart & Synthesis
1. Add entries to your cart from the ledger or search results
2. Go to `/share` to see your cart
3. Try the AI synthesis feature

## Step 9: Database Management (Optional)

### View your data:
```bash
# Open Drizzle Studio to browse your database
npm run db:studio
```

### Direct database access:
```bash
# Connect directly to your database
psql postgresql://localhost:5432/commonbase
```

## Common Issues & Solutions

### Database Connection Issues
- Make sure PostgreSQL is running: `brew services start postgresql` (macOS) or `sudo service postgresql start` (Linux)
- Check if the database exists: `psql -l`
- Verify the DATABASE_URL matches your PostgreSQL setup

### Extension Not Found
```sql
-- If vector extension fails, install pgvector first
-- On macOS with Homebrew:
-- brew install pgvector
-- Then reconnect and try CREATE EXTENSION vector;
```

### API Key Issues
- Make sure your OpenAI API key is valid and has credits
- The app will work without the API key but won't generate embeddings or transcribe images

### Port Already in Use
- If port 3000 is busy, Next.js will automatically use port 3001
- Or manually specify: `npm run dev -- -p 3001`

## Success Indicators

You'll know everything is working when:

✅ **Development server starts** without errors  
✅ **Home page loads** at http://localhost:3000  
✅ **Can add text entries** and see them in the ledger  
✅ **Search returns results** for your entries  
✅ **Database tables exist** (check with Drizzle Studio)  
✅ **No console errors** in browser developer tools  

## Next Steps

Once everything is running:
- Explore all the features by adding various types of content
- Try linking entries together
- Use the cart system to collect and synthesize ideas
- Experiment with both text and image entries

Need help? Check the browser console for error messages or review the setup steps above.