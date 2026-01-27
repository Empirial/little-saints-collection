
## Plan: Add 10mm Bleed, Crop Marks + Merge PDF Using pdf-lib

### Overview

This plan implements a complete solution using **pdf-lib only** (no external service required - keeping it free). We'll:
1. Add 10mm bleed and visual crop marks to each batch PDF
2. Use a **streaming progressive merge** approach that processes one batch at a time from Storage URLs
3. Upload the final merged PDF to Storage and email the download link

---

### Why No External Service Needed

After research, external PDF services have these limitations:
- **PDF.co**: 10,000 free credits, then $8.99/month minimum
- **CloudConvert**: 25 free credits/day, then paid
- **Gotenberg**: Free but requires self-hosted Docker infrastructure

Since the batches are already uploaded to Supabase Storage, we can **merge them from URLs** instead of holding all data in memory - this is essentially the same streaming approach external services would use.

---

### Part 1: Add 10mm Bleed and Crop Marks

**What bleed and crop marks do:**
- **Bleed**: Extra 10mm around each page edge for professional printing trim tolerance
- **Crop marks**: Visual guides showing where to cut the paper

**Implementation approach:**
Each page gets resized with additional bleed area, and crop marks are drawn at corners.

```typescript
const BLEED_MM = 10;
const BLEED_PT = BLEED_MM * 2.83465; // Convert mm to points (28.35pt)
const MARK_LENGTH = 28.35; // 10pt marks
const MARK_OFFSET = 8.5;   // 3mm offset from edge

function addBleedAndCropMarks(page: PDFPage, originalWidth: number, originalHeight: number) {
  // Set boxes: MediaBox includes bleed, TrimBox is final size
  const trimBox = { x: BLEED_PT, y: BLEED_PT, width: originalWidth, height: originalHeight };
  const mediaBox = { x: 0, y: 0, width: originalWidth + 2*BLEED_PT, height: originalHeight + 2*BLEED_PT };
  
  page.setMediaBox(mediaBox.x, mediaBox.y, mediaBox.width, mediaBox.height);
  page.setTrimBox(trimBox.x, trimBox.y, trimBox.width, trimBox.height);
  page.setBleedBox(0, 0, mediaBox.width, mediaBox.height);
  
  // Draw crop marks at each corner
  drawCropMarks(page, trimBox, MARK_LENGTH, MARK_OFFSET);
}
```

---

### Part 2: Streaming Progressive Merge

**Key insight:** Instead of loading all PDFs into memory, we:
1. Generate and upload each batch immediately (already doing this)
2. After all batches uploaded, fetch each PDF from Storage URL one at a time
3. Copy pages to merged document, then discard the source
4. Save and reload periodically to release memory

```typescript
async function mergeFromStorageUrls(
  supabase: any,
  orderNumber: string,
  batchUrls: string[]
): Promise<Uint8Array> {
  let mergedPdf = await PDFDocument.create();
  
  for (const url of batchUrls) {
    console.log(`Fetching batch for merge: ${url}`);
    const response = await fetch(url);
    const batchBytes = await response.arrayBuffer();
    
    const batchPdf = await PDFDocument.load(batchBytes);
    const pages = await mergedPdf.copyPages(batchPdf, batchPdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
    
    // Periodically save/reload to release memory
    if (mergedPdf.getPageCount() % 10 === 0) {
      const tempBytes = await mergedPdf.save();
      mergedPdf = await PDFDocument.load(tempBytes);
    }
  }
  
  return await mergedPdf.save();
}
```

---

### Part 3: Updated Edge Function Flow

```text
┌─────────────────────────────────────────────────────────────┐
│           Generate Batches with Bleed + Crop Marks          │
│  - Add 10mm bleed to each page                              │
│  - Draw crop marks at trim boundaries                       │
│  - Set TrimBox/BleedBox/MediaBox metadata                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Upload Each Batch to Storage                   │
│  (Same as current - immediate upload)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            Streaming Progressive Merge                      │
│  - Fetch each batch PDF from Storage URL                    │
│  - Copy pages to merged doc, discard source                 │
│  - Save/reload every 10 pages to free memory                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Upload Merged PDF + Email Single Link               │
│  - Upload to: orders/{order_number}/complete-book.pdf       │
│  - Email with single download link                          │
│  - Keep batch links as backup option                        │
└─────────────────────────────────────────────────────────────┘
```

---

### Technical Changes

**File: `supabase/functions/generate-book-pdf/index.ts`**

| Change | Description |
|--------|-------------|
| Add bleed constants | `BLEED_MM = 10`, convert to points |
| Add `addBleedAndCropMarks()` | Function to resize page and draw trim marks |
| Modify `embedSpreadImage()` | Include bleed area when splitting spreads |
| Add `drawCropMarks()` | Draw L-shaped marks at all 4 corners |
| Add `mergeFromStorageUrls()` | Streaming merge from uploaded batches |
| Update email template | Include single merged PDF link + batch links as fallback |

---

### Bleed and Crop Mark Specifications

| Spec | Value | Points |
|------|-------|--------|
| Bleed width | 10mm | 28.35pt |
| Crop mark length | 10mm | 28.35pt |
| Crop mark offset | 3mm | 8.5pt |
| Crop mark thickness | 0.5pt | 0.5pt |
| Crop mark color | 100% Black | rgb(0,0,0) |

**Visual representation:**
```text
   ┃                        ┃
   ┃                        ┃
═══╋════════════════════════╋═══  ← Crop marks
   ┃     ┌──────────────┐   ┃
   ┃     │              │   ┃
   ┃     │  TRIM AREA   │   ┃     ← Final page size
   ┃     │   (content)  │   ┃
   ┃     │              │   ┃
   ┃     └──────────────┘   ┃
═══╋════════════════════════╋═══
   ┃                        ┃
   ┃         BLEED          ┃     ← Extra 10mm on all sides
```

---

### Email Template Update

```html
<div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
  <h2>📥 Download Complete Book</h2>
  <p><a href="[MERGED_PDF_URL]" style="font-size: 18px; font-weight: bold;">
    Download Full PDF (all pages, print-ready with bleed & crop marks)
  </a></p>
  
  <details style="margin-top: 15px;">
    <summary style="cursor: pointer; color: #666;">
      Individual parts (backup)
    </summary>
    <ol>
      <li>Part 1: Cover-Intro (6 pages)</li>
      <li>Part 2: Letter J (2 pages)</li>
      <!-- etc -->
    </ol>
  </details>
</div>
```

---

### Memory Management Strategy

The streaming approach manages memory by:

1. **Immediate upload**: Each batch is uploaded right after creation, freeing its memory
2. **URL-based merge**: Fetches from Storage URLs instead of holding all data
3. **Periodic save/reload**: Every 10 pages, save PDF and reload to release internal buffers
4. **Sequential processing**: Never hold more than 2 PDFs in memory at once

---

### Summary

| Component | Change |
|-----------|--------|
| `generate-book-pdf/index.ts` | Add bleed/crop marks + streaming merge function |
| PDF pages | 10mm bleed on all edges, L-shaped crop marks |
| PDF boxes | TrimBox, BleedBox, MediaBox properly set |
| Email | Single merged PDF link + individual batch fallback |
| Cost | **Free** - uses only pdf-lib (already installed) |
