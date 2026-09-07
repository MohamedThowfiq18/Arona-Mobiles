-- ============================================================
-- ARONA MOBILES — Enable Realtime on products table
-- Run after schema.sql
-- ============================================================

-- Add products table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Optional: also track orders for owner dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_in_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.repair_bookings;
