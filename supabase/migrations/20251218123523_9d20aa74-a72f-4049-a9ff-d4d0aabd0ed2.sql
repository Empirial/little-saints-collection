-- Fix the search_path security issue
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'LS-' || LPAD(nextval('public.order_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;