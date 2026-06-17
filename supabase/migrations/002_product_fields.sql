-- ============================================================
-- FarmDirect — Migration 002: Agricultural Product Fields
-- Adds agriculture-specific attributes to products table
-- ============================================================

-- Unit of measurement (kg, g, litre, piece, dozen, etc.)
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';

-- Quality grading (Premium, Grade A, Grade B, Standard, Organic Certified)
ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_grade TEXT DEFAULT 'Standard';

-- Origin / farming location (village, district, state)
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_location TEXT;

-- Harvest date
ALTER TABLE products ADD COLUMN IF NOT EXISTS harvest_date DATE;

-- Expiration / best-before date
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Farming method (organic, conventional, hydroponic, natural, biodynamic)
ALTER TABLE products ADD COLUMN IF NOT EXISTS farming_method TEXT DEFAULT 'conventional';

-- Certifications array (FSSAI, India Organic, APEDA, ISO 22000, Fair Trade)
ALTER TABLE products ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';

-- Minimum order quantity
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_qty INTEGER DEFAULT 1;

-- Net weight / volume value
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_value NUMERIC(10,2);

-- Net weight / volume unit (g, kg, ml, L)
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg';
