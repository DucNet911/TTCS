/**
 * Seed script - Chèn dữ liệu mẫu vào database fitgear_db
 * Chạy: npm run seed
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitgear_db',
    multipleStatements: true
  });

  const conn = await pool.getConnection();
  console.log('🌱 Seeding database...');

  try {
    // 1. STAFF
    const adminHash = await bcrypt.hash('admin123', 10);
    await conn.query(`INSERT IGNORE INTO STAFF (username, password_hash, full_name, role) VALUES
      ('admin', '${adminHash}', 'Administrator', 'admin')`);
    console.log('  ✅ STAFF seeded');

    // 2. CUSTOMERS
    const customerHash = await bcrypt.hash('password', 10);
    await conn.query(`INSERT IGNORE INTO CUSTOMERS (name, email, password_hash, phone, address, birth_date, gender) VALUES
      ('Nguyễn Văn A', 'test@example.com', '${customerHash}', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', '1990-01-01', 'Male'),
      ('Trần Thị B', 'user2@example.com', '${customerHash}', '0987654321', '456 Đường XYZ, Quận 7, TP.HCM', '1995-05-15', 'Female')`);
    console.log('  ✅ CUSTOMERS seeded');

    // 3. CATEGORIES
    await conn.query(`INSERT IGNORE INTO CATEGORIES (category_id, name, description) VALUES
      (1, 'Quần áo', 'Trang phục hiệu suất cho mọi môn thể thao'),
      (2, 'Giày dép', 'Giày chạy bộ, tập luyện và phong cách sống'),
      (3, 'Dụng cụ', 'Thiết bị gym và công cụ thể thao'),
      (4, 'Phụ kiện', 'Túi xách, mũ và nhiều thứ khác')`);
    console.log('  ✅ CATEGORIES seeded');

    // 4. BRANDS
    await conn.query(`INSERT IGNORE INTO BRANDS (brand_id, name, description, logo) VALUES
      (1, 'Nike', 'Just Do It', 'https://logo.clearbit.com/nike.com'),
      (2, 'Adidas', 'Impossible is Nothing', 'https://logo.clearbit.com/adidas.com'),
      (3, 'Under Armour', 'The Only Way is Through', 'https://logo.clearbit.com/underarmour.com')`);
    console.log('  ✅ BRANDS seeded');

    // 5. SIZES
    await conn.query(`INSERT IGNORE INTO SIZES (size_id, name) VALUES
      (1,'S'),(2,'M'),(3,'L'),(4,'XL'),(5,'37'),(6,'38'),(7,'39'),(8,'40'),(9,'41'),(10,'42'),(11,'43'),(12,'XXL')`);
    console.log('  ✅ SIZES seeded');

    // 6. COLORS
    await conn.query(`INSERT IGNORE INTO COLORS (color_id, name, hex_code) VALUES
      (1, 'Đen', '#000000'), (2, 'Trắng', '#FFFFFF')`);
    console.log('  ✅ COLORS seeded');

    // 7. FITNESS_GOALS
    await conn.query(`INSERT IGNORE INTO FITNESS_GOALS (goal_id, name, description) VALUES
      (1, 'Giảm cân', 'Đốt cháy mỡ và thon gọn'),
      (2, 'Tăng cơ', 'Xây dựng sức mạnh và khối lượng cơ'),
      (3, 'Sức bền', 'Cải thiện thể lực và tim mạch')`);
    console.log('  ✅ FITNESS_GOALS seeded');

    // 8. VOUCHERS
    await conn.query(`INSERT IGNORE INTO VOUCHERS (code, discount_type, discount_value, max_discount_amount, min_order_value, expiry_date, usage_limit) VALUES
      ('WELCOME10', 'Percent', 10, 100000, 500000, '2027-12-31', 1000),
      ('MINUS50K', 'Fixed', 50000, NULL, 300000, '2027-12-31', 500)`);
    console.log('  ✅ VOUCHERS seeded');

    // 9. PRODUCTS (sample - 10 products)
    await conn.query(`INSERT IGNORE INTO PRODUCTS (product_id, name, description, base_price, material, gender, brand_id, category_id, staff_id) VALUES
      (1, 'Áo chạy bộ Nam AeroSwift', 'Vải nhẹ, thoáng khí được thiết kế cho tốc độ.', 450000, '100% Polyester tái chế', 'men', 1, 1, 1),
      (3, 'Tạ tay Nam Nữ GripMaster (10kg)', 'Thiết kế công thái học giúp cầm nắm chắc chắn.', 350000, 'Gang & Neoprene', 'unisex', 3, 3, 1),
      (4, 'Quần bó Nữ Elite Compression', 'Hỗ trợ cơ bắp và cải thiện thời gian phục hồi.', 550000, 'Hỗn hợp Spandex', 'women', 1, 1, 1),
      (5, 'Áo Bra Thể Thao Nữ Vital', 'Hỗ trợ tối đa cho các bài tập cường độ cao.', 380000, 'Nylon & Elastane', 'women', 1, 1, 1),
      (6, 'Quần Short Nam Arrival', 'Nhẹ và linh hoạt cho mọi hoạt động.', 250000, 'Polyester', 'men', 2, 1, 1),
      (19, 'Giày Chạy Bộ Air Zoom Pegasus', 'Đệm êm ái, phản hồi lực tốt.', 3200000, 'Lưới & Zoom Air', 'unisex', 1, 2, 1),
      (22, 'Giày Tập Gym Metcon 8', 'Đế bằng, cực kỳ ổn định khi squat.', 3500000, 'Lưới bền bỉ', 'unisex', 1, 2, 1),
      (29, 'Thảm Tập Yoga TPE 6mm', 'Chống trơn trượt, độ bám cao.', 450000, 'TPE', 'unisex', 3, 3, 1),
      (39, 'Mũ Lưỡi Trai Nike Heritage', 'Phong cách thể thao cổ điển.', 550000, 'Cotton', 'unisex', 1, 4, 1),
      (7, 'Bình Nước Thép Không Gỉ', 'Giữ lạnh đến 24 giờ.', 200000, 'Thép không gỉ', 'unisex', 3, 4, 1)`);
    console.log('  ✅ PRODUCTS seeded');

    // 10. PRODUCT_SKUS (sample)
    await conn.query(`INSERT IGNORE INTO PRODUCT_SKUS (product_id, size_id, color_id, sku_code, stock, price) VALUES
      (1, 1, 1, 'NIKE-AERO-S-BLK', 50, 450000),
      (1, 2, 1, 'NIKE-AERO-M-BLK', 30, 450000),
      (1, 3, 1, 'NIKE-AERO-L-BLK', 20, 450000),
      (1, 1, 2, 'NIKE-AERO-S-WHT', 50, 450000),
      (1, 2, 2, 'NIKE-AERO-M-WHT', 30, 450000),
      (4, 1, 1, 'NIKE-ELITE-S-BLK', 40, 550000),
      (4, 2, 1, 'NIKE-ELITE-M-BLK', 35, 550000),
      (19, 8, 1, 'ZOOM-40-BLK', 25, 3200000),
      (19, 9, 1, 'ZOOM-41-BLK', 20, 3200000),
      (3, 2, 1, 'GRIP-M-BLK', 30, 350000),
      (29, 2, 1, 'YOGA-M-BLK', 40, 450000)`);
    console.log('  ✅ PRODUCT_SKUS seeded');

    // 12. PRODUCT_GOALS
    await conn.query(`INSERT IGNORE INTO PRODUCT_GOALS (product_id, goal_id) VALUES (1, 3), (1, 1), (3, 2), (4, 3)`);
    console.log('  ✅ PRODUCT_GOALS seeded');

    console.log('\n🎉 Seed completed successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
