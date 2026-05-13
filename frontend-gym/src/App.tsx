import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { AuthProvider, useAuth } from './AuthContext';
import { Home } from './pages/Home';
import { Women } from './pages/Women';
import { Men } from './pages/Men';
import { Accessories } from './pages/Accessories';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Account } from './pages/Account';
import { SearchResults } from './pages/SearchResults';
import { CategoryPage } from './pages/CategoryPage';
import { InfoPage } from './pages/InfoPage';
import { AdminOrders } from './pages/AdminOrders';
import { AdminProducts } from './pages/AdminProducts';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminReports } from './pages/AdminReports';
import { AdminReviews } from './pages/AdminReviews';
import { Link } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { isAdmin } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/checkout';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!isCheckoutPage && !isAdminPage && <Navbar onOpenCart={() => setIsCartOpen(true)} />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/women" element={<Women />} />
        <Route path="/men" element={<Men />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<Account />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:gender/:section/:item" element={<CategoryPage />} />
        <Route path="/info/:slug" element={<InfoPage />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
      </Routes>

      {!isCheckoutPage && !isAdminPage && (
        <footer className="bg-[#111111] text-white pt-20 pb-10">
          <div className="px-4 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-3xl font-black mb-6">FITGEAR</h2>
                <p className="text-gray-400 text-sm max-w-sm mb-8 font-medium">
                  Thương hiệu rèn luyện thể chất. Chúng tôi tồn tại để kết nối cộng đồng vận động viên.
                </p>
                <div className="flex gap-6">
                  {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map(social => (
                    <a key={social} href="#" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                      {social}
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-[11px] font-black uppercase mb-6 tracking-[0.2em] text-white">Hỗ trợ</h4>
                <ul className="space-y-4 text-[13px] font-medium text-gray-400">
                  <li><Link to="/info/shipping-info" className="hover:text-white transition-colors">Thông tin giao hàng</Link></li>
                  <li><Link to="/info/returns-policy" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
                  <li><Link to="/info/orders" className="hover:text-white transition-colors">Đơn hàng</Link></li>
                  <li><Link to="/info/help-center" className="hover:text-white transition-colors">Trung tâm hỗ trợ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase mb-6 tracking-[0.2em] text-white">Trang</h4>
                <ul className="space-y-4 text-[13px] font-medium text-gray-400">
                  <li><Link to="/info/about-us" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                  <li><Link to="/info/student-discount" className="hover:text-white transition-colors">Giảm giá sinh viên</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase mb-6 tracking-[0.2em] text-white">Tài khoản</h4>
                <ul className="space-y-4 text-[13px] font-medium text-gray-400">
                  <li><Link to="/account" className="hover:text-white transition-colors">Tài khoản của tôi</Link></li>
                  <li><Link to="/account?mode=register" className="hover:text-white transition-colors">Đăng ký</Link></li>
                  {isAdmin && (
                    <li><Link to="/admin/orders" className="text-amber-400 font-black hover:text-amber-300 transition-colors uppercase text-[11px] tracking-widest">Quản trị Đơn hàng</Link></li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <p>© 2026 FITGEAR. BẢO LƯU MỌI QUYỀN.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Thông báo bảo mật</a>
                <a href="#" className="hover:text-white transition-colors">Điều khoản & Điều kiện</a>
                <a href="#" className="hover:text-white transition-colors">Chính sách Cookie</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
