
# UI Update: Preview Page Buttons & Empty Cart Navigation

## Overview

Two changes requested:
1. **PersonalizePreview page**: Remove the "Checkout" button, keeping only 3 buttons: Dedication, Message, and Add to Cart
2. **Cart page**: Change the empty cart button from "Browse Posters" (navigates to `/product`) to navigate to the home page (`/`) instead

---

## File Changes

### 1. src/pages/PersonalizePreview.tsx

**Remove the Checkout button** (lines 436-443)

Current bottom action bar has 4 buttons:
- Dedication
- Message  
- Add to Cart
- Checkout ← **Remove this**

After the change, only 3 buttons will remain in the action bar.

---

### 2. src/pages/Cart.tsx

**Update empty cart button navigation** (line 63)

| Current | Updated |
|---------|---------|
| `navigate("/product")` | `navigate("/")` |
| "Browse Posters" | "Return Home" (or similar text) |

The button will now navigate users back to the homepage when their cart is empty.

---

## Summary

| File | Change |
|------|--------|
| `src/pages/PersonalizePreview.tsx` | Remove Checkout button (lines 436-443) |
| `src/pages/Cart.tsx` | Change empty cart button to navigate to "/" with updated text |

