-- ============================================================
-- ARONA MOBILES — Store Settings & Contact Numbers Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. CREATE STORE SETTINGS TABLE
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

-- 2. INSERT DEFAULT STORE SETTINGS RECORD
INSERT INTO public.store_settings (
  id,
  store_name,
  tagline,
  phone_primary,
  phone_primary_raw,
  phone_secondary,
  phone_secondary_raw,
  whatsapp_number,
  whatsapp_display,
  authorized_owner_phones,
  email,
  address_line1,
  address_line2,
  city,
  state,
  pincode,
  landmark,
  hours_weekdays,
  hours_sunday,
  google_maps_url
) VALUES (
  'default',
  'ARONA MOBILES',
  'Your Trusted Mobile Phone Store',
  '+91 97870 61617',
  '+919787061617',
  '+91 96594 58606',
  '+919659458606',
  '919787061617',
  '+91 97870 61617',
  ARRAY['9787061617', '9659458606', '9994235672'],
  'contact@aronamobiles.com',
  'ARONA MOBILES, Opp. Town Hall',
  'Main Commercial Road',
  'Bangalore',
  'Karnataka',
  '560001',
  'Opposite Town Hall, near Central Junction',
  'Mon–Sat: 10:00 AM – 8:30 PM',
  'Sunday: 11:00 AM – 6:00 PM',
  'https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac'
)
ON CONFLICT (id) DO NOTHING;

-- 3. ENABLE REALTIME ON STORE SETTINGS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'store_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  END IF;
END $$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read for all visitors
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
ON public.store_settings FOR SELECT
USING (true);

-- Allow updates (handled by API / service role)
DROP POLICY IF EXISTS "Allow update on store settings" ON public.store_settings;
CREATE POLICY "Allow update on store settings"
ON public.store_settings FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow insert on store settings" ON public.store_settings;
CREATE POLICY "Allow insert on store settings"
ON public.store_settings FOR INSERT
WITH CHECK (true);
