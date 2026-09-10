-- ============================================================
-- ARONA MOBILES — Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (customers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Addresses stored as JSONB array on user
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::JSONB;

-- ============================================================
-- OWNERS (admin)
-- ============================================================
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

ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow server access on owners" ON public.owners;
CREATE POLICY "Allow server access on owners"
  ON public.owners FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- OTP CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_owner ON public.otp_codes(owner_id);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  ram TEXT,
  storage TEXT,
  color TEXT,
  slug TEXT NOT NULL UNIQUE,
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'pre-owned')),
  grade TEXT CHECK (grade IN ('A', 'B', 'C')),          -- for pre-owned
  short_description TEXT,
  description TEXT,
  specs JSONB DEFAULT '{}'::JSONB,                       -- {ram, storage, battery, camera, ...}
  variants JSONB DEFAULT '[]'::JSONB,                    -- [{color, storage, price, stock, images[]}]
  image_url TEXT,
  images TEXT[] DEFAULT '{}',                            -- primary images
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  discount_price NUMERIC(10,2),
  stock INT NOT NULL DEFAULT 0,
  offer TEXT,
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  sku TEXT UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  flash_sale_ends_at TIMESTAMPTZ,
  inspection_report JSONB DEFAULT '{}'::JSONB,           -- for pre-owned
  tags TEXT[] DEFAULT '{}',
  average_rating NUMERIC(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 1,
  sold_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if table already exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ram TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storage TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- ============================================================
-- STORE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'ARONA MOBILES',
  tagline TEXT DEFAULT 'Your Trusted Mobile Phone Store',
  phone_primary TEXT NOT NULL DEFAULT '+91 97870 61617',
  phone_primary_raw TEXT NOT NULL DEFAULT '+919787061617',
  phone_secondary TEXT NOT NULL DEFAULT '+91 96594 58606',
  phone_secondary_raw TEXT NOT NULL DEFAULT '+919659458606',
  whatsapp_number TEXT NOT NULL DEFAULT '919787061617',
  whatsapp_display TEXT NOT NULL DEFAULT '+91 97870 61617',
  authorized_owner_phones TEXT[] DEFAULT ARRAY['9787061617', '9659458606', '9994235672'],
  email TEXT DEFAULT 'contact@aronamobiles.com',
  address_line1 TEXT DEFAULT 'ARONA MOBILES, Opp. Town Hall',
  address_line2 TEXT DEFAULT 'Main Commercial Road',
  city TEXT DEFAULT 'Bangalore',
  state TEXT DEFAULT 'Karnataka',
  pincode TEXT DEFAULT '560001',
  landmark TEXT DEFAULT 'Opposite Town Hall, near Central Junction',
  hours_weekdays TEXT DEFAULT 'Mon–Sat: 10:00 AM – 8:30 PM',
  hours_sunday TEXT DEFAULT 'Sunday: 11:00 AM – 6:00 PM',
  google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac',
  announcement_bar TEXT DEFAULT '🎉 Big Exchange Offers & Same-Day In-Store Pickup Available!',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,              -- [{product_id, model, image, price, qty, variant}]
  status TEXT NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','return_requested','returned')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method TEXT CHECK (payment_method IN ('cod','upi','card','emi','wallet')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  address JSONB NOT NULL,                                -- snapshot of delivery address
  coupon_code TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  tracking_history JSONB DEFAULT '[]'::JSONB,           -- [{status, timestamp, note}]
  estimated_delivery DATE,
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ============================================================
-- TRADE-IN REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trade_in_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  device_info JSONB NOT NULL DEFAULT '{}'::JSONB,        -- {brand, model, storage, color}
  condition_answers JSONB NOT NULL DEFAULT '{}'::JSONB,  -- questionnaire answers
  estimated_value NUMERIC(10,2),
  final_value NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','approved','rejected','pickup_scheduled','completed')),
  scheduled_slot TIMESTAMPTZ,
  owner_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tradein_user ON public.trade_in_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tradein_status ON public.trade_in_requests(status);

-- ============================================================
-- REPAIR BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.repair_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,                            -- Screen replacement, Battery, etc.
  device_info JSONB NOT NULL DEFAULT '{}'::JSONB,
  scheduled_slot TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'booked'
    CHECK (status IN ('booked','in_progress','completed','cancelled')),
  estimated_cost NUMERIC(10,2),
  final_cost NUMERIC(10,2),
  technician_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_user ON public.repair_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_status ON public.repair_bookings(status);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- Function to update product average_rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET
    average_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE product_id = NEW.product_id),
    review_count   = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================================
-- PRODUCT Q&A
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_qa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  asked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  answered_by UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_qa_product ON public.product_qa(product_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),                           -- cap for percentage discounts
  usage_limit INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);

-- ============================================================
-- RECENTLY VIEWED
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON public.recently_viewed(user_id);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  action TEXT NOT NULL,                                  -- 'CREATE_PRODUCT', 'UPDATE_ORDER', etc.
  target_table TEXT NOT NULL,
  target_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_owner ON public.audit_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_log(target_table);

-- ============================================================
-- Updated_at auto-update trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_tradein_updated_at
  BEFORE UPDATE ON public.trade_in_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_repair_updated_at
  BEFORE UPDATE ON public.repair_bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
