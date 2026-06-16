-- ============================================================
-- FarmDirect — Supabase Database Migration
-- Run this in your Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- For full-text fuzzy search
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Uncomment for pgvector (AI embeddings)

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'paid', 'processing', 'shipped',
    'delivered', 'disputed', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('order', 'review', 'system', 'promo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE business_type AS ENUM ('farmer', 'manufacturer', 'artisan', 'cooperative');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                TEXT,
  avatar_url               TEXT,
  role                     user_role NOT NULL DEFAULT 'customer',
  phone                    TEXT,
  address                  JSONB,
  custodial_wallet_address TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile and vendor profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role);

  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    v_role
  );

  IF v_role = 'vendor'::user_role THEN
    INSERT INTO vendor_profiles (user_id, business_name, business_type)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name', 'My Business'),
      COALESCE((NEW.raw_user_meta_data->>'business_type')::business_type, 'farmer'::business_type)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- VENDOR PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name        TEXT NOT NULL,
  business_type        business_type NOT NULL DEFAULT 'farmer',
  description          TEXT,
  logo_url             TEXT,
  location             TEXT,
  certifications       JSONB DEFAULT '[]',
  rating_avg           NUMERIC(3,2) DEFAULT 0,
  total_sales          INTEGER DEFAULT 0,
  verified             BOOLEAN DEFAULT false,
  ipfs_verification_cid TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  parent_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon_url   TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Fresh Produce', 'fresh-produce', 1),
  ('Dairy & Eggs', 'dairy-eggs', 2),
  ('Grains & Pulses', 'grains-pulses', 3),
  ('Spices & Herbs', 'spices-herbs', 4),
  ('Honey & Preserves', 'honey-preserves', 5),
  ('Handcrafted', 'handcrafted', 6),
  ('Organic', 'organic', 7),
  ('Seasonal', 'seasonal', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id             UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  category_id           UUID REFERENCES categories(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  description           TEXT,
  ai_generated_description TEXT,
  variations            JSONB DEFAULT '[]',
  price                 NUMERIC(12,2) NOT NULL,
  ai_suggested_price    NUMERIC(12,2),
  currency              TEXT NOT NULL DEFAULT 'INR',
  stock_quantity        INTEGER NOT NULL DEFAULT 0,
  image_urls            TEXT[] DEFAULT '{}',
  ipfs_origin_cid       TEXT,
  origin_metadata       JSONB DEFAULT '{}',
  qr_code_data          TEXT,
  is_active             BOOLEAN DEFAULT true,
  rating_avg            NUMERIC(3,2) DEFAULT 0,
  review_count          INTEGER DEFAULT 0,
  search_vector         TSVECTOR,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS products_vendor_idx ON products(vendor_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_active_idx ON products(is_active);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('english', coalesce(NEW.title, '')) ||
    to_tsvector('english', coalesce(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_product_search_vector();

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity           INTEGER NOT NULL DEFAULT 1,
  selected_variation JSONB DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id             UUID NOT NULL REFERENCES profiles(id),
  vendor_id               UUID NOT NULL REFERENCES vendor_profiles(id),
  order_number            TEXT NOT NULL UNIQUE DEFAULT 'FD-' || floor(random() * 9000000 + 1000000)::TEXT,
  status                  order_status NOT NULL DEFAULT 'pending',
  subtotal                NUMERIC(12,2) NOT NULL,
  platform_fee            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total                   NUMERIC(12,2) NOT NULL,
  shipping_address        JSONB NOT NULL,
  tracking_number         TEXT,
  blockchain_tx_hash      TEXT,
  escrow_contract_address TEXT,
  estimated_delivery      TIMESTAMPTZ,
  delivered_at            TIMESTAMPTZ,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_vendor_idx ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES products(id),
  quantity           INTEGER NOT NULL,
  unit_price         NUMERIC(12,2) NOT NULL,
  selected_variation JSONB DEFAULT '{}'
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES profiles(id),
  order_id          UUID REFERENCES orders(id),
  rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT,
  image_urls        TEXT[] DEFAULT '{}',
  ipfs_review_cid   TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, customer_id, order_id)
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id);

-- Auto-update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id),
    updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_update_product_rating ON reviews;
CREATE TRIGGER reviews_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE PROCEDURE update_product_rating();

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT,
  type       notification_type NOT NULL DEFAULT 'system',
  read       BOOLEAN DEFAULT false,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, read);

-- ============================================================
-- CHAT MESSAGES (AI Chatbot history)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages(user_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- VENDOR PROFILES
CREATE POLICY "Anyone can view vendor profiles" ON vendor_profiles FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own profile" ON vendor_profiles FOR ALL USING (auth.uid() = user_id);

-- PRODUCTS
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can manage own products" ON products FOR ALL
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

-- CART ITEMS
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = customer_id);

-- ORDERS
CREATE POLICY "Customers see own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Vendors see their orders" ON orders FOR SELECT
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Customers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Vendors can update order status" ON orders FOR UPDATE
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

-- ORDER ITEMS
CREATE POLICY "Order items visible to involved parties" ON order_items FOR SELECT
  USING (order_id IN (
    SELECT id FROM orders WHERE customer_id = auth.uid()
    UNION
    SELECT o.id FROM orders o
    JOIN vendor_profiles vp ON vp.id = o.vendor_id
    WHERE vp.user_id = auth.uid()
  ));

-- REVIEWS
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = customer_id);

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- CHAT MESSAGES
CREATE POLICY "Users see own chat history" ON chat_messages FOR ALL USING (auth.uid() = user_id);

-- Categories are public
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (true);
