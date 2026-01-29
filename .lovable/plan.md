

# Fix: PersonalizePreview Page Crash - Missing Import

## Problem Identified

The **PersonalizePreview page** (`/personalize-preview`) is crashing due to a **missing import**. The component uses the `ShoppingCart` icon from lucide-react on line 433, but it was never imported.

**Error:** `ReferenceError: ShoppingCart is not defined`

This causes the entire page to fail to render, showing a blank screen or error.

---

## Root Cause

**File:** `src/pages/PersonalizePreview.tsx`

**Line 8 (current):**
```typescript
import { ArrowLeft, ArrowRight, PenSquare, ImageOff, MessageSquare } from "lucide-react";
```

**Line 433 (usage):**
```tsx
<ShoppingCart className="w-4 h-4 ml-2" />
```

The `ShoppingCart` icon is used in the "Add to Cart" button but was not added to the import statement.

---

## Solution

Add `ShoppingCart` to the lucide-react import on line 8.

**Updated import:**
```typescript
import { ArrowLeft, ArrowRight, PenSquare, ImageOff, MessageSquare, ShoppingCart } from "lucide-react";
```

---

## File Changes

| File | Change |
|------|--------|
| `src/pages/PersonalizePreview.tsx` | Add `ShoppingCart` to lucide-react import (line 8) |

---

## Expected Outcome

After this fix:
- The PersonalizePreview page will load correctly
- The "Add to Cart" button will display the shopping cart icon
- The full personalization flow (personalize -> preview -> checkout) will work end-to-end

