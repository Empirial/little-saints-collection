

## Plan: Update Book Preview Dimensions and Prepare for New Assets

### Overview

You want to update the book preview and PDF system to use new dimensions of **63.4cm × 23cm** (spread format) and upload new slide images to match.

---

### Current vs New Dimensions

| Property | Current | New |
|----------|---------|-----|
| Spread Size | 37cm × 21cm | 63.4cm × 23cm |
| Aspect Ratio | 37:21 (≈1.76:1) | 63.4:23 (≈2.76:1) |
| Single Page | 18.5cm × 21cm | 31.7cm × 23cm |

The new format is significantly **wider and less tall** than the current format.

---

### Implementation Steps

#### Step 1: Update Preview Aspect Ratio

**File: `src/pages/PersonalizePreview.tsx`**

Change the CSS aspect ratio from `aspect-[37/21]` to `aspect-[634/230]` (simplified from 63.4/23):

```tsx
// Line 169 - Change:
className={`relative aspect-[37/21] shadow-xl rounded-lg...`}

// To:
className={`relative aspect-[634/230] shadow-xl rounded-lg...`}
```

This will make the preview display correctly proportioned for your new slide dimensions.

#### Step 2: Upload New Slides to Supabase Storage

You need to upload new JPG images sized at **63.4cm × 23cm** (or 6340px × 2300px at 100dpi, or higher resolution) to the existing `book-assets` bucket.

**Required folder structure in storage:**
```text
book-assets/
├── Blackboy/
│   ├── Cover/cover.jpg
│   ├── Intro/1.jpg, 2.jpg
│   ├── Ending/1.jpg, 2.jpg
│   ├── Superherotheme/1.jpg - 26.jpg
│   ├── Wildanimaltheme/1.jpg - 26.jpg
│   └── Fairytaletheme/1.jpg - 26.jpg
├── Blackgirl/
│   └── (same structure)
├── Whiteboy/
│   └── (same structure)
└── Whitegirl/
    └── (same structure)
```

---

### Supabase Storage Upload Link

Here is the direct link to upload your new slides:

**[Open Supabase Storage - book-assets bucket](https://supabase.com/dashboard/project/udaudwkblphataokaexq/storage/buckets/book-assets)**

From there you can:
1. Navigate to each character folder (Blackboy, Blackgirl, Whiteboy, Whitegirl)
2. Delete old images and upload new ones with the correct 63.4cm × 23cm dimensions
3. Ensure file names match exactly: `cover.jpg`, `1.jpg`, `2.jpg`, etc.

---

### Technical Notes

1. **PDF Generation**: The edge function (`generate-book-pdf`) uses the actual image dimensions from the uploaded files, so it will automatically adapt to the new 63.4cm × 23cm size once you upload the new images.

2. **Image Format**: Keep using JPG format with the same naming convention.

3. **Resolution Recommendation**: For print quality at 300dpi, your images should be:
   - **Width**: 63.4cm × (300/2.54) ≈ **7488 pixels**
   - **Height**: 23cm × (300/2.54) ≈ **2717 pixels**

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/PersonalizePreview.tsx` | Update aspect ratio from `37/21` to `634/230` |

