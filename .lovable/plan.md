

## Plan: Add Dedication Slide Preview and Fix Character Image Sizing

### Overview

This plan addresses two improvements to the book personalization system:

1. **Add a Dedication Slide** at the end of the book preview that shows the user's "From" and "Message" text overlaid on a decorative background
2. **Fix character image sizing** on the personalization page so both boy options display at equal sizes

---

### Part 1: Dedication Slide Preview

#### What It Does

After the ending pages, display a new "dedication" slide that:
- Uses the uploaded decorative frame image as the background (the image shows a whimsical border with compasses, keys, crystals, etc.)
- Overlays the "From" text on the **left half** of the spread
- Overlays the "Message" text on the **right half** of the spread
- Only appears if the user has entered at least one of these fields

#### Design Layout (matching your reference image)

```text
+---------------------------+---------------------------+
|                           |                           |
|    [decorative border]    |    [decorative border]    |
|                           |                           |
|       "Love, Mommy"       |   "May you always know    |
|       (From field)        |    how special you are"   |
|                           |    (Personal Message)     |
|                           |                           |
+---------------------------+---------------------------+
```

#### Technical Implementation

**Files to modify:**
- `src/pages/PersonalizePreview.tsx` - Add the dedication slide rendering

**Files to create:**
- Copy `user-uploads://FROM.jpg` to `src/assets/personalization/dedication-background.jpg`

**Changes to PersonalizePreview.tsx:**
1. Import the dedication background image
2. Add a "dedication" page type to the book builder (after ending pages)
3. Create a special render case for the dedication slide with text overlays:
   - Left side: Display the "From" field text centered
   - Right side: Display the "Personal Message" text centered
   - Both use a clean, readable font (Fredoka) with appropriate sizing
4. Only add the dedication page if `fromField` or `personalMessage` has content

---

### Part 2: Fix Character Image Sizing

#### The Problem

The character selection images have different native sizes:
- `whiteboy/whiteboy.png` - Larger image
- `Blackboy/BB.png` - Smaller image

This causes them to display at different sizes in the selection grid.

#### The Solution

Apply CSS styling to ensure both images display at a **consistent, fixed size**:
- Use `object-contain` to preserve aspect ratios
- Set a fixed height (e.g., `h-32` or `h-40`) for the image containers
- Center the images within their containers

**Files to modify:**
- `src/pages/PersonalizeBook.tsx` - Update the image styling in the character selection cards

**Styling changes:**
```text
Before: className="w-full h-auto rounded-lg"
After:  className="w-full h-32 object-contain rounded-lg"
```

This ensures all four character options (light boy, dark boy, light girl, dark girl) display at the same visual size regardless of their source image dimensions.

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/assets/personalization/dedication-background.jpg` | New file - copy from uploaded image |
| `src/pages/PersonalizePreview.tsx` | Add dedication slide with text overlays |
| `src/pages/PersonalizeBook.tsx` | Fix character image sizing with consistent height |

---

### Technical Details

**Dedication Slide Text Styling:**
- Font: Fredoka (matches book theme)
- Text color: Black/dark (readable on light background)
- Positioning: Absolute positioning within each half
- The left half shows "From" label + value, right half shows message
- Text wrapping for longer messages with max-width constraints

**PDF Generation Note:**
The `generate-book-pdf` edge function will also need to be updated to include the dedication page. This plan focuses on the preview UI only - the PDF update would be a separate task.

