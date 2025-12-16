# Deployment Guide for Dreamify

This guide will help you deploy your Dreamify application to a live domain.

## Option 1: Vercel (Recommended - Free & Easy)

Vercel is made by the creators of Next.js and offers the easiest deployment.

### Steps:

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/Login with your GitHub account

2. **Import Your Repository**
   - Click "Add New Project"
   - Select your GitHub repository: `tcliang02/Dreamify`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at: `https://dreamify.vercel.app` (or custom domain)

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `dreamify.com`)
   - Follow DNS configuration instructions

### Automatic Deployments
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests

---

## Option 2: Netlify (Alternative - Free)

1. **Go to Netlify**
   - Visit https://netlify.com
   - Sign up/Login with GitHub

2. **Import Repository**
   - Click "Add new site" → "Import an existing project"
   - Select GitHub → Choose `tcliang02/Dreamify`

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

4. **Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain

---

## Option 3: GitHub Pages (Requires Static Export)

For GitHub Pages, you need to export as static site:

1. **Update next.config.js:**
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

2. **Build and Deploy:**
```bash
npm run build
# Then use GitHub Actions or manual upload
```

**Note:** GitHub Pages doesn't support server-side features, so API routes won't work.

---

## Important Notes:

### ⚠️ LocalStorage Limitation
Your app currently uses `localStorage` for data storage. This means:
- Each user's browser has separate data
- Data doesn't persist across devices
- For production, consider migrating to a database (MongoDB, PostgreSQL, etc.)

### ✅ What Works on Vercel/Netlify:
- All your current features
- Client-side storage (localStorage)
- Static pages
- API routes (Vercel only, not Netlify static)

### 🔧 Environment Variables (if needed later)
If you add environment variables:
1. Go to Project Settings → Environment Variables
2. Add your variables
3. Redeploy

---

## Quick Deploy Command (Vercel CLI)

Alternatively, you can use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Recommended: Vercel

**Why Vercel?**
- ✅ Made for Next.js (zero configuration)
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from GitHub
- ✅ Preview deployments for PRs
- ✅ Custom domains
- ✅ Serverless functions support

Your app will be live in minutes!

