# Commonbase Next - One-Click Deploy Guide

Deploy your team's private Commonbase instance with authentication and database in minutes.

## Quick Deploy Options

### 1. Deploy to Vercel (Recommended)



[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-commonbase%2Fcommonbase%2Ftree%2Fauth%2Fcommonbase-next&env=NEXTAUTH_SECRET,NEXTAUTH_URL,GITHUB_ID,GITHUB_SECRET,API_KEY,OPENAI_API_KEY&envDescription=Required%20environment%20variables%20for%20authentication%20and%20API%20access&project-name=team-commonbase&repository-name=team-commonbase)

### 2. Deploy to Railway
*Coming soon*

## Pre-Deploy Setup

### Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Team Commonbase` (or your team name)
   - **Homepage URL**: `https://your-deployment-url.vercel.app` (you'll get this after deploy)
   - **Authorization callback URL**: `https://your-deployment-url.vercel.app/api/auth/callback/github`

4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### Step 2: Prepare Environment Variables

You'll need these values ready for deployment:

```bash
# Required for authentication
NEXTAUTH_SECRET=     # Generate: openssl rand -base64 32
NEXTAUTH_URL=        # Your deployment URL (e.g., https://your-app.vercel.app)
GITHUB_ID=           # From your OAuth app
GITHUB_SECRET=       # From your OAuth app
API_KEY=             # Generate: openssl rand -base64 32

# Required for AI features
OPENAI_API_KEY=      # Your OpenAI API key

# Optional: Restrict users
ALLOWED_USERS=user1@example.com,user2@example.com
```

## Deployment Process

### Using Vercel

1. **Click Deploy Button** above
2. **Connect to GitHub** and authorize Vercel
3. **Configure Environment Variables**:
   - Enter all the values you prepared above
   - For `NEXTAUTH_URL`, you can temporarily use `https://your-project.vercel.app` (you'll update this after deployment)
4. **Deploy and Get URL**:
   - Complete the deployment
   - Copy your actual deployment URL from Vercel (e.g., `https://team-commonbase-xyz.vercel.app`)
5. **Update Environment Variables**:
   - Go to Vercel → Project Settings → Environment Variables
   - Update `NEXTAUTH_URL` with your actual deployment URL
6. **Add Database Integration**:
   - In Vercel dashboard, go to your project
   - Navigate to "Integrations" tab
   - Add "Neon" (PostgreSQL database)
   - This will auto-set `DATABASE_URL`
7. **Update OAuth App**:
   - Update your GitHub OAuth app's callback URL to: `https://your-actual-url.vercel.app/api/auth/callback/github`
8. **Redeploy** to apply all changes

### Post-Deploy Setup

1. **Verify Authentication**:
   - Visit your deployment URL
   - You should be redirected to sign in
   - Only GitHub org members can sign in

2. **Test API Access**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/add \\
     -H "x-api-key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"data": "Test entry via API"}'
   ```

3. **Invite Team Members**:
   - Share the deployment URL with your team
   - They can sign in with their GitHub accounts
   - Optionally use `ALLOWED_USERS` for extra restriction

## Local Development

Local development remains completely unchanged:

```bash
# No auth required locally
npm install
npm run dev
```

- No sign-in required for local development
- Uses local PostgreSQL database
- All API routes work without authentication
- Same development experience as before

## Team Isolation

Each deployment gets:
- ✅ **Separate database** (Neon instance per deploy)
- ✅ **Private authentication** (GitHub org restrictions)
- ✅ **Unique API keys** (team-specific access)
- ✅ **Custom domain** (optional)
- ✅ **Independent data** (no cross-team access)

## Quick Fix for "/api/auth/error"

If you're getting redirected to `/api/auth/error` when clicking "Continue with GitHub":

1. **Visit** `https://your-deployment-url.vercel.app/api/auth-debug` to check your configuration
2. **Most common issue**: Missing or incorrect `NEXTAUTH_URL` environment variable
3. **Fix**: Go to Vercel → Project Settings → Environment Variables and set:
   - `NEXTAUTH_URL` = your exact deployment URL (e.g. `https://team-commonbase.vercel.app`)
4. **Redeploy** your app after updating environment variables

## Troubleshooting

### OAuth Errors

**"Configuration" Error:**
- Ensure `NEXTAUTH_URL` is set to your exact deployment URL (e.g., `https://team-commonbase-xyz.vercel.app`)
- Verify `NEXTAUTH_SECRET` is set and 32+ characters long
- Check that all required environment variables are set: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_ID`, `GITHUB_SECRET`

**"AccessDenied" Error:**
- Check GitHub OAuth app callback URL matches: `https://your-deployment-url.vercel.app/api/auth/callback/github`
- Verify the user's GitHub email is not restricted by `ALLOWED_USERS` (if set)
- Ensure the GitHub OAuth app is active and not suspended

**"Verification" Error:**
- Usually indicates a callback URL mismatch
- Double-check your GitHub OAuth app's Authorization callback URL

### Database Issues
- Neon integration should auto-set `DATABASE_URL`
- Check Vercel → Project → Integrations → Neon
- Database tables are created automatically on first deploy

### API Key Issues
- API key should be 32+ random characters
- Include `x-api-key` header in API requests
- Check Vercel environment variables are set correctly

## Cost Estimates

**Free Tier (Hobby Use):**
- Vercel: Free
- Neon: Free (up to 3GB)
- Total: $0/month

**Production (Team Use):**
- Vercel Pro: $20/month
- Neon: $19/month (10GB)
- Total: ~$39/month per team

## Support

For deployment issues:
1. Check environment variables are set correctly
2. Verify OAuth app configuration
3. Check Vercel build logs for errors
4. Ensure database integration is properly connected