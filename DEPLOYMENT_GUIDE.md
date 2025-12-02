# ManageNow Deployment Guide 🚀

## Prerequisites
Before deploying, you need to handle the SQLite database since it's file-based and won't work well in serverless environments.

## Important: Database Migration Required

Your app currently uses SQLite (file-based database), which **won't work** in production on platforms like Vercel, Netlify, or serverless environments because:
- ❌ No persistent file system
- ❌ Each request runs on different server
- ❌ Database file gets deleted on redeployment

### Solution Options:

#### **Option A: Switch to PostgreSQL (Recommended for Production)**

**Why PostgreSQL?**
- ✅ Persistent storage
- ✅ Works with serverless
- ✅ Better for multiple users
- ✅ Free tier available (Neon, Supabase, Vercel Postgres)

**Steps:**
1. Create a PostgreSQL database (Vercel Postgres, Neon, or Supabase)
2. Convert SQLite queries to PostgreSQL
3. Update connection in `lib/` files
4. Migrate data

#### **Option B: Use Turso (SQLite in the Cloud)**

**Why Turso?**
- ✅ SQLite compatible (minimal code changes)
- ✅ Edge database (fast)
- ✅ Free tier: 9GB storage, 1 billion row reads
- ✅ Works with serverless

**Steps:**
1. Sign up at https://turso.tech
2. Install Turso CLI: `brew install tursodatabase/tap/turso`
3. Create database: `turso db create managenow`
4. Get connection URL
5. Update code to use Turso client

#### **Option C: Keep SQLite with Persistent VPS**

**Platforms:**
- DigitalOcean App Platform
- Railway
- Fly.io
- Render

These provide persistent storage for SQLite files.

---

## Deployment Methods

### 🥇 **Method 1: Vercel (Recommended)**

#### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
cd /Users/nabilakayana/Desktop/managenow
git init
git add .
git commit -m "Initial commit - ManageNow app"

# Create GitHub repository (via GitHub website)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/managenow.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to https://vercel.com
2. Click "Sign Up" with GitHub
3. Click "Import Project"
4. Select your `managenow` repository
5. Vercel auto-detects Next.js settings
6. Click "Deploy"
7. ✅ Done! Your app is live at `managenow.vercel.app`

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? managenow
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

#### Step 3: Set Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add:
   ```
   DATABASE_URL=your_database_url_here
   NEXT_PUBLIC_APP_URL=https://managenow.vercel.app
   ```

#### Step 4: Configure Database (Required!)

**For Vercel Postgres:**
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# In Vercel Dashboard:
# Storage → Create Database → Postgres
# Copy DATABASE_URL
```

Update `lib/sqlite.ts` to use Postgres:
```typescript
import { sql } from '@vercel/postgres';

export async function getDatabase() {
  return sql;
}
```

---

### 🥈 **Method 2: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

**Issues with Netlify + Next.js:**
- Requires `@netlify/plugin-nextjs`
- Serverless functions may have cold starts
- Better suited for static sites

---

### 🥉 **Method 3: Railway (Good for SQLite)**

Railway supports persistent storage, so you can keep SQLite!

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `managenow` repository
6. Railway auto-detects Next.js
7. Click "Deploy"
8. Add volume for SQLite:
   - Settings → Volumes
   - Mount path: `/app/data`
   - Update code to use `/app/data/managenow.db`

**Advantages:**
- ✅ Persistent file system (SQLite works!)
- ✅ $5/month free credit
- ✅ Easy setup

---

### 🏆 **Method 4: DigitalOcean App Platform**

**Steps:**
1. Go to https://cloud.digitalocean.com
2. Create → Apps → GitHub
3. Select `managenow` repository
4. Choose plan: Basic ($5/month)
5. Add environment variables
6. Deploy

**Advantages:**
- ✅ Persistent storage
- ✅ SQLite works
- ✅ $200 free credit for 60 days

---

## Quick Comparison

| Platform | SQLite Support | Free Tier | Ease | Speed |
|----------|---------------|-----------|------|-------|
| **Vercel** | ❌ No | ✅ Yes | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ |
| **Railway** | ✅ Yes | ✅ $5 credit | ⭐⭐⭐⭐ | ⚡⚡ |
| **Netlify** | ❌ No | ✅ Yes | ⭐⭐⭐ | ⚡⚡ |
| **DigitalOcean** | ✅ Yes | ⚠️ Trial | ⭐⭐⭐ | ⚡⚡ |
| **Fly.io** | ✅ Yes | ✅ Yes | ⭐⭐ | ⚡⚡⚡ |

---

## Recommended Path for ManageNow

### **Best for Production:**
1. **Use Vercel + Turso**
   - Deploy frontend to Vercel (free, fast)
   - Use Turso for SQLite database (free tier)
   - Minimal code changes
   - Best performance

### **Quick & Easy (Keep SQLite):**
1. **Use Railway**
   - Deploy entire app to Railway
   - SQLite file persists
   - No code changes needed
   - $5/month after free credit

---

## Step-by-Step: Deploy to Vercel + Turso

### 1. Setup Turso Database

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Signup
turso auth signup

# Create database
turso db create managenow

# Get database URL
turso db show managenow

# Create auth token
turso db tokens create managenow
```

### 2. Update Code for Turso

Install Turso client:
```bash
npm install @libsql/client
```

Create `lib/turso.ts`:
```typescript
import { createClient } from '@libsql/client';

export const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function getDatabase() {
  return tursoClient;
}
```

### 3. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Add Turso support"
git push

# Deploy via Vercel Dashboard or CLI
vercel --prod
```

### 4. Add Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables:
```
TURSO_DATABASE_URL=libsql://managenow-xxx.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

### 5. Migrate Data to Turso

```bash
# Export SQLite data
sqlite3 managenow.db .dump > data.sql

# Import to Turso
turso db shell managenow < data.sql
```

---

## Custom Domain Setup

### On Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `managenow.com`)
3. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. ✅ Your app is now at `managenow.com`!

---

## Security Checklist Before Going Public

- [ ] Remove all console.logs with sensitive data
- [ ] Add rate limiting for API routes
- [ ] Enable CORS properly
- [ ] Use HTTPS only (automatic on Vercel)
- [ ] Add authentication for all routes
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Add error boundaries
- [ ] Enable CSP (Content Security Policy)
- [ ] Add robots.txt and sitemap.xml

---

## Performance Optimization

```typescript
// next.config.ts
const config = {
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
};
```

---

## Monitoring & Analytics

### Add Analytics:
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Cost Estimate

### Free Tier (Hobby Projects):
- **Vercel**: 100GB bandwidth/month, unlimited projects
- **Turso**: 9GB storage, 1B row reads/month
- **Total**: $0/month ✅

### Paid Tier (Production):
- **Vercel Pro**: $20/month
- **Turso Pro**: $29/month (10GB storage, 10B reads)
- **Custom Domain**: $10-15/year
- **Total**: ~$50/month

---

## Support & Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Railway Docs](https://docs.railway.app)

---

## Need Help?

Common issues:
1. **Build fails**: Check Node version (use v18+)
2. **Database errors**: Verify connection string
3. **404 errors**: Check API routes and file structure
4. **Slow cold starts**: Use edge functions or upgrade plan

---

**Ready to deploy? Start with Vercel + Turso for best results!** 🚀
