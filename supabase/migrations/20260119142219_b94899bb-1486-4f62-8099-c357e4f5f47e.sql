-- Add order_type column to distinguish poster vs book orders
ALTER TABLE orders ADD COLUMN order_type text NOT NULL DEFAULT 'poster';

-- Add book-specific fields (JSONB for flexibility)
ALTER TABLE orders ADD COLUMN book_data jsonb;