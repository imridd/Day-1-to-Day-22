
CREATE DATABASE IF NOT EXISTS shop_training_cg;

USE shop_training_cg;

CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE = InnoDB;

INSERT IGNORE INTO products (sku, name, price, stock)
VALUES
('LAP-001', 'Laptop', 55000.00, 10),
('MOU-001', 'Wireless Mouse', 799.00, 40),
('KEY-001', 'Keyboard', 1599.00, 15),
('DES-001', 'Desktop', 25000.00, 20);
