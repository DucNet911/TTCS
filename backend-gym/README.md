# 🏋️ FitGear Backend API

Backend API cho hệ thống bán đồ thể thao FitGear.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Auth:** bcryptjs

## Cài đặt

```bash
cd backend-gym
npm install
```

## Cấu hình Database

1. Mở file `.env` và sửa thông tin kết nối MySQL:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fitgear_db
PORT=5000
```

2. Chạy file schema để tạo database:
```bash
mysql -u root -p < ../database/schema.sql
```

3. Chạy seed để thêm dữ liệu mẫu:
```bash
npm run seed
```

## Chạy Server

```bash
npm run dev
```

Server chạy tại: `http://localhost:5000`

## API Endpoints (22 Tables)

| # | Table | Endpoint | Methods |
|---|-------|----------|---------|
| - | Auth | `/api/auth` | POST login/register |
| 1 | STAFF | `/api/staff` | GET, POST, PUT, DELETE |
| 2 | CUSTOMERS | `/api/customers` | GET, POST, PUT, DELETE |
| 3 | CATEGORIES | `/api/categories` | GET, POST, PUT, DELETE |
| 4 | BRANDS | `/api/brands` | GET, POST, PUT, DELETE |
| 5 | SIZES | `/api/catalog/sizes` | GET, POST, PUT, DELETE |
| 6 | COLORS | `/api/catalog/colors` | GET, POST, PUT, DELETE |
| 7 | FITNESS_GOALS | `/api/catalog/fitness-goals` | GET, POST, PUT, DELETE |
| 8 | VOUCHERS | `/api/vouchers` | GET, POST, PUT, DELETE |
| 9 | PRODUCTS | `/api/products` | GET, POST, PUT, DELETE, PATCH |
| 10 | PRODUCT_SKUS | `/api/product-skus` | GET, POST, PUT, DELETE |
| 11 | PRODUCT_IMAGES | `/api/product-images` | GET, POST, PUT, DELETE |
| 12 | PRODUCT_GOALS | `/api/product-goals` | GET, POST, DELETE |
| 13 | CUSTOMER_GOALS | `/api/customer-goals` | GET, POST, DELETE |
| 14+15 | CARTS + CART_ITEMS | `/api/carts` | GET, POST, PUT, DELETE |
| 16+17 | WISHLIST + WISHLIST_ITEMS | `/api/wishlist` | GET, POST, DELETE |
| 18+19 | ORDERS + ORDER_ITEMS | `/api/orders` | GET, POST, PUT, DELETE |
| 20 | PAYMENTS | `/api/payments` | GET, PUT |
| 21 | SHIPPING | `/api/shipping` | GET, PUT |
| 22 | REVIEWS | `/api/reviews` | GET, POST, PUT, DELETE |

## Tài khoản mẫu

- **Admin:** username=`admin`, password=`admin123`
- **Customer:** email=`test@example.com`, password=`password`
