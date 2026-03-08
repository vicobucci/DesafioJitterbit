-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(100) PRIMARY KEY,
  value DECIMAL(10, 2) NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_items_order_id ON items(order_id);
