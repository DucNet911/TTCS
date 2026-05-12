# 🏋️ FitGear - E-commerce Thời Trang Thể Thao

> Hệ thống thương mại điện tử Full-Stack chuyên về trang phục và dụng cụ thể thao/gym.

---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cơ Sở Dữ Liệu](#-cơ-sở-dữ-liệu)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Chạy Dự Án](#-chạy-dự-án)
- [API Endpoints](#-api-endpoints)
- [Tài Khoản Mẫu](#-tài-khoản-mẫu)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)

---

## 🎯 Tổng Quan

**FitGear** là một website thương mại điện tử cho phép khách hàng duyệt, tìm kiếm và mua sắm các sản phẩm thời trang thể thao. Hệ thống bao gồm:

- **Trang khách hàng**: Duyệt sản phẩm, giỏ hàng, wishlist, đặt hàng, thanh toán
- **Trang quản trị (Admin)**: Quản lý sản phẩm, đơn hàng, khách hàng

---

## 🏗 Kiến Trúc Hệ Thống

```
┌──────────────────┐     HTTP/REST      ┌──────────────────┐     MySQL2      ┌──────────────────┐
│                  │  ←───────────────→  │                  │  ←───────────→  │                  │
│   Frontend       │    Port 3000        │   Backend        │    Port 3306   │   MySQL 8.0      │
│   React + Vite   │                     │   Node + Express │                │   fitgear_db     │
│   TailwindCSS    │                     │   RESTful API    │                │   22 Tables      │
│                  │                     │   Port 5000      │                │                  │
└──────────────────┘                     └──────────────────┘                └──────────────────┘
```

---

## 🛠 Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React | 19.0.0 | Thư viện xây dựng giao diện |
| Vite | 6.2.0 | Build tool & dev server |
| TypeScript | 5.8.2 | Kiểm tra kiểu dữ liệu |
| TailwindCSS | 4.1.14 | CSS framework |
| React Router DOM | 7.13.2 | Điều hướng trang |
| Lucide React | 0.546.0 | Bộ icon |
| Motion (Framer) | 12.23.24 | Hiệu ứng animation |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| Node.js | — | Runtime JavaScript |
| Express | 4.21.2 | Web framework |
| MySQL2 | 3.11.0 | Driver kết nối MySQL (hỗ trợ Promise) |
| bcryptjs | 2.4.3 | Mã hóa mật khẩu |
| cors | 2.8.5 | Cross-Origin Resource Sharing |
| dotenv | 16.4.5 | Quản lý biến môi trường |
| nodemon | 3.1.4 | Auto-restart khi phát triển |

### Database
| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| MySQL | 8.0 | Hệ quản trị CSDL quan hệ |

---

## 🗄 Cơ Sở Dữ Liệu

Hệ thống sử dụng **22 bảng** trong database `fitgear_db`:

| # | Bảng | Mô tả |
|---|------|-------|
| 1 | `STAFF` | Nhân viên / Quản trị viên |
| 2 | `CUSTOMERS` | Khách hàng |
| 3 | `CATEGORIES` | Danh mục sản phẩm (hỗ trợ phân cấp) |
| 4 | `BRANDS` | Thương hiệu |
| 5 | `SIZES` | Kích cỡ (S, M, L, XL, 37-43...) |
| 6 | `COLORS` | Màu sắc (kèm mã hex) |
| 7 | `FITNESS_GOALS` | Mục tiêu tập luyện |
| 8 | `VOUCHERS` | Mã giảm giá |
| 9 | `PRODUCTS` | Sản phẩm (soft delete) |
| 10 | `PRODUCT_SKUS` | Biến thể sản phẩm (size + color + giá + tồn kho) |
| 11 | `PRODUCT_IMAGES` | Hình ảnh sản phẩm |
| 12 | `PRODUCT_GOALS` | Liên kết sản phẩm ↔ mục tiêu |
| 13 | `CUSTOMER_GOALS` | Liên kết khách hàng ↔ mục tiêu |
| 14 | `CARTS` | Giỏ hàng |
| 15 | `CART_ITEMS` | Chi tiết giỏ hàng |
| 16 | `WISHLIST` | Danh sách yêu thích |
| 17 | `WISHLIST_ITEMS` | Chi tiết wishlist |
| 18 | `ORDERS` | Đơn hàng |
| 19 | `ORDER_ITEMS` | Chi tiết đơn hàng |
| 20 | `PAYMENTS` | Thanh toán |
| 21 | `SHIPPING` | Vận chuyển |
| 22 | `REVIEWS` | Đánh giá sản phẩm |

---

## 💻 Yêu Cầu Hệ Thống

Trước khi cài đặt, hãy đảm bảo máy tính đã cài:

- **Node.js** >= 18.x — [Tải tại đây](https://nodejs.org/)
- **MySQL** >= 8.0 — [Tải tại đây](https://dev.mysql.com/downloads/installer/)
- **Git** (tuỳ chọn) — [Tải tại đây](https://git-scm.com/)

Kiểm tra bằng lệnh:
```bash
node -v      # v18.x.x trở lên
npm -v       # 9.x.x trở lên
mysql --version   # Ver 8.0.x
```

---

## 📦 Hướng Dẫn Cài Đặt

### Bước 1: Tạo Database

Mở MySQL và chạy file schema:

```bash
mysql -u root -p < database/schema.sql
```

Hoặc mở MySQL Workbench / phpMyAdmin, copy nội dung file `database/schema.sql` và thực thi.

### Bước 2: Cấu hình Backend

```bash
# Di chuyển vào thư mục backend
cd backend-gym

# Cài đặt dependencies
npm install
```

Tạo file `.env` (hoặc chỉnh sửa file có sẵn):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fitgear_db

PORT=5000
```

> ⚠️ **Lưu ý**: Thay `your_mysql_password` bằng mật khẩu MySQL thực tế của bạn. Nếu không có mật khẩu, để trống.

### Bước 3: Seed dữ liệu mẫu

```bash
# Trong thư mục backend-gym
npm run seed
```

Kết quả mong đợi:
```
🌱 Seeding database...
  ✅ STAFF seeded
  ✅ CUSTOMERS seeded
  ✅ CATEGORIES seeded
  ✅ BRANDS seeded
  ✅ SIZES seeded
  ✅ COLORS seeded
  ✅ FITNESS_GOALS seeded
  ✅ VOUCHERS seeded
  ✅ PRODUCTS seeded
  ✅ PRODUCT_SKUS seeded
  ✅ PRODUCT_GOALS seeded

🎉 Seed completed successfully!
```

### Bước 4: Cài đặt Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend-gym

# Cài đặt dependencies
npm install
```

---

## 🚀 Chạy Dự Án

### Cách 1: Chạy từng phần riêng biệt

**Terminal 1 — Backend (Port 5000):**
```bash
cd backend-gym
npm run dev
```

**Terminal 2 — Frontend (Port 3000):**
```bash
cd frontend-gym
npm run dev
```

### Cách 2: Chạy nhanh cả hai

Mở 2 cửa sổ Terminal cạnh nhau và chạy lệnh tương ứng.

### Kiểm tra hệ thống

| Thành phần | URL | Mô tả |
|------------|-----|-------|
| Frontend | http://localhost:3000 | Giao diện người dùng |
| Backend API | http://localhost:5000/api | Health check API |

Khi backend chạy thành công:
```
╔══════════════════════════════════════════╗
║    🏋️  FitGear Backend API Server       ║
║    📡 Running on: http://localhost:5000  ║
║    📦 Database:   fitgear_db             ║
║    📋 Tables:     22                     ║
╚══════════════════════════════════════════╝
```

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### 🔐 Xác thực (Auth)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login/customer` | Đăng nhập khách hàng |
| POST | `/api/auth/login/staff` | Đăng nhập nhân viên/admin |
| POST | `/api/auth/register` | Đăng ký khách hàng mới |

### 👤 Quản lý người dùng
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/staff` | Danh sách nhân viên |
| GET | `/api/customers` | Danh sách khách hàng |
| POST | `/api/customers` | Tạo khách hàng |
| PUT | `/api/customers/:id` | Cập nhật khách hàng |

### 📦 Sản phẩm
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm |
| PUT | `/api/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Xóa mềm sản phẩm |
| GET | `/api/product-skus` | Danh sách SKU |
| POST | `/api/product-skus` | Tạo SKU |
| GET | `/api/product-images` | Hình ảnh sản phẩm |

### 🏷 Danh mục & Thương hiệu
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/brands` | Danh sách thương hiệu |
| GET | `/api/catalog/sizes` | Danh sách kích cỡ |
| GET | `/api/catalog/colors` | Danh sách màu sắc |
| GET | `/api/catalog/goals` | Danh sách mục tiêu |
| GET | `/api/vouchers` | Danh sách voucher |

### 🛒 Giỏ hàng & Wishlist
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/carts/:customerId` | Lấy giỏ hàng |
| POST | `/api/carts/:customerId/items` | Thêm vào giỏ |
| PUT | `/api/carts/items/:itemId` | Cập nhật số lượng |
| DELETE | `/api/carts/items/:itemId` | Xóa khỏi giỏ |
| GET | `/api/wishlist/:customerId` | Lấy wishlist |
| POST | `/api/wishlist/:customerId/items` | Thêm vào wishlist |

### 📋 Đơn hàng
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders` | Danh sách đơn hàng |
| GET | `/api/orders/:id` | Chi tiết đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng (có Pessimistic Locking) |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái |
| GET | `/api/payments` | Thông tin thanh toán |
| GET | `/api/shipping` | Thông tin vận chuyển |

### ⭐ Đánh giá
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/reviews?product_id=X` | Đánh giá sản phẩm |
| POST | `/api/reviews` | Viết đánh giá |

---

## 🔑 Tài Khoản Mẫu

Sau khi chạy `npm run seed`, hệ thống có sẵn các tài khoản:

### Admin / Staff
| Username | Password | Vai trò |
|----------|----------|---------|
| `admin` | `admin123` | Quản trị viên |

### Khách hàng
| Email | Password | Tên |
|-------|----------|-----|
| `test@example.com` | `password` | Nguyễn Văn A |
| `user2@example.com` | `password` | Trần Thị B |

### Voucher mẫu
| Mã | Loại | Giá trị | Điều kiện |
|----|------|---------|-----------|
| `WELCOME10` | Giảm % | 10% (tối đa 100.000đ) | Đơn tối thiểu 500.000đ |
| `MINUS50K` | Giảm cố định | 50.000đ | Đơn tối thiểu 300.000đ |

---

## 📁 Cấu Trúc Thư Mục

```
TTCS/
├── 📂 backend-gym/              # Backend API
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── db.js            # Kết nối MySQL (Connection Pool)
│   │   ├── 📂 routes/
│   │   │   ├── auth.js          # Xác thực (Login/Register)
│   │   │   ├── staff.js         # CRUD nhân viên
│   │   │   ├── customers.js     # CRUD khách hàng
│   │   │   ├── categories.js    # CRUD danh mục
│   │   │   ├── brands.js        # CRUD thương hiệu
│   │   │   ├── products.js      # CRUD sản phẩm
│   │   │   ├── productSkus.js   # CRUD biến thể (SKU)
│   │   │   ├── productImages.js # CRUD hình ảnh
│   │   │   ├── productGoals.js  # Liên kết sản phẩm-mục tiêu
│   │   │   ├── catalog.js       # Sizes, Colors, Goals
│   │   │   ├── customerGoals.js # Liên kết KH-mục tiêu
│   │   │   ├── carts.js         # Giỏ hàng
│   │   │   ├── wishlist.js      # Danh sách yêu thích
│   │   │   ├── orders.js        # Đơn hàng (Pessimistic Locking)
│   │   │   ├── payments.js      # Thanh toán
│   │   │   ├── shipping.js      # Vận chuyển
│   │   │   ├── reviews.js       # Đánh giá
│   │   │   └── vouchers.js      # Mã giảm giá
│   │   ├── app.js               # Cấu hình Express & Routes
│   │   ├── server.js            # Entry point
│   │   └── seed.js              # Script chèn dữ liệu mẫu
│   ├── .env                     # Biến môi trường
│   └── package.json
│
├── 📂 frontend-gym/             # Frontend React
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Navbar.tsx       # Thanh điều hướng
│   │   │   ├── MegaMenu.tsx     # Menu dropdown
│   │   │   ├── ProductCard.tsx  # Card sản phẩm
│   │   │   ├── ProductListing.tsx # Danh sách sản phẩm
│   │   │   ├── CartDrawer.tsx   # Giỏ hàng (drawer)
│   │   │   └── SearchOverlay.tsx # Tìm kiếm
│   │   ├── 📂 pages/
│   │   │   ├── Home.tsx         # Trang chủ
│   │   │   ├── ProductDetail.tsx # Chi tiết sản phẩm
│   │   │   ├── CategoryPage.tsx # Trang danh mục
│   │   │   ├── Men.tsx          # Sản phẩm Nam
│   │   │   ├── Women.tsx        # Sản phẩm Nữ
│   │   │   ├── Accessories.tsx  # Phụ kiện
│   │   │   ├── Checkout.tsx     # Thanh toán
│   │   │   ├── Account.tsx      # Tài khoản
│   │   │   ├── Wishlist.tsx     # Yêu thích
│   │   │   ├── SearchResults.tsx # Kết quả tìm kiếm
│   │   │   ├── InfoPage.tsx     # Trang thông tin
│   │   │   ├── AdminProducts.tsx # Admin: Sản phẩm
│   │   │   ├── AdminOrders.tsx  # Admin: Đơn hàng
│   │   │   └── AdminCustomers.tsx # Admin: Khách hàng
│   │   ├── AuthContext.tsx      # Context xác thực
│   │   ├── CartContext.tsx      # Context giỏ hàng
│   │   ├── WishlistContext.tsx  # Context wishlist
│   │   ├── types.ts             # TypeScript types
│   │   ├── App.tsx              # Router chính
│   │   └── main.tsx             # Entry point
│   ├── vite.config.ts
│   └── package.json
│
├── 📂 database/
│   └── schema.sql               # Schema 22 bảng
│
├── 📂 Diagram/
│   └── TTCS.vpp                 # Sơ đồ UML (Visual Paradigm)
│
├── 📂 BaoCao/
│   └── NoiDung_BaoCao.txt       # Nội dung báo cáo
│
└── README.md                    # 📌 File này
```

---

## ⭐ Tính Năng Nổi Bật

### 🔒 Xử lý đặt hàng đồng thời (Race Condition)
Hệ thống sử dụng **Pessimistic Locking** (`SELECT ... FOR UPDATE`) để đảm bảo:
- Khi 2 người mua cùng 1 sản phẩm cuối cùng → chỉ 1 người mua được
- Người thứ 2 nhận thông báo "Sản phẩm đã hết hàng" (HTTP 409)
- Không bao giờ bán quá số lượng tồn kho

### 🗑 Soft Delete
Sản phẩm và SKU sử dụng cột `is_deleted` thay vì xóa cứng, giúp bảo toàn dữ liệu lịch sử.

### 🔐 Xác thực & Phân quyền
- Mật khẩu được mã hóa bằng **bcryptjs** (hash 10 rounds)
- Phân biệt 2 loại tài khoản: **Customer** và **Staff/Admin**
- Context-based authentication trên Frontend (React Context API)

### 📦 Quản lý tồn kho theo SKU
Mỗi sản phẩm có nhiều biến thể (SKU) theo size + color, mỗi biến thể có giá và tồn kho riêng.

### 🎯 Gợi ý sản phẩm cá nhân hóa (Personalized Recommendations)
Dựa vào mục tiêu thể hình (FITNESS_GOALS) do khách hàng thiết lập, hệ thống sử dụng truy vấn SQL đa bảng (JOIN `PRODUCTS`, `PRODUCT_GOALS`, `CUSTOMER_GOALS`, `FITNESS_GOALS`) để đề xuất các sản phẩm phù hợp nhất ngay tại Trang chủ.

### ☁️ Đồng bộ Giỏ hàng & Yêu thích (Cloud Sync)
Dữ liệu Giỏ hàng (Cart) và Danh sách yêu thích (Wishlist) được lưu trữ trực tiếp trên Database (`CARTS`, `CART_ITEMS`, `WISHLIST`, `WISHLIST_ITEMS`). Điều này giúp đồng bộ dữ liệu xuyên suốt các thiết bị thay vì phụ thuộc vào `localStorage`. `localStorage` chỉ được sử dụng duy nhất cho Session đăng nhập (Chuẩn SPA).

### 🎟 Hệ thống Voucher
Hỗ trợ 2 loại: giảm theo phần trăm (%) và giảm cố định (VNĐ), kèm điều kiện đơn tối thiểu và giới hạn sử dụng.

### 🚚 Tự động tạo Shipping & Payment
Khi đặt hàng, hệ thống tự động tạo bản ghi thanh toán và vận chuyển. Miễn phí ship cho đơn ≥ 2.000.000đ.

---

## 🐛 Xử Lý Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `MySQL connection failed` | MySQL chưa bật hoặc sai thông tin | Kiểm tra MySQL đang chạy, kiểm tra `.env` |
| `ECONNREFUSED :5000` | Backend chưa chạy | Chạy `npm run dev` trong `backend-gym` |
| `CORS error` | Frontend gọi sai port | Đảm bảo Frontend chạy port 3000 |
| `ER_NO_SUCH_TABLE` | Chưa tạo database | Chạy `database/schema.sql` trước |
| `ER_DUP_ENTRY` | Seed dữ liệu lần 2 | Dùng `INSERT IGNORE`, có thể bỏ qua |

---

## 📄 Giấy Phép

Dự án này được phát triển phục vụ mục đích học tập — Thực Tập Cơ Sở (TTCS).

---

> 💪 **FitGear** — *Gear Up. Work Out. Stand Out.*
