-- ============================================================
-- ARONA MOBILES — Accessories Schema & Initial Dataset
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. ACCESSORY CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.accessory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial accessory categories
INSERT INTO public.accessory_categories (name, slug, icon, sort_order) VALUES
  ('Mobile Cases', 'mobile-cases', '📱', 1),
  ('Screen Protectors', 'screen-protectors', '🛡️', 2),
  ('Chargers', 'chargers', '🔌', 3),
  ('Charging Cables', 'charging-cables', '⚡', 4),
  ('Power Banks', 'power-banks', '🔋', 5),
  ('Earphones', 'earphones', '🎧', 6),
  ('TWS / Wireless Earbuds', 'tws-earbuds', '🎵', 7),
  ('Neckbands', 'neckbands', '🎛️', 8),
  ('Bluetooth Speakers', 'bluetooth-speakers', '🔊', 9),
  ('Smart Watches', 'smart-watches', '⌚', 10),
  ('Phone Holders', 'phone-holders', '🧲', 11),
  ('Car Accessories', 'car-accessories', '🚗', 12),
  ('Adapters', 'adapters', '🔌', 13),
  ('Memory Cards', 'memory-cards', '💾', 14),
  ('OTG Adapters', 'otg-adapters', '🔄', 15),
  ('Camera Accessories', 'camera-accessories', '📷', 16),
  ('Cleaning Accessories', 'cleaning-accessories', '✨', 17),
  ('Other Accessories', 'other-accessories', '📦', 18)
ON CONFLICT (name) DO NOTHING;

-- 2. ACCESSORIES TABLE
CREATE TABLE IF NOT EXISTS public.accessories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  model_sku TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  discount_price NUMERIC(10,2),
  discount_percent INT DEFAULT 0,
  offer TEXT,
  stock INT NOT NULL DEFAULT 0,
  color TEXT,
  compatibility TEXT,
  description TEXT,
  specs JSONB DEFAULT '{}'::JSONB,
  images TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  published BOOLEAN DEFAULT TRUE,
  available BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  average_rating NUMERIC(3,2) DEFAULT 4.8,
  review_count INT DEFAULT 12,
  sold_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS model_sku TEXT;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS compatibility TEXT;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS offer TEXT;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.accessories ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accessories_category ON public.accessories(category);
CREATE INDEX IF NOT EXISTS idx_accessories_brand ON public.accessories(brand);
CREATE INDEX IF NOT EXISTS idx_accessories_is_active ON public.accessories(is_active);
CREATE INDEX IF NOT EXISTS idx_accessories_published ON public.accessories(published);
CREATE INDEX IF NOT EXISTS idx_accessories_is_featured ON public.accessories(is_featured);
CREATE INDEX IF NOT EXISTS idx_accessories_price ON public.accessories(price);
CREATE INDEX IF NOT EXISTS idx_accessories_created_at ON public.accessories(created_at DESC);

-- Enable RLS
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active accessories" ON public.accessories;
CREATE POLICY "Public read active accessories"
  ON public.accessories FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Server full access on accessories" ON public.accessories;
CREATE POLICY "Server full access on accessories"
  ON public.accessories FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read accessory categories" ON public.accessory_categories;
CREATE POLICY "Public read accessory categories"
  ON public.accessory_categories FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Server full access on accessory categories" ON public.accessory_categories;
CREATE POLICY "Server full access on accessory categories"
  ON public.accessory_categories FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER trg_accessories_updated_at
  BEFORE UPDATE ON public.accessories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add to Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'accessories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.accessories;
  END IF;
END $$;

-- 3. INITIAL ACCESSORIES SEED DATA
INSERT INTO public.accessories (
  id, name, brand, category, subcategory, model_sku, price, original_price, discount_price, discount_percent,
  offer, stock, color, compatibility, description, specs, images, image_url, is_featured, is_active, published, available
) VALUES
(
  'acc-apple-20w-adapter',
  'Apple 20W USB-C Power Adapter',
  'Apple',
  'Chargers',
  'Power Adapters',
  'MHJE3HN/A',
  1699.00,
  1900.00,
  1699.00,
  11,
  'Special In-Store Offer',
  25,
  'White',
  'iPhone 16, 15, 14, 13, 12, 11 series, iPad Pro, iPad Air',
  'The Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go. While the power adapter is compatible with any USB-C-enabled device, Apple recommends pairing it with iPad Pro and iPad Air for optimal charging performance.',
  '{"wattage": "20W", "port_type": "USB-C", "fast_charging": "PD 3.0", "warranty": "1 Year Official Apple Warranty"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'],
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-samsung-25w-typec',
  'Samsung 25W Type-C Super Fast Charger',
  'Samsung',
  'Chargers',
  'Power Adapters',
  'EP-TA800NBEGIN',
  1299.00,
  1699.00,
  1299.00,
  24,
  'Save ₹400 Today',
  30,
  'Black',
  'Samsung Galaxy S24, S23, S22, A55, A35, M55, Z Fold & Flip series',
  'Give your devices the powerful charging support they deserve. Wall Charger for Super Fast Charging (25W) provides Super Fast Charging at up to 25W for capable devices. Use Wall Charger with an official Samsung Type C to Type C charging cable for optimum results.',
  '{"wattage": "25W", "port_type": "Type-C", "technology": "Super Fast Charging USB PD 3.0 PPS", "warranty": "6 Months Samsung Warranty"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800'],
  'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-boat-airdopes-141',
  'boAt Airdopes 141 ANC TWS Earbuds',
  'boAt',
  'TWS / Wireless Earbuds',
  'Wireless Earbuds',
  'AIRDOPES-141-ANC',
  1499.00,
  4490.00,
  1499.00,
  67,
  'Flat 67% Off',
  20,
  'Gunmetal Black',
  'All Android & iOS smartphones, tablets, laptops with Bluetooth',
  'Experience crystal clear audio with active noise cancellation up to 32dB, ENx quad-mic tech for clear calls, and up to 42 hours of playback.',
  '{"playback": "Up to 42 Hours", "anc": "Up to 32dB", "bluetooth": "v5.3", "latency": "50ms Beast Mode", "water_resistance": "IPX5"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-anker-powercore-10k',
  'Anker PowerCore 10000mAh Power Bank 22.5W Fast Charge',
  'Anker',
  'Power Banks',
  'Fast Charge Power Banks',
  'A1256',
  1999.00,
  2999.00,
  1999.00,
  33,
  'Free USB-C Cable Included',
  15,
  'Matte Black',
  'Universal compatibility: iPhone, Samsung, OnePlus, Xiaomi, Pixel',
  'Ultra-compact high-speed portable charger with PowerIQ and VoltageBoost technology. Built with multi-protection safety system to keep your devices protected.',
  '{"capacity": "10000mAh", "output": "22.5W Max", "ports": "1x USB-C + 2x USB-A", "weight": "212g", "warranty": "18 Months Anker Warranty"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1609592426508-cc0279740156?w=800'],
  'https://images.unsplash.com/photo-1609592426508-cc0279740156?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-spigen-tough-armor-ip15',
  'Spigen Tough Armor MagFit Case for iPhone 15 Pro',
  'Spigen',
  'Mobile Cases',
  'Rugged MagSafe Cases',
  'ACS06718',
  1799.00,
  2499.00,
  1799.00,
  28,
  'MagSafe Compatible',
  18,
  'Gunmetal',
  'Apple iPhone 15 Pro (6.1 inch)',
  'Combination of TPU and Polycarbonate for dual protection from drops and scratches. Reinforced kickstand with raised lips to protect screen and camera.',
  '{"material": "TPU + Polycarbonate", "drop_protection": "Air Cushion Tech Mil-grade", "magsafe": "Yes", "built_in_kickstand": "Yes"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1601593346740-925612772716?w=800'],
  'https://images.unsplash.com/photo-1601593346740-925612772716?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-noise-colorfit-pro5',
  'Noise ColorFit Pro 5 Max AMOLED Smart Watch',
  'Noise',
  'Smart Watches',
  'Bluetooth Calling Watches',
  'WRNB-COLORFIT-PRO5',
  2999.00,
  7999.00,
  2999.00,
  62,
  'Hot Deal · Best Seller',
  12,
  'Elite Black',
  'Android 9.0+ / iOS 11.0+',
  '1.96-inch AMOLED display with always-on feature, Tru Sync Bluetooth calling, functional crown, 100+ sports modes, and 7-day battery life.',
  '{"display": "1.96 AMOLED (410x502)", "battery": "Up to 7 Days", "calling": "BT Calling with Mic & Speaker", "sensors": "Heart Rate, SpO2, Sleep"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-tempered-glass-9h',
  'Edge-to-Edge 9H Privacy Tempered Glass Screen Protector',
  'Arona Guard',
  'Screen Protectors',
  'Privacy Tempered Glass',
  'AG-PRIV-9H',
  499.00,
  999.00,
  499.00,
  50,
  'Free Installation at Store',
  50,
  'Black Border (Privacy)',
  'Available for all iPhone, Samsung S/A series, OnePlus models',
  'Anti-peeping 28-degree privacy filter prevents side viewing. 9H surface hardness protects your smartphone screen from shattering and scratches. Oleophobic anti-fingerprint coating.',
  '{"hardness": "9H Tempered Glass", "privacy_angle": "28 Degrees", "coating": "Oleophobic Hydrophobic", "thickness": "0.33mm"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'],
  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800',
  TRUE, TRUE, TRUE, TRUE
),
(
  'acc-braided-typec-cable-65w',
  'Heavy Duty 1.5M Braided Type-C to Type-C 65W Fast Cable',
  'Stuffcool',
  'Charging Cables',
  'Type-C Cables',
  'SC-C2C-65W',
  499.00,
  999.00,
  499.00,
  50,
  'Buy 2 Get Extra 10% Off in store',
  40,
  'Metallic Grey',
  'Laptops, MacBooks, iPads, Galaxy S24, iPhone 15/16, OnePlus',
  'Ultra-durable nylon braided exterior with 25,000+ bend lifespan. Supports 65W Power Delivery fast charging and 480Mbps high-speed data transfer.',
  '{"length": "1.5 Meters", "power": "65W Fast Charging PD", "data_rate": "480 Mbps", "material": "Military Grade Braided Nylon"}'::JSONB,
  ARRAY['https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800'],
  'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800',
  TRUE, TRUE, TRUE, TRUE
)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  is_active = EXCLUDED.is_active,
  published = EXCLUDED.published,
  updated_at = NOW();
