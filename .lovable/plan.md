

## Plan: Delete All Existing Images from book-assets Storage Bucket

### Overview

Delete all existing images from the Supabase Storage `book-assets` bucket to prepare for uploading new 63.4cm × 23cm slides.

---

### What Will Be Deleted

All files in these folders within `book-assets`:

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

### Implementation

1. **Create an Edge Function** (`delete-bucket-files`) that:
   - Lists all files in the `book-assets` bucket
   - Deletes all files found
   - Returns a summary of deleted files

2. **Execute the deletion** by calling the Edge Function

---

### After Deletion

Once complete, you can upload new images using either:
- **Admin Upload Page**: `/admin/upload-assets` (with drag-and-drop)
- **Supabase Dashboard**: Direct access to storage bucket

---

### Technical Details

The Edge Function will use the Supabase Admin client with the service role key to:
1. List all files recursively in each character folder
2. Delete files in batches using `storage.from('book-assets').remove()`
3. Return confirmation of deleted files

