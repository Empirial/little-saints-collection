
# Plan: Fix Book PDF Generation Memory Issue to Enable Email Delivery

## Problem Analysis

The `generate-book-pdf` Edge Function is crashing with **"Memory limit exceeded"** during the PDF merge step, which prevents the email from ever being sent.

**Current Flow:**
```text
1. Generate batch PDFs (Cover+Intro, Letters, Ending, Dedication) ✅ Works
2. Upload each batch to Supabase Storage ✅ Works  
3. Merge all batches into single complete-book.pdf ❌ CRASHES at ~20 pages
4. Send email via Brevo API ❌ Never reached
```

The logs show the function successfully uploads all 8 batches (22 pages total), but crashes during the merge step when processing batch 7/8 after saving and reloading at 20 pages.

---

## Solution: Skip Merge, Send Email with Batch Links

The most reliable fix is to **skip the memory-intensive merge step** and send the email immediately after batch generation. The batch PDFs are already uploaded and can be used directly.

### Key Changes

1. **Make the merge step optional/skippable** - Wrap it in a try-catch that doesn't block email sending
2. **Send email regardless of merge success** - Move email sending before the merge step OR make merge failure non-fatal
3. **Use batch links as primary download** - Since the complete-book.pdf merge keeps failing, present batch links as the primary option

---

## Implementation Details

### File: `supabase/functions/generate-book-pdf/index.ts`

**Option A: Move email BEFORE merge (Recommended)**

Restructure the flow so email is sent immediately after batches are uploaded:

```text
Current Flow:
  Generate batches → Upload batches → Merge → Send email

New Flow:
  Generate batches → Upload batches → Send email → Try merge (optional)
```

This ensures the production team always receives the email with batch download links, even if merge fails.

**Option B: Make merge non-fatal**

Keep the current order but catch merge errors gracefully and still send the email:

```typescript
// At line 681, wrap merge in try-catch
let completeBookUrl = '';
try {
  const mergeResult = await mergeFromStorageUrls(supabase, order.order_number, batchUrls);
  if (mergeResult) {
    completeBookUrl = mergeResult.url;
    console.log(`Complete book merged successfully: ${completeBookUrl}`);
  }
} catch (mergeError) {
  console.warn("Merge failed, will send email with batch links only:", mergeError);
  // Continue to email sending - merge is optional
}

// Email sending continues regardless of merge success
```

### Recommended Approach: Option A

Moving the email before the merge is the cleanest solution because:
- Email is always sent with batch links
- If merge succeeds, that's a bonus (but not blocking)
- Production team can use batch PDFs immediately
- No waiting for a potentially crashing merge step

---

## Code Changes

### Step 1: Restructure to send email before merge

Move lines 699-786 (email sending) to right after line 676 (after all batches are uploaded), before the merge step (line 678).

### Step 2: Add merge result retroactively

After merge completes (if successful), optionally send a follow-up notification or update the order record with the complete-book URL.

### Step 3: Update email template

Modify the email HTML to:
- Present batch links as the primary download option
- Add a note that a complete merged PDF may be available separately

---

## Alternative: Completely Remove Merge Step

Given the consistent memory issues, consider removing the merge functionality entirely:

```text
Pros:
- Guaranteed delivery every time
- Simpler code, less failure points
- Edge functions have limited memory (150MB)

Cons:
- Production team gets 8 separate PDFs instead of 1
- Minor inconvenience for printing workflow
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-book-pdf/index.ts` | Move email sending before merge step; make merge optional/non-blocking |

---

## Expected Outcome

After this fix:
- Production team receives email immediately after batch PDFs are generated
- Email contains download links for all batch PDFs
- Merge step runs optionally (if it succeeds, great; if not, no impact on delivery)
- No more silent failures where orders are placed but no email is sent
