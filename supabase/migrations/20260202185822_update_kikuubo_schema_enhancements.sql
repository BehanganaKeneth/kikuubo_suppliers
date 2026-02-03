/*
  # Kikuubo Suppliers Schema Enhancements

  ## Updates
  - Add promotional banners table
  - Add origin groups for product organization
  - Enhance discount tracking
  - Add notification preferences table
  - Add receipt generation tracking

  ## New Tables

  1. **promotional_banners**
     - `id` (uuid, primary key)
     - `title` (text)
     - `description` (text)
     - `image_url` (text)
     - `link` (text)
     - `start_date` (timestamptz)
     - `end_date` (timestamptz)
     - `is_active` (boolean)
     - `created_at` (timestamptz)

  2. **product_origins**
     - `id` (uuid, primary key)
     - `name` (text, unique)
     - `slug` (text, unique)
     - `display_order` (integer)
     - `created_at` (timestamptz)

  3. **notification_preferences**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `email_notifications` (boolean)
     - `sms_notifications` (boolean)
     - `order_updates` (boolean)
     - `promotions` (boolean)
     - `created_at` (timestamptz)

  4. **receipts**
     - `id` (uuid, primary key)
     - `order_id` (uuid, references orders)
     - `receipt_number` (text, unique)
     - `receipt_type` (text) - customer or admin
     - `pdf_url` (text)
     - `qr_code` (text)
     - `generated_at` (timestamptz)
*/

-- Create promotional_banners table
CREATE TABLE IF NOT EXISTS promotional_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON promotional_banners FOR SELECT
  TO public
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can manage banners"
  ON promotional_banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create product_origins table
CREATE TABLE IF NOT EXISTS product_origins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_origins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view origins"
  ON product_origins FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage origins"
  ON product_origins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  promotions boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  receipt_number text UNIQUE NOT NULL,
  receipt_type text CHECK (receipt_type IN ('customer', 'admin')),
  pdf_url text,
  qr_code text,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = receipts.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all receipts"
  ON receipts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert product origins
INSERT INTO product_origins (name, slug, display_order) VALUES
  ('Korea', 'korea', 1),
  ('Japan', 'japan', 2),
  ('Paris', 'paris', 3),
  ('USA', 'usa', 4),
  ('UK', 'uk', 5),
  ('Body Supplements', 'body-supplements', 6)
ON CONFLICT (slug) DO NOTHING;

-- Create index for banners
CREATE INDEX IF NOT EXISTS idx_promotional_banners_active ON promotional_banners(is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_promotional_banners_dates ON promotional_banners(start_date, end_date);
