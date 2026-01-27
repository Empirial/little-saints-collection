

# Implementation Plan: Fix Missing Assets & Complete System

## Summary

The Cover, Intro, and Ending images are not showing because they haven't been uploaded to Supabase Storage yet. This plan addresses the missing assets and provides options for the preview system.

---

## Problem Analysis

### Current State
| Asset Type | Local Directory | Supabase Storage |
|------------|-----------------|------------------|
| Letter Pages (themed) | ✅ WebP files in `personalization/` | ❌ Not uploaded |
| Cover | ❌ Not in local | ❌ Not in storage |
| Intro (1.jpg, 2.jpg) | ❌ Not in local | ❌ Not in storage |
| Ending (1.jpg, 2.jpg) | ❌ Not in local | ❌ Not in storage |
| Dedication | ✅ Local JPG | ✅ `Shared/dedication.jpg` |

### Why Images Don't Show
The preview code references Supabase Storage URLs:
```typescript
image: `${STORAGE_URL}/${characterFolder}/Cover/cover.jpg`
```

But these paths don't exist in the bucket yet.

---

## Solution: Two Options

### Option A: Upload Missing Assets to Storage (Recommended)
Upload the required assets to these exact paths in `book-assets` bucket:

```text
book-assets/
├── Blackboy/
│   ├── Cover/cover.jpg
│   ├── Intro/1.jpg
│   ├── Intro/2.jpg
│   ├── Ending/1.jpg
│   └── Ending/2.jpg
├── Blackgirl/
│   ├── Cover/cover.jpg
│   ├── Intro/1.jpg
│   ├── Intro/2.jpg
│   ├── Ending/1.jpg
│   └── Ending/2.jpg
├── Whiteboy/
│   ├── Cover/cover.jpg
│   ├── Intro/1.jpg
│   ├── Intro/2.jpg
│   ├── Ending/1.jpg
│   └── Ending/2.jpg
├── Whitegirl/
│   ├── Cover/cover.jpg
│   ├── Intro/1.jpg
│   ├── Intro/2.jpg
│   ├── Ending/1.jpg
│   └── Ending/2.jpg
└── Shared/
    └── dedication.jpg ✅ (already uploaded)
```

**Upload URL:** https://supabase.com/dashboard/project/udaudwkblphataokaexq/storage/buckets/book-assets

---

### Option B: Add Placeholder/Fallback UI
Add loading states and fallback UI when images fail to load, showing a placeholder instead of broken images.

---

## Code Changes

### 1. Add Image Loading States & Error Handling

**File: `src/pages/PersonalizePreview.tsx`**

Add state to track image loading errors and show appropriate fallback:

```typescript
// Add error handling for images that fail to load
const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

const handleImageError = (index: number) => {
  setImageErrors(prev => new Set([...prev, index]));
};

// In renderPage function, update img tags:
<img
  src={page.image}
  alt={`${page.type} page`}
  className="absolute inset-0 w-full h-full object-cover"
  loading={index < 3 ? "eager" : "lazy"}
  onError={() => handleImageError(index)}
/>

// Show fallback when image fails:
{imageErrors.has(index) && (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
    <div className="text-center">
      <Skeleton className="w-full h-full absolute inset-0" />
      <p className="relative z-10 text-muted-foreground font-inter text-sm">
        {page.type === 'cover' ? 'Cover Page' : 
         page.type === 'intro' ? 'Intro Page' : 'Ending Page'}
      </p>
    </div>
  </div>
)}
```

### 2. Add Loading Skeleton for Better UX

Wrap images with loading state using the existing Skeleton component:

```typescript
// Add image loading state
const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set(
  book.map((_, i) => i) // Start with all images "loading"
));

const handleImageLoad = (index: number) => {
  setLoadingImages(prev => {
    const next = new Set(prev);
    next.delete(index);
    return next;
  });
};
```

---

## Required Asset Uploads

You need to upload **20 images** total (5 per character × 4 characters):

| Character | Files Needed |
|-----------|-------------|
| Blackboy | cover.jpg, Intro/1.jpg, Intro/2.jpg, Ending/1.jpg, Ending/2.jpg |
| Blackgirl | cover.jpg, Intro/1.jpg, Intro/2.jpg, Ending/1.jpg, Ending/2.jpg |
| Whiteboy | cover.jpg, Intro/1.jpg, Intro/2.jpg, Ending/1.jpg, Ending/2.jpg |
| Whitegirl | cover.jpg, Intro/1.jpg, Intro/2.jpg, Ending/1.jpg, Ending/2.jpg |

**Image specs:** 63.4cm × 23cm (7488 × 2717 px at 300 DPI) for print quality

---

## Technical Summary

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/PersonalizePreview.tsx` | Add image error handling and loading states |

### No Edge Function Changes Needed
The Edge Function already has the correct paths - it just needs the assets to be uploaded.

---

## Advantages of Supabase Storage (Reference)

| Benefit | Description |
|---------|-------------|
| **Edge Function Access** | Server-side PDF generation can fetch images via HTTP |
| **Independent Updates** | Update images without redeploying code |
| **CDN Delivery** | Global edge caching for fast loading |
| **Signed URLs** | Secure private access when needed |
| **Scalability** | No bundle size impact, on-demand loading |
| **Print-Ready Assets** | Store high-resolution JPGs separate from WebP previews |

