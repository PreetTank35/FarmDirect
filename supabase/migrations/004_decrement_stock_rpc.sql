-- ============================================================
-- FarmDirect — Migration 004: Decrement Stock RPC
-- Allows customers to safely decrement stock after a purchase
-- without granting them full UPDATE access to the products table.
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_product_stock(p_id UUID, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges so it bypasses RLS
AS $$
BEGIN
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity to decrement must be greater than zero';
  END IF;

  -- Decrement the stock, ensuring it doesn't go below 0
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_id;
END;
$$;
