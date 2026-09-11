// ============================================================
// Shared TypeScript interfaces for Arona Mobiles
// ============================================================

export type Condition = 'new' | 'pre-owned';
export type Grade = 'A' | 'B' | 'C';
export type OrderStatus =
  | 'pending'
  | 'placed'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'collected'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'pay_at_store' | 'upi' | 'card' | 'emi' | 'wallet';
export type DiscountType = 'percentage' | 'flat';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  description?: string;
}

export interface ProductSpecs {
  display?: string;
  processor?: string;
  ram?: string;
  storage_built?: string;
  battery?: string;
  charging?: string;
  camera?: string;
  rear_camera?: string;
  front_camera?: string;
  os?: string;
  '5g'?: boolean;
  s_pen?: boolean;
  fast_charging?: string;
  [key: string]: unknown;
}

export interface ProductVariant {
  color: string;
  storage: string;
  price: number;
  discount_price?: number;
  stock: number;
  images?: string[];
}

export interface InspectionReport {
  checked_points?: number;
  battery_health?: string;
  screen?: string;
  body?: string;
  camera?: string;
  speakers?: string;
  buttons?: string;
  connectivity?: string;
}

export interface Product {
  id: string;
  brand_id?: string;
  category_id?: string;
  brand: string;
  model: string;
  variant?: string;
  ram?: string;
  storage?: string;
  color?: string;
  slug: string;
  condition: Condition;
  grade?: Grade;
  short_description?: string;
  description?: string;
  specs: ProductSpecs;
  variants: ProductVariant[];
  images: string[];
  image_url?: string;
  price: number;
  original_price?: number;
  discount_price?: number;
  stock: number;
  offer?: string;
  available?: boolean;
  featured?: boolean;
  published?: boolean;
  sku?: string;
  is_featured: boolean;
  is_active: boolean;
  flash_sale_ends_at?: string;
  inspection_report?: InspectionReport;
  tags: string[];
  average_rating: number;
  review_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar_url?: string;
  role: 'customer';
  addresses: Address[];
  created_at: string;
}

export interface Owner {
  id: string;
  phone: string;
  otp_verified: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  model: string;
  brand: string;
  image: string;
  price: number;
  qty: number;
  variant?: {
    color?: string;
    storage?: string;
  };
}

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  items: OrderItem[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  address: Address;
  coupon_code?: string;
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  total: number;
  tracking_history?: TrackingEvent[];
  estimated_delivery?: string;
  pickup_schedule?: string;
  pickup_notes?: string;
  invoice_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TradeInRequest {
  id: string;
  user_id?: string;
  device_info: {
    brand: string;
    model: string;
    storage?: string;
    color?: string;
    year?: string;
  };
  condition_answers: Record<string, string | boolean>;
  estimated_value?: number;
  final_value?: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pickup_scheduled' | 'completed';
  scheduled_slot?: string;
  owner_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RepairBooking {
  id: string;
  user_id?: string;
  customer_name?: string;
  customer_phone?: string;
  phone_brand?: string;
  phone_model?: string;
  issue_description?: string;
  service_type: string;
  service_price?: number;
  preferred_date_time?: string;
  device_info?: {
    brand?: string;
    model?: string;
    imei?: string;
    issue_description?: string;
    issue?: string;
  };
  scheduled_slot?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'booked' | 'repaired' | 'delivered';
  estimated_cost?: number;
  final_cost?: number;
  notes?: string;
  technician_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  photos: string[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  // joined
  user?: Pick<User, 'name' | 'avatar_url'>;
}

export interface ProductQA {
  id: string;
  product_id: string;
  question: string;
  answer?: string;
  asked_by?: string;
  answered_by?: string;
  is_published: boolean;
  created_at: string;
  answered_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface AuditLog {
  id: string;
  owner_id?: string;
  action: string;
  target_table: string;
  target_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// API response helpers
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Filter / sort types for shop
export interface ShopFilters {
  brand?: string[];
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  ram?: string[];
  storage?: string[];
  rating?: number;
  grade?: Grade[];
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popularity' | 'rating';

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline?: string;
  phone_primary: string;
  phone_primary_raw: string;
  phone_secondary: string;
  phone_secondary_raw: string;
  whatsapp_number: string;
  whatsapp_display: string;
  authorized_owner_phones: string[];
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  hours_weekdays?: string;
  hours_sunday?: string;
  google_maps_url?: string;
  announcement_bar?: string;
  created_at?: string;
  updated_at?: string;
}
