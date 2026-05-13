// Centralized API service - Kết nối Frontend với Backend
const API_BASE = 'http://localhost:5000/api';

// Helper function cho fetch
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ============ PRODUCTS ============
export const productAPI = {
  getAll: (params?: { category_id?: number; brand_id?: number; gender?: string }) => {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return fetchAPI<any[]>(`/products${query}`);
  },
  getById: (id: number) => fetchAPI<any>(`/products/${id}`),
  create: (data: any) => fetchAPI<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/products/${id}`, { method: 'DELETE' }),
};

// ============ PRODUCT SKUs ============
export const skuAPI = {
  getAll: (product_id?: number) => {
    const query = product_id ? `?product_id=${product_id}` : '';
    return fetchAPI<any[]>(`/product-skus${query}`);
  },
  create: (data: any) => fetchAPI<any>('/product-skus', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI<any>(`/product-skus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/product-skus/${id}`, { method: 'DELETE' }),
};

// ============ PRODUCT GOALS ============
export const productGoalAPI = {
  getByProduct: (product_id: number) => fetchAPI<any[]>(`/product-goals?product_id=${product_id}`),
  updateGoals: (product_id: number, goal_ids: number[]) => fetchAPI<any>(`/product-goals/${product_id}`, { method: 'PUT', body: JSON.stringify({ goal_ids }) }),
};

// ============ PRODUCT IMAGES ============
export const imageAPI = {
  getAll: (product_id?: number) => {
    const query = product_id ? `?product_id=${product_id}` : '';
    return fetchAPI<any[]>(`/product-images${query}`);
  },
  create: (data: any) => fetchAPI<any>('/product-images', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI<any>(`/product-images/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/product-images/${id}`, { method: 'DELETE' }),
};

// ============ CATALOG (Sizes, Colors, Goals) ============
export const catalogAPI = {
  getSizes: () => fetchAPI<any[]>('/catalog/sizes'),
  getColors: () => fetchAPI<any[]>('/catalog/colors'),
  getGoals: () => fetchAPI<any[]>('/catalog/fitness-goals'),
};

// ============ CATEGORIES ============
export const categoryAPI = {
  getAll: () => fetchAPI<any[]>('/categories'),
  getById: (id: number) => fetchAPI<any>(`/categories/${id}`),
};

// ============ BRANDS ============
export const brandAPI = {
  getAll: () => fetchAPI<any[]>('/brands'),
  create: (data: any) => fetchAPI<any>('/brands', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI<any>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/brands/${id}`, { method: 'DELETE' }),
};

// ============ ORDERS ============
export const orderAPI = {
  getAll: (params?: { customer_id?: number; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return fetchAPI<any[]>(`/orders${query}`);
  },
  getById: (id: number) => fetchAPI<any>(`/orders/${id}`),
  create: (data: any) => fetchAPI<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) => fetchAPI<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (id: number) => fetchAPI<any>(`/orders/${id}`, { method: 'DELETE' }),
};

// ============ CUSTOMERS ============
export const customerAPI = {
  getAll: () => fetchAPI<any[]>('/customers'),
  getById: (id: number) => fetchAPI<any>(`/customers/${id}`),
  update: (id: number, data: any) => fetchAPI<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI<any>(`/customers/${id}`, { method: 'DELETE' }),
  // Customer Goals (Mục tiêu thể hình)
  getGoals: (id: number) => fetchAPI<any[]>(`/customers/${id}/goals`),
  updateGoals: (id: number, goal_ids: number[]) => fetchAPI<any>(`/customers/${id}/goals`, { method: 'PUT', body: JSON.stringify({ goal_ids }) }),
  // Gợi ý sản phẩm cá nhân hóa
  getRecommendations: (id: number) => fetchAPI<any[]>(`/customers/${id}/recommendations`),
};

// ============ CARTS ============
export const cartAPI = {
  get: (customerId: number) => fetchAPI<any>(`/carts/${customerId}`),
  addItem: (customerId: number, sku_id: number, quantity: number = 1) =>
    fetchAPI<any>(`/carts/${customerId}/items`, { method: 'POST', body: JSON.stringify({ sku_id, quantity }) }),
  updateItem: (itemId: number, quantity: number) =>
    fetchAPI<any>(`/carts/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeItem: (itemId: number) =>
    fetchAPI<any>(`/carts/items/${itemId}`, { method: 'DELETE' }),
  clear: (customerId: number) =>
    fetchAPI<any>(`/carts/${customerId}`, { method: 'DELETE' }),
};

// ============ WISHLIST ============
export const wishlistAPI = {
  get: (customerId: number) => fetchAPI<any>(`/wishlist/${customerId}`),
  addItem: (customerId: number, product_id: number) =>
    fetchAPI<any>(`/wishlist/${customerId}/items`, { method: 'POST', body: JSON.stringify({ product_id }) }),
  removeItem: (itemId: number) =>
    fetchAPI<any>(`/wishlist/items/${itemId}`, { method: 'DELETE' }),
};

// ============ REVIEWS ============
export const reviewAPI = {
  getByProduct: (product_id: number) => fetchAPI<any[]>(`/reviews?product_id=${product_id}`),
  create: (data: any) => fetchAPI<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ============ VOUCHERS ============
export const voucherAPI = {
  getAll: () => fetchAPI<any[]>('/vouchers'),
  validate: (code: string) => fetchAPI<any>(`/vouchers/validate/${code}`),
};

// ============ PAYMENTS ============
export const paymentAPI = {
  getByOrder: (orderId: number) => fetchAPI<any>(`/payments?order_id=${orderId}`),
  updateStatus: (paymentId: number, status: string) => fetchAPI<any>(`/payments/${paymentId}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ============ SHIPPING ============
export const shippingAPI = {
  getByOrder: (orderId: number) => fetchAPI<any>(`/shipping?order_id=${orderId}`),
};

// ============ STAFF ============
export const staffAPI = {
  getAll: () => fetchAPI<any[]>('/staff'),
  create: (data: any) => fetchAPI<any>('/staff', { method: 'POST', body: JSON.stringify(data) }),
};
