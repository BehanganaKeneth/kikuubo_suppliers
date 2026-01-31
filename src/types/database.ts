export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string;
  currency: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  origin: string | null;
  retail_price_ugx: number;
  wholesale_price_ugx: number;
  retail_price_usd: number;
  wholesale_price_usd: number;
  stock_quantity: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonalDiscount {
  id: string;
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  banner_text: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  currency: string;
  influencer_name: string | null;
  influencer_commission_rate: number;
  start_date: string;
  end_date: string;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price_type: 'retail' | 'wholesale';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  currency: string;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  promo_code_id: string | null;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_reference: string | null;
  delivery_type: 'normal' | 'express' | 'free';
  delivery_address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  delivery_provider: 'HDL' | 'FedEx' | null;
  tracking_number: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_type: 'retail' | 'wholesale';
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface ProductWithDetails extends Product {
  category?: Category;
  discount?: SeasonalDiscount;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
