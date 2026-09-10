-- ============================================================
-- ARONA MOBILES — Enable Realtime on products table
-- Run after schema.sql
-- ============================================================

-- Add products and store_settings table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;

-- Optional: also track orders for owner dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_in_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.repair_bookings;

