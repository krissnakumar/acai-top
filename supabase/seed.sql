-- Seed data for Açaí Top

-- Insert store
INSERT INTO stores (id, name, slug, whatsapp_number, address, is_open, pickup_enabled, delivery_enabled)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Açaí Top',
  'acai-top',
  '11999998888',
  'Rua Principal, 123 - Centro',
  true,
  true,
  true
);

-- Insert categories
INSERT INTO categories (store_id, name, description, sort_order, is_active) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Açaí', 'Açaí tradicional e especial', 1, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Combos', 'Combos completos', 2, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bebidas', 'Sucos, águas e refrigerantes', 3, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Adicionais', 'Extras para seu pedido', 4, true);

-- Get category IDs
DO $$
DECLARE
  acai_cat_id UUID;
  combo_cat_id UUID;
  bebida_cat_id UUID;
  adicional_cat_id UUID;
BEGIN
  SELECT id INTO acai_cat_id FROM categories WHERE name = 'Açaí' AND store_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  SELECT id INTO combo_cat_id FROM categories WHERE name = 'Combos' AND store_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  SELECT id INTO bebida_cat_id FROM categories WHERE name = 'Bebidas' AND store_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  SELECT id INTO adicional_cat_id FROM categories WHERE name = 'Adicionais' AND store_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Insert products
  INSERT INTO products (store_id, category_id, name, description, price, is_available, is_featured, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', acai_cat_id, 'Açaí 300ml', 'Açaí cremoso no copo de 300ml', 12.00, true, true, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', acai_cat_id, 'Açaí 500ml', 'Açaí cremoso no copo de 500ml', 18.00, true, true, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', acai_cat_id, 'Açaí 700ml', 'Açaí cremoso no copo de 700ml', 24.00, true, true, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', combo_cat_id, 'Combo Açaí + Água', 'Açaí 500ml + Água mineral', 22.00, true, false, 4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', combo_cat_id, 'Combo Açaí + Suco', 'Açaí 500ml + Suco natural', 26.00, true, false, 5),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', bebida_cat_id, 'Suco Natural', 'Suco de frutas natural 500ml', 8.00, true, false, 6),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', bebida_cat_id, 'Água Mineral', 'Água mineral 500ml', 4.00, true, false, 7),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', bebida_cat_id, 'Refrigerante Lata', 'Coca-cola ou Guaraná 350ml', 5.00, true, false, 8),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', adicional_cat_id, 'Granola', 'Granola crocante', 2.00, true, false, 9),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', adicional_cat_id, 'Leite Condensado', 'Leite condensado extra', 3.00, true, false, 10);

  -- Insert acai sizes
  INSERT INTO acai_sizes (store_id, name, ml, base_price, max_free_toppings, max_free_fruits, is_active, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Copo 300ml', 300, 12.00, 3, 2, true, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Copo 500ml', 500, 18.00, 4, 3, true, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Copo 700ml', 700, 24.00, 5, 3, true, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tigela 1L', 1000, 35.00, 6, 4, true, 4);

  -- Insert acai options - Bases
  INSERT INTO acai_options (store_id, name, type, price, is_free, is_available, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Açaí tradicional', 'base', 0, true, true, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Açaí com banana', 'base', 0, true, true, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Açaí zero açúcar', 'base', 0, true, true, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cupuaçu', 'base', 0, true, true, 4);

  -- Insert acai options - Fruits
  INSERT INTO acai_options (store_id, name, type, price, is_free, is_available, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Banana', 'fruit', 0, true, true, 10),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Morango', 'fruit', 0, true, true, 11),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kiwi', 'fruit', 0, true, true, 12),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Manga', 'fruit', 0, true, true, 13),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Uva', 'fruit', 0, true, true, 14);

  -- Insert acai options - Toppings
  INSERT INTO acai_options (store_id, name, type, price, is_free, is_available, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Granola', 'topping', 0, true, true, 20),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Leite em pó', 'topping', 0, true, true, 21),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Paçoca', 'topping', 0, true, true, 22),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chocoball', 'topping', 0, true, true, 23),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Amendoim', 'topping', 0, true, true, 24),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coco ralado', 'topping', 0, true, true, 25),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Farinha láctea', 'topping', 0, true, true, 26),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Confete', 'topping', 0, true, true, 27),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Castanha', 'topping', 0, true, true, 28);

  -- Insert acai options - Syrups/Creams
  INSERT INTO acai_options (store_id, name, type, price, is_free, is_available, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Leite condensado', 'syrup', 0, true, true, 30),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nutella', 'syrup', 0, true, true, 31),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Creme de ninho', 'syrup', 0, true, true, 32),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Creme de avelã', 'syrup', 0, true, true, 33),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mel', 'syrup', 0, true, true, 34),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Calda de chocolate', 'syrup', 0, true, true, 35),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Calda de morango', 'syrup', 0, true, true, 36);

  -- Insert acai options - Paid extras
  INSERT INTO acai_options (store_id, name, type, price, is_free, is_available, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nutella extra', 'paid_extra', 4.00, false, true, 40),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Morango extra', 'paid_extra', 3.00, false, true, 41),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Leite Ninho extra', 'paid_extra', 3.00, false, true, 42),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ovomaltine', 'paid_extra', 4.00, false, true, 43),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Whey protein', 'paid_extra', 5.00, false, true, 44),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Açaí extra', 'paid_extra', 6.00, false, true, 45);

  -- Insert delivery zones
  INSERT INTO delivery_zones (store_id, name, fee, minimum_order, estimated_time, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Centro', 5.00, 15.00, '30-40 min', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bairro Alto', 7.00, 20.00, '40-50 min', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jardim Paulista', 8.00, 20.00, '45-60 min', true);
END $$;