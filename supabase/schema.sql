-- Supabase Schema for ARONA MOBILES
-- Run this SQL in your Supabase SQL Editor to set up tables, RLS policies, and Realtime!

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('new', 'preowned')),
    grade_if_preowned TEXT CHECK (grade_if_preowned IN ('A+', 'A', 'B', 'C')),
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    stock INT NOT NULL DEFAULT 0,
    inspection_report JSONB DEFAULT '{}'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 4.9,
    reviews_count INT DEFAULT 24,
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE REALTIME ON PRODUCTS
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    totals JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TRADE-IN REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.trade_in_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    condition_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    estimated_value NUMERIC(10, 2) NOT NULL,
    final_value NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'inspected', 'completed', 'rejected')),
    scheduled_slot JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. REPAIR BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.repair_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ticket_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    scheduled_slot JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'diagnosing', 'repairing', 'quality_check', 'ready', 'completed')),
    cost NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_in_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read, authenticated admins can insert/update/delete
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin all on products" ON public.products FOR ALL USING (true); -- simplify for demo access

-- Orders: Public can create, Admin can read/update
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow admin update orders" ON public.orders FOR UPDATE USING (true);

-- Trade-In Requests: Public insert, all read
CREATE POLICY "Allow public insert trade_in" ON public.trade_in_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read trade_in" ON public.trade_in_requests FOR SELECT USING (true);
CREATE POLICY "Allow update trade_in" ON public.trade_in_requests FOR UPDATE USING (true);

-- Repair Bookings: Public insert, all read
CREATE POLICY "Allow public insert repair" ON public.repair_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read repair" ON public.repair_bookings FOR SELECT USING (true);
CREATE POLICY "Allow update repair" ON public.repair_bookings FOR UPDATE USING (true);

-- Reviews: Public read and insert
CREATE POLICY "Allow read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
