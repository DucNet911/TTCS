-- ============================================================
-- FitGear - Quản lý sản phẩm qua MySQL
-- Chạy: Copy từng phần vào MySQL Workbench hoặc terminal
-- ============================================================

USE fitgear_db;

-- ============================================================
-- 1. XÓA TOÀN BỘ DỮ LIỆU (Reset sạch, giữ lại bảng)
-- Chạy theo thứ tự để tránh lỗi Foreign Key
-- ============================================================

-- Xóa dữ liệu phụ thuộc trước
DELETE FROM REVIEWS;
DELETE FROM SHIPPING;
DELETE FROM PAYMENTS;
DELETE FROM ORDER_ITEMS;
DELETE FROM ORDERS;
DELETE FROM CART_ITEMS;
DELETE FROM CARTS;
DELETE FROM WISHLIST_ITEMS;
DELETE FROM WISHLIST;
DELETE FROM CUSTOMER_GOALS;
DELETE FROM PRODUCT_GOALS;
DELETE FROM PRODUCT_IMAGES;
DELETE FROM PRODUCT_SKUS;
DELETE FROM PRODUCTS;

-- Reset AUTO_INCREMENT
ALTER TABLE PRODUCTS AUTO_INCREMENT = 1;
ALTER TABLE PRODUCT_SKUS AUTO_INCREMENT = 1;
ALTER TABLE PRODUCT_IMAGES AUTO_INCREMENT = 1;
ALTER TABLE ORDERS AUTO_INCREMENT = 1;

-- ============================================================
-- 2. THÊM SẢN PHẨM MỚI
-- Cú pháp: INSERT INTO PRODUCTS (...)
-- ============================================================

-- Ví dụ thêm 1 sản phẩm:
INSERT INTO PRODUCTS (name, description, base_price, material, gender, brand_id, category_id, staff_id)
VALUES (
  'Áo Chạy Bộ Nam AeroSwift',           -- tên sản phẩm
  'Vải nhẹ, thoáng khí cho tốc độ.',    -- mô tả
  450000,                                 -- giá gốc (VNĐ)
  '100% Polyester tái chế',              -- chất liệu
  'men',                                  -- giới tính: 'men', 'women', 'unisex'
  1,                                      -- brand_id (1=Nike, 2=Adidas, 3=Under Armour)
  1,                                      -- category_id (1=Quần áo, 2=Giày dép, 3=Dụng cụ, 4=Phụ kiện)
  1                                       -- staff_id (người tạo)
);

-- Ví dụ thêm nhiều sản phẩm cùng lúc:
-- INSERT INTO PRODUCTS (name, description, base_price, material, gender, brand_id, category_id, staff_id) VALUES
--   ('Sản phẩm 1', 'Mô tả 1', 500000, 'Polyester', 'men', 1, 1, 1),
--   ('Sản phẩm 2', 'Mô tả 2', 600000, 'Cotton', 'women', 2, 1, 1),
--   ('Sản phẩm 3', 'Mô tả 3', 350000, 'Nylon', 'unisex', 3, 2, 1);

-- ============================================================
-- 3. THÊM BIẾN THỂ (SKU) CHO SẢN PHẨM
-- Mỗi sản phẩm cần ít nhất 1 SKU (size + màu + giá + tồn kho)
-- ============================================================

-- Lấy product_id vừa thêm:
-- SELECT LAST_INSERT_ID(); -- hoặc SELECT * FROM PRODUCTS ORDER BY product_id DESC LIMIT 5;

-- Ví dụ thêm SKU cho product_id = 1:
INSERT INTO PRODUCT_SKUS (product_id, size_id, color_id, sku_code, stock, price) VALUES
  (1, 1, 1, 'AERO-S-BLK', 50, 450000),   -- Size S, Đen
  (1, 2, 1, 'AERO-M-BLK', 30, 450000),   -- Size M, Đen
  (1, 3, 1, 'AERO-L-BLK', 20, 450000),   -- Size L, Đen
  (1, 4, 1, 'AERO-XL-BLK', 15, 450000),  -- Size XL, Đen
  (1, 1, 2, 'AERO-S-WHT', 50, 450000),   -- Size S, Trắng
  (1, 2, 2, 'AERO-M-WHT', 30, 450000);   -- Size M, Trắng

-- ============================================================
-- 4. THÊM HÌNH ẢNH CHO SẢN PHẨM
-- ============================================================

INSERT INTO PRODUCT_IMAGES (product_id, image_url, is_primary) VALUES
  (1, 'https://example.com/image1.jpg', TRUE),   -- Ảnh chính
  (1, 'https://example.com/image2.jpg', FALSE);   -- Ảnh phụ

-- ============================================================
-- 5. BẢNG THAM CHIẾU - DÙNG KHI THÊM SẢN PHẨM
-- ============================================================

-- BRANDS (brand_id):
--   1 = Nike
--   2 = Adidas
--   3 = Under Armour

-- CATEGORIES (category_id):
--   1 = Quần áo
--   2 = Giày dép
--   3 = Dụng cụ
--   4 = Phụ kiện

-- SIZES (size_id):
--   1=S, 2=M, 3=L, 4=XL, 12=XXL
--   5=37, 6=38, 7=39, 8=40, 9=41, 10=42, 11=43

-- COLORS (color_id):
--   1 = Đen (#000000)
--   2 = Trắng (#FFFFFF)

-- GENDER:
--   'men', 'women', 'unisex'

-- ============================================================
-- 6. CÁC LỆNH KIỂM TRA HỮU ÍCH
-- ============================================================

-- Xem tất cả sản phẩm:
-- SELECT p.product_id, p.name, p.base_price, p.gender, b.name AS brand, c.name AS category
-- FROM PRODUCTS p
-- LEFT JOIN BRANDS b ON p.brand_id = b.brand_id
-- LEFT JOIN CATEGORIES c ON p.category_id = c.category_id
-- WHERE p.is_deleted = FALSE;

-- Xem SKU của 1 sản phẩm:
-- SELECT ps.*, s.name AS size, cl.name AS color
-- FROM PRODUCT_SKUS ps
-- LEFT JOIN SIZES s ON ps.size_id = s.size_id
-- LEFT JOIN COLORS cl ON ps.color_id = cl.color_id
-- WHERE ps.product_id = 1;

-- Xem tồn kho tổng:
-- SELECT p.name, SUM(ps.stock) AS total_stock
-- FROM PRODUCTS p
-- JOIN PRODUCT_SKUS ps ON p.product_id = ps.product_id
-- GROUP BY p.product_id;

-- Thêm brand mới:
-- INSERT INTO BRANDS (name, description, logo) VALUES ('Tên Brand', 'Slogan', 'URL logo');

-- Thêm màu mới:
-- INSERT INTO COLORS (name, hex_code) VALUES ('Đỏ', '#FF0000');

-- Thêm size mới:
-- INSERT INTO SIZES (name) VALUES ('2XL');
