-- ============================================================
-- ARONA MOBILES — Seed Data
-- Run after schema.sql + rls.sql
-- ============================================================

-- BRANDS
INSERT INTO public.brands (id, name, slug, sort_order) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Apple', 'apple', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Samsung', 'samsung', 2),
  ('b1000000-0000-0000-0000-000000000003', 'OnePlus', 'oneplus', 3),
  ('b1000000-0000-0000-0000-000000000004', 'Xiaomi', 'xiaomi', 4),
  ('b1000000-0000-0000-0000-000000000005', 'Realme', 'realme', 5),
  ('b1000000-0000-0000-0000-000000000006', 'Vivo', 'vivo', 6),
  ('b1000000-0000-0000-0000-000000000007', 'Google', 'google', 7)
ON CONFLICT (slug) DO NOTHING;

-- CATEGORIES
INSERT INTO public.categories (id, name, slug, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Certified Pre-Owned', 'certified-pre-owned', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Accessories', 'accessories', 3)
ON CONFLICT (slug) DO NOTHING;

-- PRODUCTS (12 sample phones)
INSERT INTO public.products (
  id, brand_id, category_id, brand, model, slug, condition, grade,
  short_description, specs, variants, images, price, discount_price,
  stock, sku, is_featured, average_rating, review_count, sold_count
) VALUES

-- 1. iPhone 15 Pro
(
  'p1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'Apple', 'iPhone 15 Pro', 'iphone-15-pro', 'new', NULL,
  'A17 Pro chip, titanium design, 48MP camera system',
  '{"display": "6.1\" Super Retina XDR OLED", "processor": "A17 Pro", "ram": "8GB", "battery": "3274 mAh", "rear_camera": "48MP + 12MP + 12MP", "front_camera": "12MP", "os": "iOS 17", "5g": true}',
  '[{"color": "Black Titanium", "storage": "128GB", "price": 134900, "discount_price": 129900, "stock": 8}, {"color": "Natural Titanium", "storage": "256GB", "price": 144900, "discount_price": 139900, "stock": 5}, {"color": "White Titanium", "storage": "512GB", "price": 164900, "discount_price": 159900, "stock": 3}]',
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'],
  134900, 129900, 16, 'APPL-IP15P-128', TRUE, 4.70, 234, 412
),

-- 2. iPhone 14
(
  'p1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'Apple', 'iPhone 14', 'iphone-14', 'new', NULL,
  'A15 Bionic chip, Ceramic Shield front, Photonic Engine',
  '{"display": "6.1\" Super Retina XDR OLED", "processor": "A15 Bionic", "ram": "6GB", "battery": "3279 mAh", "rear_camera": "12MP + 12MP", "front_camera": "12MP TrueDepth", "os": "iOS 17", "5g": true}',
  '[{"color": "Midnight", "storage": "128GB", "price": 79900, "discount_price": 69900, "stock": 12}, {"color": "Starlight", "storage": "256GB", "price": 89900, "discount_price": 79900, "stock": 7}]',
  ARRAY['https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=600'],
  79900, 69900, 19, 'APPL-IP14-128', TRUE, 4.50, 189, 388
),

-- 3. Samsung Galaxy S24 Ultra
(
  'p1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000001',
  'Samsung', 'Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'new', NULL,
  'Snapdragon 8 Gen 3, built-in S Pen, 200MP camera',
  '{"display": "6.8\" Dynamic AMOLED 2X 120Hz", "processor": "Snapdragon 8 Gen 3", "ram": "12GB", "battery": "5000 mAh", "rear_camera": "200MP + 50MP + 12MP + 10MP", "front_camera": "12MP", "os": "Android 14 (One UI 6.1)", "5g": true, "s_pen": true}',
  '[{"color": "Titanium Black", "storage": "256GB", "price": 129999, "discount_price": 119999, "stock": 6}, {"color": "Titanium Gray", "storage": "512GB", "price": 149999, "discount_price": 139999, "stock": 4}]',
  ARRAY['https://images.unsplash.com/photo-1706438374239-42dd864bde9a?w=600'],
  129999, 119999, 10, 'SAMS-S24U-256', TRUE, 4.60, 312, 278
),

-- 4. Samsung Galaxy A55
(
  'p1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000001',
  'Samsung', 'Galaxy A55', 'samsung-galaxy-a55', 'new', NULL,
  'Exynos 1480, 50MP OIS camera, IP67 water resistance',
  '{"display": "6.6\" Super AMOLED 120Hz", "processor": "Exynos 1480", "ram": "8GB", "battery": "5000 mAh", "rear_camera": "50MP + 12MP + 5MP", "front_camera": "32MP", "os": "Android 14 (One UI 6.1)", "5g": true}',
  '[{"color": "Awesome Navy", "storage": "128GB", "price": 39999, "discount_price": 35999, "stock": 20}, {"color": "Awesome Ice Blue", "storage": "256GB", "price": 44999, "discount_price": 39999, "stock": 15}]',
  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
  39999, 35999, 35, 'SAMS-A55-128', FALSE, 4.30, 98, 156
),

-- 5. OnePlus 12
(
  'p1000000-0000-0000-0000-000000000005',
  'b1000000-0000-0000-0000-000000000003',
  'c1000000-0000-0000-0000-000000000001',
  'OnePlus', 'OnePlus 12', 'oneplus-12', 'new', NULL,
  'Snapdragon 8 Gen 3, Hasselblad cameras, 100W SUPERVOOC',
  '{"display": "6.82\" LTPO AMOLED 120Hz", "processor": "Snapdragon 8 Gen 3", "ram": "12GB", "battery": "5400 mAh", "rear_camera": "50MP + 48MP + 64MP (Hasselblad)", "front_camera": "32MP", "os": "OxygenOS 14 (Android 14)", "5g": true, "fast_charging": "100W"}',
  '[{"color": "Silky Black", "storage": "256GB", "price": 64999, "discount_price": 59999, "stock": 14}, {"color": "Flowy Emerald", "storage": "512GB", "price": 74999, "discount_price": 69999, "stock": 8}]',
  ARRAY['https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600'],
  64999, 59999, 22, 'OP-OP12-256', TRUE, 4.55, 143, 201
),

-- 6. Xiaomi 14
(
  'p1000000-0000-0000-0000-000000000006',
  'b1000000-0000-0000-0000-000000000004',
  'c1000000-0000-0000-0000-000000000001',
  'Xiaomi', 'Xiaomi 14', 'xiaomi-14', 'new', NULL,
  'Snapdragon 8 Gen 3, Leica optics, 90W HyperCharge',
  '{"display": "6.36\" AMOLED 120Hz", "processor": "Snapdragon 8 Gen 3", "ram": "12GB", "battery": "4610 mAh", "rear_camera": "50MP + 50MP + 50MP (Leica)", "front_camera": "32MP", "os": "HyperOS (Android 14)", "5g": true}',
  '[{"color": "Black", "storage": "256GB", "price": 59999, "discount_price": 54999, "stock": 10}]',
  ARRAY['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600'],
  59999, 54999, 10, 'XIAO-14-256', FALSE, 4.40, 87, 134
),

-- 7. Realme 12 Pro+
(
  'p1000000-0000-0000-0000-000000000007',
  'b1000000-0000-0000-0000-000000000005',
  'c1000000-0000-0000-0000-000000000001',
  'Realme', 'Realme 12 Pro+', 'realme-12-pro-plus', 'new', NULL,
  'Snapdragon 7s Gen 2, 50MP periscope telephoto, 67W charge',
  '{"display": "6.7\" AMOLED 120Hz", "processor": "Snapdragon 7s Gen 2", "ram": "8GB", "battery": "5000 mAh", "rear_camera": "50MP + 64MP periscope + 8MP", "front_camera": "32MP", "os": "Realme UI 5.0 (Android 14)", "5g": true}',
  '[{"color": "Navigator Beige", "storage": "256GB", "price": 32999, "discount_price": 29999, "stock": 18}]',
  ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
  32999, 29999, 18, 'RM-12PP-256', FALSE, 4.20, 67, 89
),

-- 8. Pre-owned iPhone 13 (Grade A)
(
  'p1000000-0000-0000-0000-000000000008',
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000002',
  'Apple', 'iPhone 13', 'iphone-13-preowned-a', 'pre-owned', 'A',
  'Certified pre-owned, Grade A — like new condition, full warranty',
  '{"display": "6.1\" Super Retina XDR OLED", "processor": "A15 Bionic", "ram": "4GB", "battery": "3227 mAh", "rear_camera": "12MP + 12MP", "front_camera": "12MP TrueDepth", "os": "iOS 17", "5g": true}',
  '[{"color": "Midnight", "storage": "128GB", "price": 44999, "discount_price": 41999, "stock": 5}, {"color": "Starlight", "storage": "256GB", "price": 54999, "discount_price": 49999, "stock": 3}]',
  ARRAY['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600'],
  44999, 41999, 8, 'APPL-IP13-128-PO-A', FALSE, 4.60, 45, 78,
  '{"checked_points": 8, "battery_health": "92%", "screen": "No scratches", "body": "Pristine", "camera": "Fully functional", "speakers": "Clear", "buttons": "All working", "connectivity": "All ports functional"}'
),

-- 9. Pre-owned Samsung Galaxy S23 (Grade B)
(
  'p1000000-0000-0000-0000-000000000009',
  'b1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000002',
  'Samsung', 'Galaxy S23', 'samsung-galaxy-s23-preowned-b', 'pre-owned', 'B',
  'Certified pre-owned, Grade B — minor cosmetic marks, excellent performance',
  '{"display": "6.1\" Dynamic AMOLED 2X 120Hz", "processor": "Snapdragon 8 Gen 2", "ram": "8GB", "battery": "3900 mAh", "rear_camera": "50MP + 12MP + 10MP", "front_camera": "12MP", "os": "Android 14 (One UI 6.1)", "5g": true}',
  '[{"color": "Phantom Black", "storage": "128GB", "price": 34999, "discount_price": 31999, "stock": 4}]',
  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
  34999, 31999, 4, 'SAMS-S23-128-PO-B', FALSE, 4.20, 32, 55,
  '{"checked_points": 8, "battery_health": "86%", "screen": "Minor scratch (barely visible)", "body": "Small scuff on back", "camera": "Fully functional", "speakers": "Clear", "buttons": "All working", "connectivity": "All ports functional"}'
),

-- 10. OnePlus Nord CE 4
(
  'p1000000-0000-0000-0000-000000000010',
  'b1000000-0000-0000-0000-000000000003',
  'c1000000-0000-0000-0000-000000000001',
  'OnePlus', 'Nord CE 4', 'oneplus-nord-ce4', 'new', NULL,
  'Snapdragon 7s Gen 2, 50MP Sony IMX890, 100W SUPERVOOC',
  '{"display": "6.7\" AMOLED 120Hz", "processor": "Snapdragon 7s Gen 2", "ram": "8GB", "battery": "5500 mAh", "rear_camera": "50MP + 8MP", "front_camera": "16MP", "os": "OxygenOS 14.1 (Android 14)", "5g": true, "fast_charging": "100W"}',
  '[{"color": "Dark Chrome", "storage": "256GB", "price": 24999, "discount_price": 22999, "stock": 25}]',
  ARRAY['https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600'],
  24999, 22999, 25, 'OP-NORDCE4-256', FALSE, 4.30, 76, 112
),

-- 11. Google Pixel 8a
(
  'p1000000-0000-0000-0000-000000000011',
  'b1000000-0000-0000-0000-000000000007',
  'c1000000-0000-0000-0000-000000000001',
  'Google', 'Pixel 8a', 'google-pixel-8a', 'new', NULL,
  'Google Tensor G3, 7 years of updates, best-in-class AI features',
  '{"display": "6.1\" OLED 120Hz", "processor": "Google Tensor G3", "ram": "8GB", "battery": "4492 mAh", "rear_camera": "64MP + 13MP", "front_camera": "13MP", "os": "Android 14", "5g": true}',
  '[{"color": "Obsidian", "storage": "128GB", "price": 52999, "discount_price": 49999, "stock": 9}, {"color": "Porcelain", "storage": "256GB", "price": 62999, "discount_price": 57999, "stock": 5}]',
  ARRAY['https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600'],
  52999, 49999, 14, 'GOOG-PIX8A-128', FALSE, 4.50, 56, 87
),

-- 12. Pre-owned iPhone 12 (Grade C — budget)
(
  'p1000000-0000-0000-0000-000000000012',
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000002',
  'Apple', 'iPhone 12', 'iphone-12-preowned-c', 'pre-owned', 'C',
  'Certified pre-owned, Grade C — visible wear, all functions work perfectly',
  '{"display": "6.1\" Super Retina XDR OLED", "processor": "A14 Bionic", "ram": "4GB", "battery": "2815 mAh", "rear_camera": "12MP + 12MP", "front_camera": "12MP TrueDepth", "os": "iOS 17", "5g": true}',
  '[{"color": "Black", "storage": "64GB", "price": 24999, "discount_price": 21999, "stock": 6}]',
  ARRAY['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600'],
  24999, 21999, 6, 'APPL-IP12-64-PO-C', FALSE, 3.90, 28, 94,
  '{"checked_points": 8, "battery_health": "79%", "screen": "Visible scratches on edges", "body": "Multiple scuffs, one dent on corner", "camera": "Fully functional", "speakers": "Clear", "buttons": "All working", "connectivity": "All ports functional"}'
)

ON CONFLICT (slug) DO NOTHING;

-- SAMPLE COUPON
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_discount, is_active, expires_at) VALUES
  ('ARONA10', 'Flat 10% off on all orders', 'percentage', 10, 5000, 3000, TRUE, NOW() + INTERVAL '90 days'),
  ('WELCOME500', 'Flat ₹500 off on first order', 'flat', 500, 3000, NULL, TRUE, NOW() + INTERVAL '90 days'),
  ('TRADEPLUS', 'Extra ₹1000 off with any trade-in', 'flat', 1000, 10000, NULL, TRUE, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
