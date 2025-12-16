# How to Add GIF/Images to Your Vercel Deployment

## Step 1: Download the GIF/Image

1. Right-click on the image/GIF from Google Images
2. Select "Save image as..." or "Save picture as..."
3. Save it to your computer (remember the location)

## Step 2: Add to Your Project

1. Copy the downloaded GIF/image file
2. Paste it into: `public/images/` folder
3. Name it something simple (e.g., `hero-background.gif`)

## Step 3: Use in Your Code

### Option A: As Background Image (like your homepage)

```tsx
<div 
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: 'url(/images/your-gif-name.gif)',
  }}
/>
```

### Option B: As Regular Image

```tsx
<img 
  src="/images/your-gif-name.gif" 
  alt="Description" 
  className="w-full h-auto"
/>
```

### Option C: Using Next.js Image Component (if optimized)

```tsx
import Image from 'next/image';

<Image 
  src="/images/your-gif-name.gif" 
  alt="Description"
  width={800}
  height={600}
/>
```

## Important Notes:

- ✅ Files in `public/images/` are accessible at `/images/filename.gif`
- ✅ These files will be included in your Vercel deployment
- ❌ External URLs (like Google Images) won't work reliably
- ✅ Always use local files for production

## After Adding:

1. Commit the file: `git add public/images/your-gif-name.gif`
2. Commit: `git commit -m "Add GIF to public/images"`
3. Push: `git push origin main`
4. Vercel will automatically deploy it!

