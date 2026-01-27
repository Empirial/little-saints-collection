
# Implementation Plan: 10mm Bleed, Crop Marks + PDF Merge

## Overview

This plan implements professional print-ready PDF generation with:
1. **10mm bleed** on all page edges for print tolerance
2. **Crop marks** at corners showing where to trim
3. **Streaming progressive merge** to create a single complete PDF
4. **Updated email** with single download link + batch fallback

---

## What Will Change

### Edge Function: `generate-book-pdf/index.ts`

| Addition | Purpose |
|----------|---------|
| Bleed constants | Define 10mm bleed in points (28.35pt) |
| `addBleedAndCropMarks()` | Add bleed area and draw trim marks on each page |
| `drawCropMark()` | Draw L-shaped marks at each corner |
| `mergeFromStorageUrls()` | Fetch batches from Storage and merge progressively |
| Updated `embedSpreadImage()` | Include bleed area when creating pages |
| Updated email template | Single merged PDF link with batch links as fallback |

---

## Technical Details

### 1. Bleed and Crop Mark Specifications

| Specification | Value | Points |
|---------------|-------|--------|
| Bleed width | 10mm | 28.35pt |
| Crop mark length | 10mm | 28.35pt |
| Crop mark offset from trim | 3mm | 8.5pt |
| Crop mark line thickness | 0.5pt | 0.5pt |
| Crop mark color | 100% Black | rgb(0,0,0) |

Visual representation:

```text
      |                         |
      |                         |
------+-------------------------+------  <- Crop marks
      |   +-----------------+   |
      |   |                 |   |
      |   |   TRIM AREA     |   |        <- Final page size
      |   |   (content)     |   |
      |   |                 |   |
      |   +-----------------+   |
------+-------------------------+------
      |                         |
      |         BLEED           |        <- Extra 10mm
```

### 2. PDF Box Definitions

Each page will have proper PDF metadata for professional printing:

- **MediaBox**: Total page size including bleed (content + 20mm width, content + 20mm height)
- **TrimBox**: Final printed size (where to cut)
- **BleedBox**: Area including bleed allowance

### 3. Streaming Progressive Merge Strategy

To avoid memory issues:

1. Generate each batch PDF with bleed/crop marks
2. Upload immediately to Storage (already working)
3. After all batches uploaded, fetch each from Storage URL one at a time
4. Copy pages to merged document, then release source
5. Save/reload the merged PDF every 10 pages to free internal buffers
6. Upload final merged PDF to `orders/{order}/complete-book.pdf`

### 4. New Function Flow

```text
Request with orderId
        |
        v
+---------------------------+
| Generate Batch PDFs       |
| - Add 10mm bleed          |
| - Draw crop marks         |
| - Set TrimBox/BleedBox    |
| - Upload to Storage       |
+---------------------------+
        |
        v
+---------------------------+
| Merge from Storage URLs   |
| - Fetch batch 1           |
| - Copy pages to merged    |
| - Fetch batch 2           |
| - Copy pages to merged    |
| - Save/reload every 10 pg |
| - Continue until done     |
+---------------------------+
        |
        v
+---------------------------+
| Upload complete-book.pdf  |
| Send email with:          |
| - Main: merged PDF link   |
| - Backup: batch links     |
+---------------------------+
```

### 5. Updated Email Template

The production team will receive:
- **Primary download**: Single complete PDF with all pages
- **Fallback section**: Individual batch links (collapsible)
- Clear labeling that PDFs include bleed and crop marks

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/generate-book-pdf/index.ts` | Add bleed/crop constants, new functions, update page creation, add merge logic, update email template |

---

## Memory Management

The approach manages Edge Function memory limits by:

1. **Immediate upload**: Each batch uploaded right after creation, freeing memory
2. **URL-based merge**: Fetches from Storage URLs instead of holding all data
3. **Periodic save/reload**: Every 10 pages, save PDF bytes and reload to release internal pdf-lib buffers
4. **Sequential processing**: Never more than 2 PDFs in memory simultaneously

---

## Cost

**Free** - Uses only pdf-lib which is already installed. No external services required.

---

## Expected Output

After implementation, each order will generate:

1. Individual batch PDFs (for fallback):
   - `orders/LS-000XXX/batch-1-cover-intro.pdf`
   - `orders/LS-000XXX/batch-2-letter-j.pdf`
   - etc.

2. Single merged PDF:
   - `orders/LS-000XXX/complete-book.pdf`

All PDFs will include:
- 10mm bleed on all edges
- L-shaped crop marks at corners
- Proper TrimBox/BleedBox metadata for professional printing
