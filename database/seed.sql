-- ============================================================
-- Seed data: 4 pickup counters + a starter menu.
-- Run this after schema.sql.
-- ============================================================

USE canteen_system;

INSERT INTO counters (name) VALUES
  ('Counter 1'), ('Counter 2'), ('Counter 3'), ('Counter 4');

INSERT INTO menu_items (name, description, category, price, capacity) VALUES
  ('Masala Dosa', 'Crispy dosa with spiced potato filling', 'breakfast', 40.00, 20),
  ('Ghee Dosa', 'Classic dosa with ghee', 'breakfast', 50.00, 20),
  ('Vada', 'Crispy fried lentil fritters', 'breakfast', 10.00, 30),
  ('Veg Biryani', 'Spiced rice with mixed vegetables', 'lunch', 65.00, 20),
  ('Fried Rice', 'Wok-tossed vegetable fried rice', 'lunch', 60.00, 20),
  ('Chole Bhature', 'Spiced chickpea curry with fried bread', 'lunch', 70.00, 15),
  ('Cold Coffee', 'Chilled coffee with ice cream', 'snacks', 30.00, 20),
  ('Paneer Roll', 'Paneer wrap with mint chutney', 'snacks', 50.00, 15),
  ('Tea', 'Hot masala chai', 'snacks', 10.00, 40);
