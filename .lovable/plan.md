

## Plan: Fix PDF Memory Issue + Clean Up Storage Bucket

### Overview

This plan addresses three issues:
1. **Fix PDF merge step memory overflow** - The merge process still exceeds memory limits
2. **Create Shared folder and upload dedication background** - Required for dedication page
3. **Delete orphaned storage files** - Clean up useless folders

---

### Part 1: Fix PDF Merge Memory Issue

#### The Problem

The batched approach works for generation, but the merge step loads all batch PDFs simultaneously, causing memory overflow. The logs show:
```
Merging 4 batches into final PDF...
Memory limit exceeded
```

#### The Solution: Incremental Merge + Email Without Attachment

Since the 300dpi images are too large for Edge Function memory limits, we need a different approach:

**Option A: Progressive Merge (One batch at a time)**
- Merge batches incrementally instead of all at once
- After adding each batch, save and reload to free memory
- Higher chance of success but still risky with large images

**Option B: Skip PDF Attachment, Send Image Links Instead** (Recommended for now)
- Generate PDF batches
- Upload each batch PDF to Supabase Storage
- Email production team with download links instead of attachment
- Production team downloads PDFs as needed

**Option C: Use External PDF Service**
- Send images to a dedicated PDF generation service (like PDFShift, APITemplate.io)
- Offload heavy processing to a service designed for large documents

#### Recommended Implementation (Option B)

```typescript
// Instead of merging + attaching, upload batches to storage
for (let i = 0; i < allBatches.length; i++) {
  const filename = `orders/${order.order_number}/batch-${i}.pdf`;
  await supabase.storage
    .from('book-assets')
    .upload(filename, allBatches[i], {
      contentType: 'application/pdf'
    });
}

// Email with links instead of attachment
const downloadLinks = allBatches.map((_, i) => 
  `${STORAGE_URL}/orders/${order.order_number}/batch-${i}.pdf`
);

// Email body includes download links
```

This bypasses the memory-intensive merge step entirely.

---

### Part 2: Create Shared Folder for Dedication

#### Action Required

Create a SQL migration to add the dedication background to storage. Since the asset exists locally at `src/assets/personalization/dedication-background.jpg`, you'll need to:

1. **Manual upload approach**: 
   - Go to [Supabase Storage](https://supabase.com/dashboard/project/udaudwkblphataokaexq/storage/buckets/book-assets)
   - Create folder: `Shared`
   - Upload: `dedication-background.jpg` renamed to `dedication.jpg`

OR

2. **Programmatic approach**: Use the existing `delete-bucket-files` Edge Function pattern to create an upload function

---

### Part 3: Delete Orphaned Storage Files

#### Files to Remove

| Path | Reason |
|------|--------|
| `Fairytale/.emptyFolderPlaceholder` | Empty placeholder, unused |
| `Whiteboy/.emptyFolderPlaceholder` | Empty placeholder, unused |
| `WildanimalthemeWB/1.jpg` | Orphaned - wrong folder structure |
| `WildanimalthemeWB/6.jpg` - `WildanimalthemeWB/20.jpg` | 15 more orphaned files |

**Total: 18 files to delete**

#### Implementation

Use the existing `delete-bucket-files` Edge Function or SQL to clean up:

```sql
DELETE FROM storage.objects 
WHERE bucket_id = 'book-assets' 
AND (
  name LIKE 'Fairytale/.emptyFolderPlaceholder' 
  OR name LIKE 'Whiteboy/.emptyFolderPlaceholder'
  OR name LIKE 'WildanimalthemeWB/%'
);
```

---

### Summary of Changes

| Component | Change | Priority |
|-----------|--------|----------|
| `supabase/functions/generate-book-pdf/index.ts` | Upload batch PDFs to storage + email links instead of attachment | Critical |
| Supabase Storage | Create `Shared/dedication.jpg` | High |
| Supabase Storage | Delete 18 orphaned files | Medium |
| SQL Migration | Clean up orphaned storage objects | Medium |

---

### Technical Implementation Details

#### Modified Edge Function Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Generate Batches                         │
│  (Same as before - Cover, Letters, Ending, Dedication)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Upload Each Batch to Storage                 │
│  - Upload to: orders/{order_number}/batch-1.pdf             │
│  - Upload to: orders/{order_number}/batch-2.pdf             │
│  - etc.                                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Email with Download Links                      │
│  - Include links to all batch PDFs                          │
│  - Production team downloads and prints                     │
│  - Optional: Include instructions for page ordering         │
└─────────────────────────────────────────────────────────────┘
```

#### Email Template Update

```html
<h2>Download Book PDF Files</h2>
<ul>
  <li><a href="...">Part 1: Cover & Intro (6 pages)</a></li>
  <li><a href="...">Part 2: Letters J-A-K (6 pages)</a></li>
  <li><a href="...">Part 3: Letter E (2 pages)</a></li>
  <li><a href="...">Part 4: Ending (4 pages)</a></li>
</ul>
<p>Print all parts in order listed above.</p>
```

---

### Alternative: Progressive Merge Approach

If the production team absolutely needs a single PDF file:

```typescript
// Progressive merge - merge one batch at a time
let accumulatedPdf = await PDFDocument.load(allBatches[0]);

for (let i = 1; i < allBatches.length; i++) {
  const nextBatch = await PDFDocument.load(allBatches[i]);
  const pages = await accumulatedPdf.copyPages(
    nextBatch, 
    nextBatch.getPageIndices()
  );
  pages.forEach(page => accumulatedPdf.addPage(page));
  
  // Save and reload to free memory
  const tempBytes = await accumulatedPdf.save();
  accumulatedPdf = await PDFDocument.load(tempBytes);
}

const finalBytes = await accumulatedPdf.save();
```

This saves and reloads after each merge to release memory, but may still hit limits with very large images.

