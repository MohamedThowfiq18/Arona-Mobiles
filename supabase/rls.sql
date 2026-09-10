-- ============================================================
-- ARONA MOBILES — Row Level Security (RLS) Policies
-- Run after schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_in_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PRODUCTS — public read for active products, service role writes
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

-- Service role (owner portal server actions) can do everything
-- This is handled by using the service role key on the server side

-- ============================================================
-- BRANDS & CATEGORIES — public read
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read brands" ON public.brands;
CREATE POLICY "Anyone can read brands"
  ON public.brands FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT USING (TRUE);

-- ============================================================
-- USERS — users can read/update their own record
-- ============================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- ORDERS — users can read/insert their own orders
-- ============================================================
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRADE-IN — users manage own requests
-- ============================================================
DROP POLICY IF EXISTS "Users can read own trade-in" ON public.trade_in_requests;
CREATE POLICY "Users can read own trade-in"
  ON public.trade_in_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert trade-in" ON public.trade_in_requests;
CREATE POLICY "Users can insert trade-in"
  ON public.trade_in_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REPAIR BOOKINGS — users manage own bookings
-- ============================================================
DROP POLICY IF EXISTS "Users can read own repairs" ON public.repair_bookings;
CREATE POLICY "Users can read own repairs"
  ON public.repair_bookings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert repairs" ON public.repair_bookings;
CREATE POLICY "Users can insert repairs"
  ON public.repair_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REVIEWS — public read, own write
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Q&A — public read, users can ask
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read QA" ON public.product_qa;
CREATE POLICY "Anyone can read QA"
  ON public.product_qa FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Users can ask questions" ON public.product_qa;
CREATE POLICY "Users can ask questions"
  ON public.product_qa FOR INSERT
  WITH CHECK (auth.uid() = asked_by);

-- ============================================================
-- COUPONS — public read for active coupons (code lookup)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
CREATE POLICY "Anyone can read active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- WISHLIST — users manage own
-- ============================================================
DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist;
CREATE POLICY "Users manage own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RECENTLY VIEWED — users manage own
-- ============================================================
DROP POLICY IF EXISTS "Users manage own recently viewed" ON public.recently_viewed;
CREATE POLICY "Users manage own recently viewed"
  ON public.recently_viewed FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- OTP CODES — service role only (no policy = deny all for anon/authenticated)
-- ============================================================
-- No public policies; accessed only via service role key in server actions

-- ============================================================
-- OWNERS — secure access for server-side auth
-- ============================================================
DROP POLICY IF EXISTS "Allow server access on owners" ON public.owners;
CREATE POLICY "Allow server access on owners"
  ON public.owners FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- AUDIT LOG — service role only (write), owner can read own
-- ============================================================
-- No public policies; owner reads via server-side API
