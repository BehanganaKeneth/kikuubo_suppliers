/*
  # Kikuubo E-Commerce Platform Database Schema

  ## Overview
  Complete database schema for Kikuubo Suppliers e-commerce platform including products,
  orders, cart, promo codes, seasonal discounts, and user management.

  ## New Tables

  1. **profiles**
     - `id` (uuid, references auth.users)
     - `email` (text)
     - `full_name` (text)
     - `phone` (text)
     - `country` (text) - for currency detection
     - `currency` (text) - UGX or USD
     - `is_admin` (boolean)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **categories**
     - `id` (uuid, primary key)
     - `name` (text)
     - `slug` (text, unique)
     - `description` (text)
     - `created_at` (timestamptz)

  3. **products**
     - `id` (uuid, primary key)
     - `name` (text)
     - `slug` (text, unique)
     - `description` (text)
     - `category_id` (uuid, references categories)
     - `origin` (text) - country of origin
     - `retail_price_ugx` (numeric)
     - `wholesale_price_ugx` (numeric)
     - `retail_price_usd` (numeric)
     - `wholesale_price_usd` (numeric)
     - `stock_quantity` (integer)
     - `images` (jsonb) - array of image URLs
     - `is_featured` (boolean)
     - `is_active` (boolean)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **seasonal_discounts**
     - `id` (uuid, primary key)
     - `product_id` (uuid, references products)
     - `discount_percentage` (numeric)
     - `start_date` (timestamptz)
     - `end_date` (timestamptz)
     - `is_active` (boolean)
     - `banner_text` (text)
     - `created_at` (timestamptz)

  5. **promo_codes**
     - `id` (uuid, primary key)
     - `code` (text, unique)
     - `discount_type` (text) - 'percentage' or 'fixed'
     - `discount_value` (numeric)
     - `currency` (text) - for fixed discounts
     - `influencer_name` (text)
     - `influencer_commission_rate` (numeric)
     - `start_date` (timestamptz)
     - `end_date` (timestamptz)
     - `max_uses` (integer)
     - `current_uses` (integer)
     - `is_active` (boolean)
     - `created_at` (timestamptz)

  6. **cart_items**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `product_id` (uuid, references products)
     - `quantity` (integer)
     - `price_type` (text) - 'retail' or 'wholesale'
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  7. **orders**
     - `id` (uuid, primary key)
     - `order_number` (text, unique)
     - `user_id` (uuid, references auth.users)
     - `status` (text) - pending, confirmed, dispatched, delivered, cancelled
     - `currency` (text)
     - `subtotal` (numeric)
     - `discount_amount` (numeric)
     - `delivery_fee` (numeric)
     - `total_amount` (numeric)
     - `promo_code_id` (uuid, references promo_codes)
     - `payment_method` (text)
     - `payment_status` (text)
     - `payment_reference` (text)
     - `delivery_type` (text) - normal, express, free
     - `delivery_address` (jsonb)
     - `delivery_provider` (text) - HDL, FedEx
     - `tracking_number` (text)
     - `customer_notes` (text)
     - `admin_notes` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  8. **order_items**
     - `id` (uuid, primary key)
     - `order_id` (uuid, references orders)
     - `product_id` (uuid, references products)
     - `product_name` (text) - snapshot
     - `quantity` (integer)
     - `price_type` (text)
     - `unit_price` (numeric)
     - `subtotal` (numeric)
     - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users to manage their own data
  - Admin-only policies for product and promo code management
  - Public read access for products and categories
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  country text DEFAULT 'Uganda',
  currency text DEFAULT 'UGX',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  origin text,
  retail_price_ugx numeric(10,2) DEFAULT 0,
  wholesale_price_ugx numeric(10,2) DEFAULT 0,
  retail_price_usd numeric(10,2) DEFAULT 0,
  wholesale_price_usd numeric(10,2) DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  images jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create seasonal_discounts table
CREATE TABLE IF NOT EXISTS seasonal_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage numeric(5,2) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  banner_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seasonal_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active discounts"
  ON seasonal_discounts FOR SELECT
  TO public
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can manage discounts"
  ON seasonal_discounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL,
  currency text DEFAULT 'UGX',
  influencer_name text,
  influencer_commission_rate numeric(5,2) DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_type text NOT NULL CHECK (price_type IN ('retail', 'wholesale')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, price_type)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  currency text NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) DEFAULT 0,
  delivery_fee numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  promo_code_id uuid REFERENCES promo_codes(id) ON DELETE SET NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_reference text,
  delivery_type text NOT NULL CHECK (delivery_type IN ('normal', 'express', 'free')),
  delivery_address jsonb NOT NULL,
  delivery_provider text CHECK (delivery_provider IN ('HDL', 'FedEx')),
  tracking_number text,
  customer_notes text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_type text NOT NULL CHECK (price_type IN ('retail', 'wholesale')),
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
BEGIN
  new_number := 'KKB' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
