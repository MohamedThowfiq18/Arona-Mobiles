export type ProductCondition = 'new' | 'preowned';
export type ProductGrade = 'A+' | 'A' | 'B' | 'C';

export interface ProductVariant {
  storage: string;
  color: string;
  colorHex?: string;
  priceModifier?: number;
  stock: number;
}

export interface InspectionCheckitem {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  score: string;
  details: string;
}

export interface InspectionReport {
  batteryHealth: number;
  screenGrade: string;
  cosmeticScore: string;
  checklist: InspectionCheckitem[];
}

export interface ProductSpecs {
  display: string;
  processor: string;
  camera: string;
  battery: string;
  os: string;
  connectivity: string;
  ram?: string;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  condition: ProductCondition;
  gradeIfPreowned?: ProductGrade;
  specs: ProductSpecs;
  variants: ProductVariant[];
  images: string[];
  price: number;
  originalPrice?: number;
  stock: number;
  inspectionReport?: InspectionReport;
  rating: number;
  reviewsCount: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    grandTotal: number;
  };
  createdAt: string;
}

export interface TradeInRequest {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceInfo: {
    brand: string;
    model: string;
    storage: string;
  };
  conditionAnswers: {
    screenCondition: string;
    bodyCondition: string;
    batteryHealth: string;
    functionalIssues: string[];
  };
  estimatedValue: number;
  finalValue?: number;
  status: 'pending' | 'scheduled' | 'inspected' | 'completed' | 'rejected';
  scheduledSlot: {
    date: string;
    timeSlot: string;
    type: 'pickup' | 'dropoff';
    address?: string;
  };
  createdAt: string;
}

export interface RepairBooking {
  id: string;
  userId?: string;
  ticketId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  deviceInfo: {
    brand: string;
    model: string;
  };
  scheduledSlot: {
    date: string;
    timeSlot: string;
  };
  status: 'received' | 'diagnosing' | 'repairing' | 'quality_check' | 'ready' | 'completed';
  cost: number;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}
