-- ============================================================
-- ARONA MOBILES — Supabase Storage & Products Schema
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Enable UUID & Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE / UPDATE OWNERS AUTH TABLE
CREATE TABLE IF NOT EXISTS public.owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  session_version INT NOT NULL DEFAULT 1,
  password_updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  last_login_device TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS session_version INT NOT NULL DEFAULT 1;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. CREATE / UPDATE OWNER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.owner_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  session_token_hash TEXT NOT NULL,
  device_id TEXT,
  device_name TEXT,
  browser TEXT,
  operating_system TEXT,
  device_type TEXT DEFAULT 'desktop',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_owner_sessions_owner ON public.owner_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_sessions_phone ON public.owner_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_owner_sessions_revoked ON public.owner_sessions(is_revoked);

ALTER TABLE public.owner_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow server access on owner_sessions" ON public.owner_sessions;
CREATE POLICY "Allow server access on owner_sessions"
  ON public.owner_sessions FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- 4. CREATE / UPDATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  ram TEXT,
  storage TEXT,
  color TEXT,
  slug TEXT,
  condition TEXT NOT NULL DEFAULT 'new', -- 'new' | 'pre-owned'
  grade TEXT,                           -- 'A' | 'B' | 'C' (for pre-owned)
  short_description TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount_price NUMERIC,
  stock INT DEFAULT 0,
  offer TEXT,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  specs JSONB DEFAULT '{}'::JSONB,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]'::JSONB,
  sku TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  flash_sale_ends_at TIMESTAMPTZ,
  average_rating NUMERIC(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 1,
  sold_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if table already existed
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ram TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storage TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS flash_sale_ends_at TIMESTAMPTZ;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS inspection_report JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 5.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 3. ENABLE REALTIME ON PRODUCTS TABLE
-- Allows instant live updates on storefront and dashboard when products are added/edited/deleted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (customers can view active products)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
ON public.products FOR SELECT
USING (true);

-- Allow insert/update/delete for dashboard & backend
DROP POLICY IF EXISTS "Allow insert on products" ON public.products;
CREATE POLICY "Allow insert on products"
ON public.products FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on products" ON public.products;
CREATE POLICY "Allow update on products"
ON public.products FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow delete on products" ON public.products;
CREATE POLICY "Allow delete on products"
ON public.products FOR DELETE
USING (true);

-- Owners table RLS policies
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on owners" ON public.owners;
CREATE POLICY "Service role full access on owners"
ON public.owners FOR ALL
USING (true)
WITH CHECK (true);

-- 5. STORAGE BUCKET: product-images (PUBLIC ACCESS)
-- Creates the public storage bucket for phone photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/avif'];

-- Storage Security Policies
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can upload product images" ON storage.objects;
CREATE POLICY "Public can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can update product images" ON storage.objects;
CREATE POLICY "Public can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can delete product images" ON storage.objects;
CREATE POLICY "Public can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
