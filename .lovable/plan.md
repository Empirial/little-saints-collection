

## Switch Preview to Use WebP Images from personalization Folder

### Summary

Update the preview to use WebP images from `src/assets/personalization/` instead of JPG images from `src/assets/personalizationjpg/`. This will improve performance as WebP files are 25-35% smaller than JPGs.

---

### What Needs to Change

Only one file needs modification:

| File | Change |
|------|--------|
| `src/utils/getLetterImage.ts` | Update the glob path and image path lookup |

---

### Current vs New Structure

**Current (personalizationjpg - JPG files):**
```
src/assets/personalizationjpg/
├── Blackboy/Superherotheme/1.jpg, 2.jpg, ... 26.jpg
├── Blackboy/Fairytaletheme/1.jpg, ... 26.jpg
├── Blackboy/Wildanimaltheme/1.jpg, ... 26.jpg
├── Blackgirl/...
├── whiteboy/...
└── whitegirl/...
```

**New (personalization - WebP files):**
```
src/assets/personalization/
├── Blackboy/Superherotheme/1.webp, 2.webp, ... 26.webp
├── Blackboy/Fairytaletheme/1.webp, ... 26.webp
├── Blackboy/Wildanimaltheme/1.webp, ... 26.webp
├── Blackgirl/...
├── whiteboy/...
└── whitegirl/...
```

---

### Code Changes

**File: `src/utils/getLetterImage.ts`**

```typescript
// BEFORE (line 2-4):
const images = import.meta.glob<{ default: string }>(
  '/src/assets/personalizationjpg/**/*.{webp,jpg}',
  { eager: true }
);

// AFTER:
const images = import.meta.glob<{ default: string }>(
  '/src/assets/personalization/**/*.{webp,jpg}',
  { eager: true }
);
```

```typescript
// BEFORE (line 53):
const path = `/src/assets/personalizationjpg/${characterFolder}/${themeFolder}/${letterNum}.${ext}`;

// AFTER:
const path = `/src/assets/personalization/${characterFolder}/${themeFolder}/${letterNum}.${ext}`;
```

---

### Benefits

| Benefit | Description |
|---------|-------------|
| Smaller file size | WebP is 25-35% smaller than JPG |
| Faster loading | Less data to download = faster preview |
| Better quality | WebP maintains quality at lower file sizes |
| Consistent format | Aligns with other WebP assets in the project |

---

### No Other Changes Required

The rest of the preview system (`PersonalizePreview.tsx`) doesn't need changes because:
- It already imports the `getLetterImage` function
- The function returns the image URL which works the same regardless of format
- Cover, Intro, and Ending pages still load from Supabase Storage (JPG) - this change only affects letter pages

