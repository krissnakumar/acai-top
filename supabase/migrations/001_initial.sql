-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('owner', 'admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  whatsapp_number TEXT NOT NULL,
  instagram_url TEXT,
  address TEXT,
  google_maps_url TEXT,
  is_open BOOLEAN DEFAULT true,
  accepts_orders_when_closed BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT true,
  delivery_enabled BOOLEAN DEFAULT true,
  minimum_order NUMERIC DEFAULT 0,
  default_delivery_time TEXT,
  show_unavailable_products BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add store_id to profiles table referencing stores
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create acai_sizes table
CREATE TABLE IF NOT EXISTS acai_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ml INTEGER,
  base_price NUMERIC NOT NULL,
  max_free_toppings INTEGER DEFAULT 0,
  max_free_fruits INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create acai_options table
CREATE TABLE IF NOT EXISTS acai_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('base', 'fruit', 'topping', 'syrup', 'cream', 'paid_extra')),
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create delivery_zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fee NUMERIC NOT NULL,
  minimum_order NUMERIC DEFAULT 0,
  estimated_time TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT CHECK (delivery_type IN ('delivery', 'pickup')),
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_reference TEXT,
  delivery_zone_id UUID REFERENCES delivery_zones(id),
  payment_method TEXT NOT NULL,
  needs_change BOOLEAN DEFAULT false,
  change_for NUMERIC,
  order_notes TEXT,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  item_type TEXT CHECK (item_type IN ('product', 'custom_acai')),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_item_options table
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  option_type TEXT,
  option_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public can read active stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read available products" ON products FOR SELECT USING (is_available = true);
CREATE POLICY "Public can read active acai_sizes" ON acai_sizes FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read available acai_options" ON acai_options FOR SELECT USING (is_available = true);
CREATE POLICY "Public can read active delivery_zones" ON delivery_zones FOR SELECT USING (is_active = true);

-- Public can insert orders and related data
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order_item_options" ON order_item_options FOR INSERT WITH CHECK (true);

-- Admin policies (owner can manage everything for their store)
CREATE POLICY "Owner can manage stores" ON stores FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Owner can manage categories" ON categories FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "Owner can manage products" ON products FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "Owner can manage acai_sizes" ON acai_sizes FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "Owner can manage acai_options" ON acai_options FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "Owner can manage delivery_zones" ON delivery_zones FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "Owner can manage orders" ON orders FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "Owner can manage order_items" ON order_items FOR ALL USING (order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
CREATE POLICY "Owner can manage order_item_options" ON order_item_options FOR ALL USING (order_item_id IN (SELECT id FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))));

-- Admin policies (admins can also manage)
CREATE POLICY "Admin can manage stores" ON stores FOR ALL USING (
  id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (
  store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (
  store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage acai_sizes" ON acai_sizes FOR ALL USING (
  store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage acai_options" ON acai_options FOR ALL USING (
  store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage delivery_zones" ON delivery_zones FOR ALL USING (
  store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage orders" ON orders FOR ALL USING (
  store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can read order_items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Admin can read order_item_options" ON order_item_options FOR SELECT USING (
  order_item_id IN (SELECT id FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT store_id FROM profiles WHERE id = auth.uid() AND role = 'admin')))
);

-- Indexes for performance
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_acai_sizes_store_id ON acai_sizes(store_id);
CREATE INDEX idx_acai_options_store_id ON acai_options(store_id);
CREATE INDEX idx_delivery_zones_store_id ON delivery_zones(store_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_item_options_order_item_id ON order_item_options(order_item_id);