const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customers');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const productRoutes = require('./routes/products');
const productSkuRoutes = require('./routes/productSkus');
const productImageRoutes = require('./routes/productImages');
const productGoalRoutes = require('./routes/productGoals');
const catalogRoutes = require('./routes/catalog');
const customerGoalRoutes = require('./routes/customerGoals');
const cartRoutes = require('./routes/carts');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const shippingRoutes = require('./routes/shipping');
const reviewRoutes = require('./routes/reviews');
const voucherRoutes = require('./routes/vouchers');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: '🏋️ FitGear API is running!',
    version: '1.0.0',
    tables: 22
  });
});

// Routes - 22 tables
app.use('/api/auth', authRoutes);            // Login/Register
app.use('/api/staff', staffRoutes);          // 1. STAFF
app.use('/api/customers', customerRoutes);   // 2. CUSTOMERS
app.use('/api/categories', categoryRoutes);  // 3. CATEGORIES
app.use('/api/brands', brandRoutes);         // 4. BRANDS
app.use('/api/catalog', catalogRoutes);      // 5. SIZES + 6. COLORS + 7. FITNESS_GOALS
app.use('/api/vouchers', voucherRoutes);     // 8. VOUCHERS
app.use('/api/products', productRoutes);     // 9. PRODUCTS
app.use('/api/product-skus', productSkuRoutes);     // 10. PRODUCT_SKUS
app.use('/api/product-images', productImageRoutes); // 11. PRODUCT_IMAGES
app.use('/api/product-goals', productGoalRoutes);   // 12. PRODUCT_GOALS
app.use('/api/customer-goals', customerGoalRoutes); // 13. CUSTOMER_GOALS
app.use('/api/carts', cartRoutes);           // 14. CARTS + 15. CART_ITEMS
app.use('/api/wishlist', wishlistRoutes);     // 16. WISHLIST + 17. WISHLIST_ITEMS
app.use('/api/orders', orderRoutes);         // 18. ORDERS + 19. ORDER_ITEMS
app.use('/api/payments', paymentRoutes);     // 20. PAYMENTS
app.use('/api/shipping', shippingRoutes);    // 21. SHIPPING
app.use('/api/reviews', reviewRoutes);       // 22. REVIEWS

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
