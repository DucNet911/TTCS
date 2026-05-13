// ============================================================
// Type Definitions - Chỉ chứa interfaces, KHÔNG có mock data
// Tất cả dữ liệu được fetch từ Backend API (xem api.ts)
// ============================================================

export interface Category {
  category_id: number;
  name: string;
  description: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  brand_id: number;
  name: string;
  description: string;
  logo: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  base_price: number;
  material: string;
  brand_id: number;
  category_id: number;
  gender: 'men' | 'women' | 'unisex';
  status?: 'in_stock' | 'out_of_stock';
  staff_id?: number;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined fields from API
  brand_name?: string;
  category_name?: string;
  primary_image?: string;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

export interface FitnessGoal {
  goal_id: number;
  name: string;
  description: string;
}

export interface ProductGoal {
  pg_id: number;
  product_id: number;
  goal_id: number;
}

export interface Size {
  size_id: number;
  name: string;
}

export interface Color {
  color_id: number;
  name: string;
  hex_code: string;
}

export interface ProductSKU {
  sku_id: number;
  product_id: number;
  size_id: number;
  color_id: number;
  sku_code: string;
  stock: number;
  price: number;
  is_deleted?: boolean;
  // Joined fields from API
  size_name?: string;
  color_name?: string;
  hex_code?: string;
  product_name?: string;
}

export interface Staff {
  staff_id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  customer_id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  address: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other' | 'Male' | 'Female' | 'Other';
  status: 'active' | 'inactive' | 'Active' | 'Inactive' | 'Banned';
  register_date: string;
  role?: 'admin' | 'customer';
  updated_at?: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  staff_id?: number;
  voucher_id?: number;
  order_date: string;
  total_amount: number;
  discount_amount?: number;
  status: 'Pending' | 'Confirmed' | 'Shipping' | 'Completed' | 'Canceled';
  shipping_address: string;
  payment_method: 'COD' | 'Credit Card' | 'Bank Transfer';
  updated_at?: string;
  // Joined fields
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  voucher_code?: string;
  items?: OrderItem[];
  payment?: Payment;
  shipping?: Shipping;
  // From list JOIN
  payment_status?: string;
  payment_id?: number;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  sku_id: number;
  quantity: number;
  price_at_order: number;
  // Joined fields
  sku_code?: string;
  product_id?: number;
  product_name?: string;
  size_name?: string;
  color_name?: string;
  hex_code?: string;
  image_url?: string;
}

export interface Wishlist {
  wishlist_id: number;
  customer_id: number;
  created_date: string;
}

export interface WishlistItem {
  wishlist_item_id: number;
  wishlist_id: number;
  product_id: number;
}

export interface Review {
  review_id: number;
  product_id: number;
  customer_id: number;
  order_id: number;
  rating: number;
  comment: string;
  review_date: string;
  // Joined
  customer_name?: string;
}

export interface Shipping {
  shipping_id: number;
  order_id: number;
  shipping_method: string;
  shipping_fee: number;
  ship_date?: string;
  delivery_date?: string;
  tracking_number?: string;
  status: string;
}

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_date: string;
  amount: number;
  status: string;
  transaction_id: string;
}

export interface Voucher {
  voucher_id: number;
  code: string;
  discount_type: 'Percent' | 'Fixed';
  discount_value: number;
  max_discount_amount?: number;
  min_order_value: number;
  expiry_date: string;
  usage_limit: number;
  used_count?: number;
  created_at?: string;
}

export interface Cart {
  cart_id: number;
  customer_id: number;
  created_date: string;
  items?: CartItem[];
}

export interface CartItem {
  cart_item_id: number;
  cart_id: number;
  sku_id: number;
  quantity: number;
  // Joined fields from API
  sku_code?: string;
  price?: number;
  stock?: number;
  product_id?: number;
  product_name?: string;
  size_name?: string;
  color_name?: string;
  hex_code?: string;
  image_url?: string;
}

export interface CustomerGoal {
  cg_id: number;
  customer_id: number;
  goal_id: number;
  start_date: string;
}
