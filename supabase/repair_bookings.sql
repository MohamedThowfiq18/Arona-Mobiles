-- ============================================================
-- ARONA MOBILES — REPAIR BOOKINGS TABLE MIGRATION
-- Run this in Supabase SQL Editor if creating/migrating tables
-- ============================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.repair_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_phone TEXT,
  phone_brand TEXT,
  phone_model TEXT,
  issue_description TEXT,
  service_type TEXT NOT NULL,
  service_price NUMERIC(10,2),
  preferred_date_time TIMESTAMPTZ,
  scheduled_slot TIMESTAMPTZ,
  device_info JSONB DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  technician_notes TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add columns if table already existed from an earlier schema
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'customer_name') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN customer_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'customer_phone') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN customer_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'phone_brand') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN phone_brand TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'phone_model') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN phone_model TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'issue_description') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN issue_description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'service_price') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN service_price NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'preferred_date_time') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN preferred_date_time TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repair_bookings' AND column_name = 'notes') THEN
    ALTER TABLE public.repair_bookings ADD COLUMN notes TEXT;
  END IF;
END $$;

-- 3. Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_repair_bookings_created_at ON public.repair_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repair_bookings_status ON public.repair_bookings(status);
CREATE INDEX IF NOT EXISTS idx_repair_bookings_pref_date ON public.repair_bookings(preferred_date_time);
CREATE INDEX IF NOT EXISTS idx_repair_bookings_phone ON public.repair_bookings(customer_phone);

-- 4. Enable RLS
ALTER TABLE public.repair_bookings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow anyone (public/anon) to insert repair bookings (customer booking flow)
DROP POLICY IF EXISTS "Anyone can insert repair bookings" ON public.repair_bookings;
CREATE POLICY "Anyone can insert repair bookings"
  ON public.repair_bookings FOR INSERT
  WITH CHECK (TRUE);

-- Allow SELECT for realtime subscription listeners
DROP POLICY IF EXISTS "Allow select for realtime on repair bookings" ON public.repair_bookings;
CREATE POLICY "Allow select for realtime on repair bookings"
  ON public.repair_bookings FOR SELECT
  USING (TRUE);

-- Allow service role full access (Owner APIs use service-role key)
DROP POLICY IF EXISTS "Service role full access on repair bookings" ON public.repair_bookings;
CREATE POLICY "Service role full access on repair bookings"
  ON public.repair_bookings
  USING (TRUE)
  WITH CHECK (TRUE);

-- 6. Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.repair_bookings;
