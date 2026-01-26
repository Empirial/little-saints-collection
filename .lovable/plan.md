

# Plan: Add Crop Marks and Bleed to Production PDF

## Overview

This plan adds professional print-ready features to the book PDF generation system, including:
- **Bleed area** (typically 3mm/~8.5pt) extending beyond the trim line
- **Crop marks** (corner marks indicating where to cut)
- **Proper PDF box definitions** (MediaBox, TrimBox, BleedBox)

These changes will help the print production team accurately trim the book pages.

---

## Print Production Concepts

```text
┌─────────────────────────────────────────────┐
│                 Media Box                   │  ← Full PDF page (includes everything)
│   ┌─────────────────────────────────────┐   │
│ ─┼─                                   ─┼─   │  ← Crop marks (corner lines)
│   │           Bleed Box                 │   │
│   │   ┌─────────────────────────────┐   │   │
│   │   │                             │   │   │
│   │   │         Trim Box            │   │   │  ← Final page size after cutting
│   │   │      (Final Page)           │   │   │
│   │   │                             │   │   │
│   │   └─────────────────────────────┘   │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│ ─┼─                                   ─┼─   │
└─────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Define Print Constants

Add constants for standard bleed and crop mark measurements at the top of the edge function:

```typescript
// Print production measurements (in PDF points, 1mm ≈ 2.835pt)
const BLEED_MM = 3; // 3mm bleed is industry standard
const BLEED_PT = BLEED_MM * 2.835; // ~8.5 points
const CROP_MARK_LENGTH = 10; // Length of crop marks in points
const CROP_MARK_OFFSET = 3; // Gap between trim line and crop mark start
const CROP_MARK_THICKNESS = 0.5; // Line thickness
```

### Step 2: Create Helper Function for Crop Marks

Add a helper function that draws crop marks at all four corners of a page:

```typescript
import { rgb } from "https://esm.sh/pdf-lib@1.17.1";

function drawCropMarks(page: PDFPage, trimWidth: number, trimHeight: number, bleed: number) {
  const pageWidth = trimWidth + (bleed * 2);
  const pageHeight = trimHeight + (bleed * 2);
  
  const markColor = rgb(0, 0, 0); // Black registration marks
  
  // Corner positions (relative to trim box)
  const corners = [
    { x: bleed, y: bleed }, // Bottom-left
    { x: bleed + trimWidth, y: bleed }, // Bottom-right
    { x: bleed, y: bleed + trimHeight }, // Top-left
    { x: bleed + trimWidth, y: bleed + trimHeight }, // Top-right
  ];
  
  for (const corner of corners) {
    // Horizontal marks
    page.drawLine({
      start: { x: corner.x - CROP_MARK_OFFSET - CROP_MARK_LENGTH, y: corner.y },
      end: { x: corner.x - CROP_MARK_OFFSET, y: corner.y },
      thickness: CROP_MARK_THICKNESS,
      color: markColor,
    });
    page.drawLine({
      start: { x: corner.x + CROP_MARK_OFFSET, y: corner.y },
      end: { x: corner.x + CROP_MARK_OFFSET + CROP_MARK_LENGTH, y: corner.y },
      thickness: CROP_MARK_THICKNESS,
      color: markColor,
    });
    
    // Vertical marks
    page.drawLine({
      start: { x: corner.x, y: corner.y - CROP_MARK_OFFSET - CROP_MARK_LENGTH },
      end: { x: corner.x, y: corner.y - CROP_MARK_OFFSET },
      thickness: CROP_MARK_THICKNESS,
      color: markColor,
    });
    page.drawLine({
      start: { x: corner.x, y: corner.y + CROP_MARK_OFFSET },
      end: { x: corner.x, y: corner.y + CROP_MARK_OFFSET + CROP_MARK_LENGTH },
      thickness: CROP_MARK_THICKNESS,
      color: markColor,
    });
  }
}
```

### Step 3: Update `embedSpreadImage` Function

Modify the spread embedding function to:
1. Create pages with bleed area (MediaBox larger than content)
2. Set TrimBox and BleedBox properly
3. Position the image to account for bleed
4. Draw crop marks on each page

The key changes:
- Page size becomes: `[trimWidth + (BLEED_PT * 2), trimHeight + (BLEED_PT * 2)]`
- Image is drawn at position `(BLEED_PT, BLEED_PT)` instead of `(0, 0)`
- After drawing the image, call `drawCropMarks()`
- Set proper `setMediaBox`, `setBleedBox`, and `setTrimBox` values

### Step 4: Add PDF Box Definitions

For each page created, explicitly define the print boxes:

```typescript
// MediaBox = full page with bleed + crop mark area
page.setMediaBox(0, 0, fullPageWidth, fullPageHeight);

// BleedBox = content area including bleed
page.setBleedBox(
  CROP_MARK_OFFSET, 
  CROP_MARK_OFFSET, 
  fullPageWidth - (CROP_MARK_OFFSET * 2), 
  fullPageHeight - (CROP_MARK_OFFSET * 2)
);

// TrimBox = final cut size (what the customer receives)
page.setTrimBox(BLEED_PT, BLEED_PT, trimWidth, trimHeight);
```

---

## Files to Modify

**`supabase/functions/generate-book-pdf/index.ts`**
- Add `rgb` import from pdf-lib
- Add print production constants (BLEED_PT, CROP_MARK_LENGTH, etc.)
- Create `drawCropMarks()` helper function
- Update `embedSpreadImage()` to:
  - Create larger pages to accommodate bleed
  - Position images with bleed offset
  - Set MediaBox, BleedBox, TrimBox on each page
  - Draw crop marks at all four corners

---

## Technical Specifications

| Element | Size | Notes |
|---------|------|-------|
| Bleed | 3mm (~8.5pt) | Standard print bleed |
| Crop Mark Length | 10pt | Visible registration marks |
| Crop Mark Offset | 3pt | Gap from trim line |
| Line Thickness | 0.5pt | Thin, precise marks |

---

## Expected Output

The production PDF will include:
- Visual crop marks at each corner showing where to cut
- Proper PDF metadata (TrimBox, BleedBox) for professional print software
- Image content extending into the bleed area (if source images have bleed)
- Clean, print-ready output for the production team

---

## Considerations

1. **Source Image Bleed**: The current source images (JPGs from storage) may not include bleed artwork. The bleed area will show the edge pixels of the image extended. For optimal results, source artwork should be designed with 3mm bleed on all sides.

2. **File Size**: Adding bleed will slightly increase page dimensions and PDF file size (minimal impact).

3. **Backward Compatibility**: This change only affects the production PDF; the online preview remains unchanged.

