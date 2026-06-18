-- ============================================================
-- FarmDirect — Migration 003: Order Blockchain Metadata & RLS Fix
-- Adds blockchain transaction details to orders + fixes RLS
-- ============================================================

-- Add blockchain metadata columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS block_number BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS from_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS to_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gas_used TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS chain_id INTEGER;

-- Fix: Add INSERT policy for order_items (was missing, causing silent failures)
DO $$ BEGIN
  CREATE POLICY "Customers can insert order items" ON order_items FOR INSERT
    WITH CHECK (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
