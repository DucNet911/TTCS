import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { ChevronLeft, Info, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Checkout = () => {
  const { cart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-[18px] font-black uppercase mb-6">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="bg-brand-dark text-white px-8 py-4 uppercase text-xs font-black tracking-widest hover:bg-gray-800 transition-colors">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  const shippingFee = totalPrice > 2000000 ? 0 : 30000;

  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount_type === 'percentage') {
      discountAmount = (totalPrice * appliedVoucher.discount_value) / 100;
      if (appliedVoucher.max_discount_amount && discountAmount > appliedVoucher.max_discount_amount) {
        discountAmount = appliedVoucher.max_discount_amount;
      }
    } else if (appliedVoucher.discount_type === 'fixed') {
      discountAmount = appliedVoucher.discount_value;
    }
  }

  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  const handleApplyVoucher = async () => {
    setVoucherError('');
    if (!discountCode) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers`);
      const vouchers = await res.json();
      const voucher = vouchers.find((v: any) => v.code === discountCode.toUpperCase());
      if (!voucher) {
        setVoucherError('Mã giảm giá không tồn tại');
        return;
      }
      if (totalPrice < voucher.min_order_value) {
        setVoucherError(`Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(voucher.min_order_value)}đ để áp dụng mã này`);
        return;
      }
      setAppliedVoucher(voucher);
    } catch {
      setVoucherError('Không thể kiểm tra mã giảm giá');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em]">Thanh toán</h1>
        <div className="w-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 p-6 lg:p-12 lg:border-r border-gray-100">
          <div className="max-w-[540px] ml-auto space-y-12">
            {/* Logo / Back to Cart (Desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-12">
              <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">FITGEAR</Link>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors">
                <ChevronLeft size={14} />
                Quay lại giỏ hàng
              </button>
            </div>

            {/* Contact Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <h2 className="text-[12px] font-black uppercase tracking-wider">Liên hệ</h2>
                <button className="text-[11px] font-bold uppercase tracking-widest underline underline-offset-4">Đăng nhập</button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-brand-dark" />
                  <span className="text-[11px] font-medium text-gray-500 leading-tight group-hover:text-brand-dark transition-colors">
                    Đăng ký nhận email về sản phẩm mới, khuyến mãi và các nội dung độc quyền.
                  </span>
                </label>
              </div>
            </section>

            {/* Delivery Section */}
            <section className="space-y-4">
              <h2 className="text-[12px] font-black uppercase tracking-wider">Giao hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <select className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm bg-white appearance-none">
                    <option>Việt Nam</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Họ"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                />
                <input
                  type="text"
                  placeholder="Tên"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                />
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Thành phố"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                />
                <input
                  type="text"
                  placeholder="Mã bưu điện (Tùy chọn)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                />
                <div className="md:col-span-2 relative">
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border-2 border-gray-200 p-4 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Info size={16} />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="space-y-4">
              <h2 className="text-[12px] font-black uppercase tracking-wider">Phương thức vận chuyển</h2>
              <div className="p-4 bg-gray-50 border-2 border-transparent rounded-sm text-[11px] font-medium text-gray-500 text-center uppercase tracking-widest">
                Vui lòng nhập địa chỉ để xem các phương thức vận chuyển khả dụng.
              </div>
            </section>

            {/* Payment Section */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-[12px] font-black uppercase tracking-wider">Thanh toán</h2>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Tất cả giao dịch đều được bảo mật và mã hóa.</p>
              </div>
              <div className="border-2 border-gray-200 rounded-sm divide-y divide-gray-200">
                <label className="flex items-center justify-between p-4 cursor-pointer bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-brand-dark" />
                    <span className="text-sm font-bold uppercase tracking-widest">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 cursor-pointer opacity-50">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" disabled className="w-4 h-4 accent-brand-dark" />
                    <span className="text-sm font-bold uppercase tracking-widest">Thẻ tín dụng (Sắp ra mắt)</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-gray-200 rounded-sm" />
                    <div className="w-8 h-5 bg-gray-200 rounded-sm" />
                    <div className="w-8 h-5 bg-gray-200 rounded-sm" />
                  </div>
                </label>
              </div>
            </section>

            <div className="pt-8">
              <button
                className="w-full bg-brand-dark text-white py-6 font-black uppercase text-sm tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
              >
                <Lock size={16} />
                Đặt hàng ngay
              </button>
            </div>

            <footer className="pt-12 pb-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <Link to="#" className="hover:text-brand-dark">Chính sách bảo mật</Link>
                <Link to="#" className="hover:text-brand-dark">Chính sách hoàn tiền</Link>
                <Link to="#" className="hover:text-brand-dark">Điều khoản dịch vụ</Link>
              </div>
            </footer>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-5 bg-gray-50/50 p-6 lg:p-12">
          <div className="max-w-[420px] mr-auto space-y-8">
            {/* Product List */}
            <div className="space-y-6">
              {cart.map((item, idx) => {
                const productImage = item.product.primary_image;
                return (
                  <div key={`${item.product.product_id}-${idx}`} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-white border border-gray-200 rounded-sm shrink-0 overflow-hidden">
                      <img
                        src={productImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-[10px] font-black flex items-center justify-center rounded-full z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[12px] font-black uppercase tracking-tight truncate">{item.product.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {(item.product.category_id !== 3 && item.product.category_id !== 4) ? `${item.size} / ` : ''}{item.color}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.base_price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Discount Code */}
            <div className="space-y-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Mã giảm giá hoặc thẻ quà tặng"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 border-2 border-gray-200 p-3 rounded-sm focus:border-brand-dark outline-none transition-colors font-medium text-sm bg-white"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="bg-brand-dark text-white px-6 py-3 uppercase text-[11px] font-black tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && <p className="text-red-500 text-xs font-bold">{voucherError}</p>}
              {appliedVoucher && <p className="text-green-600 text-xs font-bold">Đã áp dụng mã: {appliedVoucher.code}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-[13px] font-medium">
                <span className="text-gray-500 uppercase tracking-widest text-[11px] font-black">Tạm tính</span>
                <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-medium">
                <span className="text-gray-500 uppercase tracking-widest text-[11px] font-black">Vận chuyển</span>
                <span className="font-bold">
                  {shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[13px] font-medium text-green-600">
                  <span className="uppercase tracking-widest text-[11px] font-black">Giảm giá ({appliedVoucher?.code})</span>
                  <span className="font-bold">
                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <span className="text-[18px] font-black uppercase tracking-widest">Tổng cộng</span>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Bao gồm VAT</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-gray-400 mr-2">VND</span>
                  <span className="text-[18px] font-black">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
