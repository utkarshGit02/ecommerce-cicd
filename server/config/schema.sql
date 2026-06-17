-- Run this file to set up your MySQL database
-- mysql -u root -p < server/config/schema.sql


-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  stock       INT DEFAULT 0,
  image_url   VARCHAR(500),
  category_id INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  total      DECIMAL(10,2) NOT NULL,
  status     ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  address    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT DEFAULT 1,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed: categories
INSERT IGNORE INTO categories (name, slug) VALUES
  ('Electronics',  'electronics'),
  ('Clothing',     'clothing'),
  ('Books',        'books'),
  ('Home & Garden','home-garden');

-- Seed: sample products
INSERT IGNORE INTO products (name, description, price, stock, image_url, category_id) VALUES
  ('Wireless Headphones', 'Premium sound quality with noise cancellation', 2499.00, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1),
  ('Mechanical Keyboard',  'RGB backlit, tactile switches',                 3999.00, 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 1),
  ('Running Shoes',        'Lightweight, breathable mesh upper',             1899.00, 80, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 2),
  ('JavaScript: The Good Parts', 'Classic JS book by Douglas Crockford',    599.00,  100,'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 3),
  ('Smart LED Bulb',       'Wi-Fi enabled, 16 million colors',               499.00,  200,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 4),
  ('Bluetooth Speaker',    'Portable, waterproof, 12hr battery',            1599.00,  60, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 1);
