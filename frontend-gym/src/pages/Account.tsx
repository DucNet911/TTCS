import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Calendar, LogOut, ChevronRight, Package, Heart, Settings, Clock, CheckCircle2, AlertCircle, Truck, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderItem } from '../types';
import { orderAPI, customerAPI, catalogAPI } from '../api';

export const Account = () => {
  const { user, login, register, updateProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.search]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<number, any[]>>({});

  // State cho chỉnh sửa thông tin cá nhân
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // State cho Mục tiêu thể hình
  const [allGoals, setAllGoals] = useState<{ goal_id: number; name: string; description: string }[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<number[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsSaveSuccess, setGoalsSaveSuccess] = useState('');

  // Khởi tạo giá trị edit khi user thay đổi
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      
      if (user.birth_date) {
        try {
          setEditBirthDate(new Date(user.birth_date).toISOString().split('T')[0]);
        } catch {
          setEditBirthDate('');
        }
      } else {
        setEditBirthDate('');
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      orderAPI.getAll({ customer_id: user.customer_id })
        .then(async (orders) => {
          setUserOrders(orders);
          
          const itemsMap: Record<number, any[]> = {};
          await Promise.all(
            orders.map(async (order) => {
              try {
                const detail = await orderAPI.getById(order.order_id);
                itemsMap[order.order_id] = detail.items || [];
              } catch {
                itemsMap[order.order_id] = [];
              }
            })
          );
          setOrderItemsMap(itemsMap);
        })
        .catch(() => setUserOrders([]));
    }
  }, [user]);

  // Load danh sách Fitness Goals từ DB + mục tiêu đã chọn của khách
  useEffect(() => {
    catalogAPI.getGoals().then(setAllGoals).catch(() => {});
    if (user && user.role !== 'admin') {
      customerAPI.getGoals(user.customer_id)
        .then(goals => setSelectedGoalIds(goals.map(g => g.goal_id)))
        .catch(() => {});
    }
  }, [user]);

  const getOrderItems = (orderId: number): any[] => {
    return orderItemsMap[orderId] || [];
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'Confirmed': return <Clock size={16} className="text-blue-500" />;
      case 'Shipping': return <Truck size={16} className="text-purple-500" />;
      case 'Pending': return <AlertCircle size={16} className="text-yellow-500" />;
      case 'Canceled': return <AlertCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'Completed': return 'Hoàn thành';
      case 'Confirmed': return 'Đang chuẩn bị';
      case 'Shipping': return 'Đang giao hàng';
      case 'Pending': return 'Chờ xác nhận';
      case 'Canceled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    birth_date: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
          phone: formData.phone,
          address: formData.address,
          birth_date: formData.birth_date,
          gender: formData.gender
        });
      }
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-brand-light py-20 px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-sm shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center text-2xl font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[14px] font-black uppercase tracking-tight">{user.name}</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center justify-between p-4 font-black uppercase text-[11px] tracking-widest rounded-sm transition-all ${activeTab === 'profile' ? 'bg-brand-light text-brand-dark' : 'text-gray-400 hover:bg-brand-light hover:text-brand-dark'}`}
                >
                  <div className="flex items-center gap-3">
                    <User size={16} />
                    Hồ sơ của tôi
                  </div>
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between p-4 font-black uppercase text-[11px] tracking-widest rounded-sm transition-all ${activeTab === 'orders' ? 'bg-brand-light text-brand-dark' : 'text-gray-400 hover:bg-brand-light hover:text-brand-dark'}`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} />
                    Đơn hàng
                    {userOrders.length > 0 && (
                      <span className="bg-brand-dark text-white text-[8px] px-1.5 py-0.5 rounded-full">
                        {userOrders.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center justify-between p-4 hover:bg-brand-light text-gray-400 hover:text-brand-dark font-black uppercase text-[11px] tracking-widest rounded-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} />
                    Yêu thích
                  </div>
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center justify-between p-4 font-black uppercase text-[11px] tracking-widest rounded-sm transition-all ${activeTab === 'settings' ? 'bg-brand-light text-brand-dark' : 'text-gray-400 hover:bg-brand-light hover:text-brand-dark'}`}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={16} />
                    Cài đặt
                  </div>
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-500 font-black uppercase text-[11px] tracking-widest rounded-sm transition-all mt-8"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={16} />
                    Đăng xuất
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' ? (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-8 md:p-12 rounded-sm shadow-sm"
                >
                  <h1 className="text-[24px] font-black uppercase tracking-tighter mb-12">Thông tin cá nhân</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</p>
                      <p className="text-sm font-bold">{user.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</p>
                      <p className="text-sm font-bold">{user.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày sinh</p>
                      <p className="text-sm font-bold">{user.birth_date ? new Date(user.birth_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ</p>
                      <p className="text-sm font-bold">{user.address || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giới tính</p>
                      <p className="text-sm font-bold uppercase">{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tham gia</p>
                      <p className="text-sm font-bold">{new Date(user.register_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="mt-16 pt-12 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[14px] font-black uppercase tracking-tighter">Đơn hàng gần đây</h3>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-all"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    {userOrders.length > 0 ? (
                      <div className="space-y-4">
                        {userOrders.slice(0, 2).map((order) => (
                          <div key={order.order_id} className="flex items-center justify-between p-4 bg-brand-light rounded-sm">
                            <div className="flex items-center gap-4">
                              <div className="bg-white p-2 rounded-sm">
                                <Package size={20} className="text-brand-dark" />
                              </div>
                              <div>
                                <p className="text-xs font-bold">#ORD-{order.order_id}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black">{formatPrice(order.total_amount)}</p>
                              <div className="flex items-center gap-1 justify-end mt-1">
                                {getStatusIcon(order.status)}
                                <span className="text-[8px] font-black uppercase tracking-widest">{getStatusText(order.status)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Bạn chưa có đơn hàng nào</p>
                    )}
                  </div>
                </motion.div>
              ) : activeTab === 'orders' ? (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-8 md:p-12 rounded-sm shadow-sm"
                >
                  <h2 className="text-[18px] font-black uppercase tracking-tighter mb-8">Lịch sử mua hàng</h2>
                  {userOrders.length > 0 ? (
                    <div className="space-y-6">
                      {userOrders.map((order) => (
                        <div key={order.order_id} className="border border-gray-100 rounded-sm overflow-hidden">
                          <div className="bg-brand-light p-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-6">
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn hàng</p>
                                <p className="text-xs font-bold">#ORD-{order.order_id}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày đặt</p>
                                <p className="text-xs font-bold">{new Date(order.order_date).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</p>
                                <p className="text-xs font-bold text-brand-dark">{formatPrice(order.total_amount)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
                              {getStatusIcon(order.status)}
                              <span className="text-[10px] font-black uppercase tracking-widest">{getStatusText(order.status)}</span>
                            </div>
                          </div>
                          <div className="p-4 space-y-4">
                            {getOrderItems(order.order_id).map((item) => {
                              const productImage = item.image_url || item.primary_image || item.image || '';
                              const productName = item.product_name || item.product?.name || '';
                              const sizeName = item.size_name || item.size?.name || '';
                              const colorName = item.color_name || item.color?.name || '';
                              
                              return (
                                <div key={item.order_item_id} className="flex gap-4">
                                  <div className="w-16 h-20 bg-brand-light rounded-sm overflow-hidden flex-shrink-0">
                                    {productImage ? (
                                      <img 
                                        src={productImage} 
                                        alt={productName} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">No Image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black uppercase truncate">{productName}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                      Size: {sizeName} | Màu: {colorName}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                      <p className="text-xs font-bold">x{item.quantity}</p>
                                      <p className="text-xs font-black">{formatPrice(item.price_at_order)}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="p-4 border-t border-gray-50 flex justify-end">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="text-[10px] font-black uppercase tracking-widest hover:underline"
                            >
                              Xem chi tiết đơn hàng
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-100 rounded-sm p-12 text-center">
                      <Package size={48} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Bạn chưa có đơn hàng nào</p>
                      <button 
                        onClick={() => navigate('/')}
                        className="mt-6 text-xs font-black uppercase tracking-widest underline underline-offset-8 decoration-2 decoration-gray-100 hover:decoration-brand-dark transition-all"
                      >
                        Bắt đầu mua sắm
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-8 md:p-12 rounded-sm shadow-sm"
                >
                  <h2 className="text-[18px] font-black uppercase tracking-tighter mb-8">Cài đặt tài khoản</h2>
                  
                  <div className="space-y-8">
                    <div className="p-6 bg-brand-light rounded-sm">
                      <h3 className="text-sm font-black uppercase mb-4">Chỉnh sửa thông tin cá nhân</h3>
                      <p className="text-xs text-gray-500 mb-6 font-medium">Cập nhật thông tin liên lạc và địa chỉ giao hàng của bạn.</p>
                      
                      {saveSuccess && (
                        <div className="bg-green-50 text-green-600 p-3 text-xs font-bold uppercase tracking-widest mb-4 border-l-4 border-green-500 flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          {saveSuccess}
                        </div>
                      )}
                      {saveError && (
                        <div className="bg-red-50 text-red-500 p-3 text-xs font-bold uppercase tracking-widest mb-4 border-l-4 border-red-500">
                          {saveError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Họ và tên</label>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white border-none py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-dark transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Số điện thoại</label>
                          <input 
                            type="tel" 
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-white border-none py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-dark transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày sinh</label>
                          <input 
                            type="date" 
                            value={editBirthDate}
                            onChange={(e) => setEditBirthDate(e.target.value)}
                            className="w-full bg-white border-none py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-dark transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Địa chỉ</label>
                          <input 
                            type="text" 
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full bg-white border-none py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-dark transition-all"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={async () => {
                          setSaveLoading(true);
                          setSaveSuccess('');
                          setSaveError('');
                          try {
                            await updateProfile({
                              name: editName,
                              phone: editPhone,
                              address: editAddress,
                              birth_date: editBirthDate || undefined,
                            });
                            setSaveSuccess('Cập nhật thông tin thành công!');
                            setTimeout(() => setSaveSuccess(''), 3000);
                          } catch (err: any) {
                            setSaveError(err.message || 'Cập nhật thất bại');
                          } finally {
                            setSaveLoading(false);
                          }
                        }}
                        disabled={saveLoading}
                        className="bg-brand-dark text-white px-6 py-3 uppercase text-[10px] font-black tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-400"
                      >
                        {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>

                    {/* === MỤC TIÊU THỂ HÌNH === */}
                    <div className="p-6 bg-brand-light rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={18} className="text-brand-dark" />
                        <h3 className="text-sm font-black uppercase">Mục tiêu thể hình</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-6 font-medium">Chọn mục tiêu để hệ thống gợi ý sản phẩm phù hợp dành riêng cho bạn trên Trang chủ.</p>

                      {goalsSaveSuccess && (
                        <div className="bg-green-50 text-green-600 p-3 text-xs font-bold uppercase tracking-widest mb-4 border-l-4 border-green-500 flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          {goalsSaveSuccess}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {allGoals.map(goal => (
                          <label 
                            key={goal.goal_id} 
                            className={`flex items-start gap-3 p-4 rounded-sm cursor-pointer transition-all border-2 ${
                              selectedGoalIds.includes(goal.goal_id) 
                                ? 'border-brand-dark bg-white shadow-sm' 
                                : 'border-transparent bg-white/60 hover:bg-white'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedGoalIds.includes(goal.goal_id)}
                              onChange={() => {
                                setSelectedGoalIds(prev => 
                                  prev.includes(goal.goal_id) 
                                    ? prev.filter(id => id !== goal.goal_id) 
                                    : [...prev, goal.goal_id]
                                );
                              }}
                              className="mt-0.5 accent-brand-dark w-4 h-4"
                            />
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{goal.name}</p>
                              {goal.description && (
                                <p className="text-[10px] text-gray-400 font-medium mt-1">{goal.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>

                      <button 
                        onClick={async () => {
                          if (!user) return;
                          setGoalsLoading(true);
                          setGoalsSaveSuccess('');
                          try {
                            await customerAPI.updateGoals(user.customer_id, selectedGoalIds);
                            setGoalsSaveSuccess('Đã lưu mục tiêu! Xem gợi ý sản phẩm trên Trang chủ.');
                            setTimeout(() => setGoalsSaveSuccess(''), 4000);
                          } catch (err: any) {
                            setSaveError(err.message || 'Lưu mục tiêu thất bại');
                          } finally {
                            setGoalsLoading(false);
                          }
                        }}
                        disabled={goalsLoading}
                        className="bg-brand-dark text-white px-6 py-3 uppercase text-[10px] font-black tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-400"
                      >
                        {goalsLoading ? 'Đang lưu...' : 'Lưu mục tiêu'}
                      </button>
                    </div>

                    <div className="p-6 border border-gray-100 rounded-sm">
                      <h3 className="text-sm font-black uppercase mb-4">Đổi mật khẩu</h3>
                      <p className="text-xs text-gray-500 mb-6 font-medium">Đảm bảo tài khoản của bạn được bảo mật bằng mật khẩu mạnh.</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mật khẩu hiện tại</label>
                          <input 
                            type="password" 
                            className="w-full bg-brand-light border-none py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-dark transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mật khẩu mới</label>
                          <input 
                            type="password" 
                            className="w-full bg-brand-light border-none py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-brand-dark transition-all"
                          />
                        </div>
                      </div>

                      <button className="border border-brand-dark text-brand-dark px-6 py-3 uppercase text-[10px] font-black tracking-widest hover:bg-brand-dark hover:text-white transition-all">
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal Chi tiết đơn hàng */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white p-8 rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <h2 className="text-lg font-black uppercase mb-6">Chi tiết đơn hàng #ORD-{selectedOrder.order_id}</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày đặt</p>
                    <p className="font-bold">{new Date(selectedOrder.order_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="font-bold text-xs">{getStatusText(selectedOrder.status)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phương thức thanh toán</p>
                    <p className="font-bold">{selectedOrder.payment_method || 'Thanh toán khi nhận hàng (COD)'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ giao hàng</p>
                    <p className="font-bold">{selectedOrder.shipping_address || user.address}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-black uppercase mb-4">Sản phẩm</h3>
                  <div className="space-y-4">
                    {getOrderItems(selectedOrder.order_id).map((item) => {
                      const productImage = item.image_url || item.primary_image || item.image || '';
                      const productName = item.product_name || item.product?.name || '';
                      const sizeName = item.size_name || item.size?.name || '';
                      const colorName = item.color_name || item.color?.name || '';
                      
                      return (
                        <div key={item.order_item_id} className="flex gap-4 items-center">
                          <div className="w-12 h-16 bg-brand-light rounded-sm overflow-hidden flex-shrink-0">
                            {productImage ? (
                              <img 
                                src={productImage} 
                                alt={productName} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[6px] font-black uppercase tracking-widest text-gray-300">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-black uppercase">{productName}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              Size: {sizeName} | Màu: {colorName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">x{item.quantity}</p>
                            <p className="text-xs font-black">{formatPrice(item.price_at_order)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Tạm tính</span>
                    <span className="font-bold">{formatPrice(Number(selectedOrder.total_amount) - Number(selectedOrder.shipping?.shipping_fee || 0) + Number(selectedOrder.discount_amount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Phí vận chuyển</span>
                    <span className="font-bold">{formatPrice(selectedOrder.shipping?.shipping_fee || 0)}</span>
                  </div>
                  {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-bold">Giảm giá</span>
                      <span className="font-bold">-{formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base border-t border-gray-100 pt-2">
                    <span className="font-black uppercase tracking-widest">Tổng cộng</span>
                    <span className="font-black text-brand-dark">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="bg-brand-dark text-white px-6 py-3 uppercase text-[10px] font-black tracking-widest hover:bg-gray-800 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-[500px]">
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-xl">
          <div className="text-center mb-12">
            <h1 className="text-[30px] font-black uppercase tracking-tighter mb-4">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              {isLogin ? 'Chào mừng bạn quay trở lại với FITGEAR.' : 'Tham gia cộng đồng FITGEAR ngay hôm nay.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 text-xs font-bold uppercase tracking-widest mb-8 border-l-4 border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-brand-light border-none py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-brand-light border-none py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-brand-light border-none py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-brand-light border-none py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                        placeholder="0123..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ngày sinh</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        className="w-full bg-brand-light border-none py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Địa chỉ</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-brand-light border-none py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-brand-light border-none py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-dark transition-all appearance-none"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark text-white py-5 font-black uppercase text-sm tracking-[0.2em] hover:bg-gray-800 transition-all disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black uppercase tracking-widest underline underline-offset-8 decoration-2 decoration-gray-100 hover:decoration-brand-dark transition-all"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
