
## Plan: Fix Preview Aspect Ratio and Add Dedication Page to PDF

### Overview

This plan addresses two issues:

1. **Fix preview aspect ratio** - Currently using wrong dimensions (37:21 instead of 634:230)
2. **Add dedication page to PDF** - Include the dedication spread with text overlays in the generated PDF

---

### Part 1: Fix Preview Slide Dimensions

#### The Problem

The preview slides are using `aspect-[37/21]` (1.76:1 ratio) but the actual book spreads are **63.4cm wide by 23cm high**, which is a 2.76:1 ratio.

#### The Fix

Update `src/pages/PersonalizePreview.tsx` to use the correct aspect ratio:

```text
Before: aspect-[37/21]
After:  aspect-[634/230]
```

**Files to modify:**
- `src/pages/PersonalizePreview.tsx` - Change aspect ratio in two places:
  - Line 153 (dedication slide container)
  - Line 215 (book page container in renderPage function)

---

### Part 2: Add Dedication Page to PDF Generation

#### What It Does

After the ending pages, add a dedication spread that:
- Uses the same dedication background image (needs to be uploaded to Supabase Storage)
- Draws the "From" text on the left half of the spread
- Draws the "Personal Message" text on the right half of the spread
- Only added if the user has entered content in either field

#### Technical Implementation

**File to modify:**
- `supabase/functions/generate-book-pdf/index.ts`

**Changes:**

1. **Upload dedication background** - The `dedication-background.jpg` needs to be uploaded to Supabase Storage in a shared location (e.g., `book-assets/Shared/dedication.jpg`)

2. **Add font embedding** - Use pdf-lib's standard fonts or embed a custom font for text rendering

3. **Create dedication page logic** - After ending pages, if `fromField` or `personalMessage` exists:
   - Fetch the dedication background image
   - Create a spread-sized page (63.4cm x 23cm)
   - Draw text overlays:
     - Left half: "From" text centered
     - Right half: Personal message centered
   - Split into two pages like other spreads

4. **Text styling**:
   - Font: Helvetica (standard PDF font, clean and readable)
   - Size: Auto-scaled based on text length
   - Color: Dark gray/black
   - Positioning: Centered in each half

#### PDF Structure After Update

```text
1. Cover spread (split into 2 pages)
2. Intro 1 spread (split into 2 pages)
3. Intro 2 spread (split into 2 pages)
4. Letter pages (split into 2 pages each)
5. Ending 1 spread (split into 2 pages)
6. Ending 2 spread (split into 2 pages)
7. Dedication spread (split into 2 pages) ← NEW
```

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/pages/PersonalizePreview.tsx` | Fix aspect ratio from `37/21` to `634/230` (2 locations) |
| `supabase/functions/generate-book-pdf/index.ts` | Add dedication page with text overlay logic |
| Supabase Storage | Upload `dedication.jpg` to `book-assets/Shared/` |

---

### Technical Details for PDF Text Overlay

```typescript
// Dedication page generation pseudocode
if (bookData.fromField || bookData.personalMessage) {
  // Fetch dedication background
  const dedicationUrl = `${STORAGE_URL}/Shared/dedication.jpg`;
  const dedicationImage = await fetchAndEmbed(dedicationUrl);
  
  // Create two pages from the spread
  const { width, height } = dedicationImage.scale(1);
  const halfWidth = width / 2;
  
  // Left page with "From" text
  const leftPage = pdfDoc.addPage([halfWidth, height]);
  leftPage.drawImage(dedicationImage, { x: 0, y: 0, width, height });
  if (bookData.fromField) {
    leftPage.drawText(bookData.fromField, {
      x: halfWidth / 2,
      y: height / 2,
      size: 36,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2)
    });
  }
  
  // Right page with personal message
  const rightPage = pdfDoc.addPage([halfWidth, height]);
  rightPage.drawImage(dedicationImage, { x: -halfWidth, y: 0, width, height });
  if (bookData.personalMessage) {
    // Draw wrapped text centered on right half
    drawCenteredText(rightPage, bookData.personalMessage, ...);
  }
}
```

---

### Pre-requisite Action Required

Before implementing the PDF changes, you need to **upload the dedication background image** to Supabase Storage:

1. Go to: [Supabase Storage - book-assets bucket](https://supabase.com/dashboard/project/udaudwkblphataokaexq/storage/buckets/book-assets)
2. Create a folder called `Shared`
3. Upload `dedication-background.jpg` as `dedication.jpg`

This ensures the Edge Function can access the same background image used in the preview.
